import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Garde de route.
 *
 * Ne tente plus lui-meme de rafraichir la session : AuthProvider s'en charge
 * une fois pour toutes a la racine. Deux composants qui appelaient
 * /auth/refresh chacun de leur cote se couraient apres.
 */
export default function ProtectedRoute({ children, role }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);
    const sessionRestauree = useAuthStore((s) => s.sessionRestauree);
    const location = useLocation();

    // Chaque espace a son propre login
    const loginPath = location.pathname.startsWith("/admin")
        ? "/admin/haodygasikara/login"
        : "/login";

    // Tant que la tentative de restauration n'a pas eu lieu, on ne sait pas
    // encore si l'utilisateur est connecte : rediriger ici le ferait sortir
    // a chaque rechargement.
    if (!sessionRestauree) {
        return (
            <div
                className="flex items-center justify-center h-screen"
                style={{ backgroundColor: "var(--bg)" }}
            >
                <span
                    className="font-body-strong text-[10px] uppercase tracking-[0.45em]"
                    style={{ color: "var(--text-muted)" }}
                >
                    Un instant
                </span>
            </div>
        );
    }

    // On garde d'ou l'on vient : la page de connexion pourra y renvoyer
    if (!accessToken) {
        return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
    }

    if (role && user?.role !== role) {
        return <Navigate to={loginPath} replace />;
    }

    return children;
}
