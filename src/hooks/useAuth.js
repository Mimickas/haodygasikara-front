// src/hooks/useAuth.js
import { useAuthStore } from "../store/authStore";
import { loginApi, loginGoogleApi, logoutApi, refreshSessionApi } from "../api/authApi";
import { useNavigate, useLocation } from "react-router-dom";

export function useAuth() {
    const { accessToken, user, setAuth, clearAuth, majUser } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Ouvre la session a partir d'une reponse d'authentification (mot de
    // passe ou Google) puis redirige.
    //
    // `destination` : la page d'ou l'utilisateur a ete refoule, transmise
    // par ProtectedRoute. A defaut, on rentre a l'accueil.
    // `adminOnly` : la connexion de l'administration refuse un compte client
    // — il serait connecte, puis renvoye sur un espace qui lui dit non.
    const ouvrirSession = async (response, { destination, adminOnly = false } = {}) => {
        const { token, email, nom, prenom, role, photoUrl } = response.data;
        const estAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

        if (adminOnly && !estAdmin) {
            await logoutApi().catch(() => {});      // le cookie de renouvellement part aussi
            const refus = new Error("Ce compte n'a pas accès à l'administration.");
            refus.response = { data: { message: refus.message, code: "FORBIDDEN" } };
            throw refus;
        }

        setAuth(token, { email, nom, prenom, role, photoUrl });

        // Redirection selon le rôle. Pour un client, on repart de préférence
        // vers la page d'où ProtectedRoute l'avait refoulé.
        if (estAdmin) {
            navigate("/admin/haodygasikara", { replace: true });
        } else {
            navigate(destination || "/", { replace: true });
        }
    };

    // Compatibilite : `login(identifiants, "/page")` ou `login(identifiants, { adminOnly })`.
    const login = async (credentials, options) => {
        const opts = typeof options === "string" || options == null ? { destination: options } : options;
        return ouvrirSession(await loginApi(credentials), opts);
    };

    // Connexion Google : le jeton d'acces obtenu par la fenetre Google est
    // verifie par le serveur, qui ouvre la meme session qu'un mot de passe.
    const loginGoogle = async (accessToken, options) => {
        const opts = typeof options === "string" || options == null ? { destination: options } : options;
        return ouvrirSession(await loginGoogleApi(accessToken), opts);
    };

    const restoreSession = async () => {
        try {
            const response = await refreshSessionApi();
            // data = null : aucun cookie de session, le visiteur n'est pas connecté
            if (!response.data) { clearAuth(); return; }
            const { token, email, nom, prenom, role, photoUrl } = response.data;
            setAuth(token, { email, nom, prenom, role, photoUrl });
        } catch {
            clearAuth(); // pas de session valide → reste déconnecté
        }
    };

    const logout = async () => {
        // Serveur injoignable : on ferme quand même la session de ce côté-ci
        await logoutApi().catch(() => {});
        clearAuth();

        // Redirect vers le bon login selon là où on est
        const isAdmin = location.pathname.startsWith("/admin");
        navigate(isAdmin ? "/admin/haodygasikara/login" : "/login");
    };
    return {
        accessToken,
        user,
        isAuthenticated: !!accessToken,
        login,
        loginGoogle,
        logout,
        restoreSession,   // manquait : AuthProvider l'appelait et plantait
        setAuth,          // le changement d'adresse rend une paire de jetons neufs
        majUser,          // retouche du compte en place, sans toucher au jeton
    };
}