// src/api/authApi.js
import axios from "axios";
import api from "./axiosInstance";
import { useAuthStore } from "../store/authStore";

// Login — axios direct car pas encore de token
export const loginApi = async (credentials) => {
    const { data } = await api.post(
        `/auth/login`,
        credentials,
        { withCredentials: true }
    );
    return data; // ApiResponse complet
};

// Logout
export const logoutApi = async () => {
    await api.post("/auth/logout");
    useAuthStore.getState().clearAuth();
};

// Register
export const registerApi = async (userData) => {
    const { data } = await api.post(
        `/auth/register`,
        userData
    );
    return data;
};

// Register admin — passe par axiosInstance car ça nécessite un token super-admin
export const registerAdminApi = async (userData) => {
    const { data } = await api.post("/auth/register-admin", userData);
    return data;
};

// Vérifie si la session est encore active au reload de page
export const refreshSessionApi = async () => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
    );
    return data;
};

// Verification par code a 6 chiffres — { email, code }
export const verifyCodeApi = async (payload) => {
    const { data } = await api.post("/auth/verify", payload);
    return data;
};

// Renvoi d'un nouveau code — { email }
export const resendCodeApi = async (payload) => {
    const { data } = await api.post("/auth/resend-code", payload);
    return data;
};
