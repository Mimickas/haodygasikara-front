import { create } from "zustand";

export const useAuthStore = create((set) => ({
    accessToken: null,
    user: null,

    // Le jeton vit en memoire : il est perdu a chaque rechargement et
    // reconstruit via le cookie httpOnly. Ce drapeau dit si cette tentative
    // a eu lieu — sans lui, on ne sait pas distinguer « pas connecte » de
    // « pas encore verifie ».
    sessionRestauree: false,

    setAuth: (token, user) => set({ accessToken: token, user }),
    clearAuth: () => set({ accessToken: null, user: null }),
    finRestauration: () => set({ sessionRestauree: true }),
}));