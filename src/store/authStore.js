import { create } from "zustand";

// Se résout quand la restauration de session du démarrage est finie, qu'elle
// ait réussi ou non. Les requêtes parties avant l'attendent (axiosInstance) :
// sinon elles voyageraient sans jeton, et une page qui charge à l'ouverture
// (« Mes circuits », un circuit à soi) recevrait « introuvable » alors que le
// voyageur est bel et bien connecté.
let signalerRestauration;
export const restaurationTerminee = new Promise((resolve) => { signalerRestauration = resolve; });

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
    finRestauration: () => {
        set({ sessionRestauree: true });
        signalerRestauration?.();
    },

    // Retouche du compte en place, sans toucher au jeton.
    //
    // La page de parametres en a besoin : quand la photo ou le prenom change,
    // la barre d'en-tete doit suivre immediatement. Sans cela elle afficherait
    // le monogramme et l'ancien prenom jusqu'au prochain rechargement complet,
    // alors que la modification est deja enregistree — et l'ecran donnerait
    // l'impression de n'avoir rien fait.
    //
    // Fusion et non remplacement : un appel qui ne connait que `photoUrl` ne
    // doit pas effacer le role et l'email au passage.
    majUser: (partiel) =>
        set((etat) => (etat.user ? { user: { ...etat.user, ...partiel } } : {})),
}));