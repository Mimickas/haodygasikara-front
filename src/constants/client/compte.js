// Le compte porte maintenant une photo (`photoUrl`), reglee depuis la page de
// parametres. Le monogramme reste le cas NOMINAL pour qui n'en a pas mis — ce
// n'est pas un repli d'erreur, c'est le dessin d'origine. Le choix entre les
// deux est fait une seule fois, dans `components/client/compte/Avatar`.
export const initiales = (user) =>
    `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase() || "—";
