// src/api/axiosInstance.js
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080/api
    withCredentials: true, // envoie le cookie httpOnly automatiquement
});

// ── Attache l'access token à chaque requête ───────────────────────────────
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Si 401 → refresh automatique puis rejoue la requête ──────────────────
let isRefreshing = false;
let pendingRequests = []; // file des requêtes en attente pendant le refresh

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Evite la boucle infinie si le refresh lui-même échoue
        if (error.response?.status === 401 && !originalRequest._retry) {
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
                // Cookie httpOnly envoyé automatiquement
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = data.data.token; // data.data car ApiResponse wrapper

                useAuthStore.getState().setAuth(newToken, useAuthStore.getState().user);

                // Débloque toutes les requêtes en attente
                pendingRequests.forEach(({ resolve }) => resolve(newToken));
                pendingRequests = [];

                // Rejoue la requête originale
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh token expiré → logout forcé
                pendingRequests.forEach(({ reject }) => reject(refreshError));
                pendingRequests = [];
                useAuthStore.getState().clearAuth();
                window.location.href = "/login";
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;