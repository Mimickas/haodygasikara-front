import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../../api/axiosInstance";
import { messageErreurApi } from "../../../utils/auth";

// ── « Continuer avec Google » ──────────────────────────────────────────────
//
// La fenêtre Google (Google Identity Services, client « jeton ») renvoie un
// jeton d'accès ; le serveur le vérifie auprès de Google puis ouvre la même
// session qu'un mot de passe. L'identifiant client vient du SERVEUR : un seul
// endroit à configurer (application.properties).
//
// Tout est préparé à l'affichage de la page (script chargé, client prêt) : au
// clic, la fenêtre s'ouvre tout de suite. Ouverte après un aller-retour
// réseau, elle serait prise pour une publicité et bloquée par le navigateur.

let promesseScript = null;
const chargerScriptGoogle = () => {
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (!promesseScript) {
        promesseScript = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.onload = resolve;
            script.onerror = () => {
                promesseScript = null;
                reject(new Error("Le service Google est injoignable. Réessayez dans un instant."));
            };
            document.head.appendChild(script);
        });
    }
    return promesseScript;
};

const INDISPONIBLE = "La connexion avec Google n'est pas encore disponible. Utilisez votre adresse e-mail.";

export function useConnexionGoogle(onJeton) {
    const [etat, setEtat] = useState("preparation");   // preparation | pret | indisponible
    const [enCours, setEnCours] = useState(false);
    const [erreur, setErreur] = useState("");
    const client = useRef(null);
    const rappel = useRef(onJeton);
    useEffect(() => { rappel.current = onJeton; }, [onJeton]);

    useEffect(() => {
        let vivant = true;
        (async () => {
            try {
                const { data } = await api.get("/auth/google");
                const clientId = data?.data?.clientId;
                if (!clientId) throw new Error(INDISPONIBLE);
                await chargerScriptGoogle();
                if (!vivant) return;
                client.current = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: "openid email profile",
                    callback: async (reponse) => {
                        if (reponse?.error || !reponse?.access_token) {
                            setErreur("La connexion avec Google a été annulée.");
                            setEnCours(false);
                            return;
                        }
                        try {
                            await rappel.current(reponse.access_token);
                        } catch (error) {
                            setErreur(messageErreurApi(error, "La connexion avec Google a échoué. Réessayez."));
                        } finally {
                            setEnCours(false);
                        }
                    },
                    error_callback: (e) => {
                        setErreur(e?.type === "popup_closed"
                            ? "La fenêtre Google a été fermée avant la fin."
                            : "La fenêtre Google n'a pas pu s'ouvrir. Autorisez les fenêtres pour ce site.");
                        setEnCours(false);
                    },
                });
                setEtat("pret");
            } catch {
                if (vivant) setEtat("indisponible");
            }
        })();
        return () => { vivant = false; };
    }, []);

    const lancer = useCallback(() => {
        setErreur("");
        if (etat === "indisponible") { setErreur(INDISPONIBLE); return; }
        if (!client.current) { setErreur("Google se prépare, réessayez dans une seconde."); return; }
        setEnCours(true);
        client.current.requestAccessToken({ prompt: "select_account" });
    }, [etat]);

    return { lancer, enCours, erreur, disponible: etat !== "indisponible" };
}
