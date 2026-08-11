// src/hooks/useAuth.js
import { useAuthStore } from "../store/authStore";
import { loginApi, logoutApi, refreshSessionApi } from "../api/authApi"; // supprime refreshSessionApi
import { useNavigate, useLocation } from "react-router-dom";

export function useAuth() {
    const { accessToken, user, setAuth, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const login = async (credentials) => {
        const response = await loginApi(credentials);
        const { token, email, nom, prenom, role } = response.data;

        setAuth(token, { email, nom, prenom, role });

        // Redirect selon le rôle
        if (role === "ADMIN" || role === "SUPER_ADMIN") {
            navigate("/admin/haodygasikara");
        } else {
            navigate("/");
        }
    };

    const restoreSession = async () => {
        try {
            const response = await refreshSessionApi();
            const { token, email, nom, prenom, role } = response.data;
            setAuth(token, { email, nom, prenom, role });
        } catch {
            clearAuth(); // pas de session valide → reste déconnecté
        }
    };

    const logout = async () => {
        await logoutApi();
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
        logout,
    };
}