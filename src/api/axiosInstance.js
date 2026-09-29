// src/api/axiosInstance.js
import axios from "axios";
import { restaurationTerminee, useAuthStore } from "../store/authStore";
import { renouvelerSession } from "./renouvellement";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080/api
    withCredentials: true, // envoie le cookie httpOnly automatiquement
});

// ── Attache l'access token à chaque requête ───────────────────────────────
//
// Au démarrage, le jeton se reconstruit depuis le cookie (AuthProvider). Une
// requête partie avant l'attend — quelques dizaines de millisecondes —, au
// plus 6 secondes si le serveur tarde : elle partira alors sans jeton.
const ATTENTE_MAX_MS = 6000;
api.interceptors.request.use(async (config) => {
    if (!useAuthStore.getState().sessionRestauree && !String(config.url ?? "").includes("/auth/")) {
        await Promise.race([restaurationTerminee, new Promise((r) => setTimeout(r, ATTENTE_MAX_MS))]);
    }
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Si 401 → refresh automatique puis rejoue la requête ──────────────────
let isRefreshing = false;
let pendingRequests = []; // file des requêtes en attente pendant le refresh

// Les routes d'authentification répondent 401 pour dire « mauvais
// identifiants », pas « jeton expiré ». Les rafraîchir n'a aucun sens — et
// la redirection forcée qui suivait l'échec du rafraîchissement RECHARGEAIT
// la page de connexion : le message « mot de passe incorrect » disparaissait
// avant d'avoir été lu.
const estRouteAuth = (url = "") => url.includes("/auth/");

// Un 401 ne justifie un rafraîchissement que si la requête PORTAIT un jeton :
// c'est lui qui a expiré. Sans jeton (visiteur), 401 veut seulement dire
// « connectez-vous » — la page le gère, on ne la redirige pas de force.
const portaitUnJeton = (config) => Boolean(config?.headers?.Authorization);

// « Mot de passe incorrect » en changeant d'adresse ou de mot de passe : le
// jeton est bon, c'est la saisie qui ne l'est pas. Rafraîchir puis rejouer
// soumettrait deux fois le même mauvais mot de passe.
const estMauvaisIdentifiant = (error) => error.response?.data?.code === "BAD_CREDENTIALS";

// Session morte : retour à la BONNE page de connexion (client ou admin), et
// jamais de rechargement si l'on y est déjà.
//
// N'est appelée QUE pour une session réellement finie. Un serveur injoignable
// — endormi, en cours de redémarrage — n'a jamais rien dit de la session : y
// renvoyer le voyageur le déconnecte pour rien (cf. api/renouvellement.js).
const renvoyerVersConnexion = () => {
    const admin = window.location.pathname.startsWith("/admin");
    const cible = admin ? "/admin/haodygasikara/login" : "/login";
    if (window.location.pathname !== cible) window.location.assign(cible);
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Evite la boucle infinie si le refresh lui-même échoue
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry
            && !estRouteAuth(originalRequest.url) && portaitUnJeton(originalRequest) && !estMauvaisIdentifiant(error)) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Met en file d'attente si un refresh est déjà en cours
                return new Promise((resolve, reject) => {
                    pendingRequests.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                // Le cookie httpOnly part tout seul. Les reprises, s'il en
                // faut, sont gérées là-bas : un serveur qui se réveille vaut
                // la peine d'être attendu.
                const { jeton, utilisateur } = await renouvelerSession();

                // La réponse porte le compte à jour : on le reprend plutôt que
                // de garder celui d'avant, qui peut être nul (jeton restauré
                // sans que le compte ait jamais été chargé).
                useAuthStore.getState().setAuth(jeton, utilisateur ?? useAuthStore.getState().user);

                // Débloque toutes les requêtes en attente
                pendingRequests.forEach(({ resolve }) => resolve(jeton));
                pendingRequests = [];

                // Rejoue la requête originale
                originalRequest.headers.Authorization = `Bearer ${jeton}`;
                return api(originalRequest);

            } catch (refreshError) {
                pendingRequests.forEach(({ reject }) => reject(refreshError));
                pendingRequests = [];

                // SEULE une session réellement finie déconnecte. Un serveur
                // injoignable n'a rien dit : on garde le jeton et la session,
                // et on laisse l'appel d'origine échouer — la page affichera
                // son propre message, et le geste suivant repartira.
                if (refreshError.sessionFinie) {
                    useAuthStore.getState().clearAuth();
                    renvoyerVersConnexion();
                }
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;