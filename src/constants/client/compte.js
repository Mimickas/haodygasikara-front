// Une pastille de couleur suffit a porter le statut : pas de badge encadre.
export const COULEUR_STATUT = {
    "Confirmé": "var(--brand-nature)",
    "Envoyé": "var(--brand-lagune)",
    "En attente": "var(--brand-ocre)",
};

// L'API ne renvoie pas de photo de profil : le monogramme est donc le cas
// nominal, pas un repli d'erreur.
export const initiales = (user) =>
    `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase() || "—";
