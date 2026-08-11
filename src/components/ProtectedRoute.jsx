import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, role }) {
    const { accessToken, user, setAuth, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Détermine vers quel login rediriger selon la route actuelle
    const isAdminRoute = location.pathname.startsWith("/admin");
    const loginPath = isAdminRoute ? "/admin/haodygasikara/login" : "/login";

    useEffect(() => {
        if (accessToken) {
            setLoading(false);
            return;
        }

        axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true })
            .then(({ data }) => {
                console.log("REFRESH RESPONSE:", data.data);  // ← ce log
                setAuth(data.data.token, { ...data.data });
            })
            .catch(() => clearAuth())
            .finally(() => setLoading(false));

    }, []);

    if (loading) return <div>Chargement...</div>;

    // Redirige vers le bon login
    if (!accessToken) return <Navigate to={loginPath} replace />;

    // Mauvais rôle
    if (role && user?.role !== role) return <Navigate to={loginPath} replace />;

    return children;
}