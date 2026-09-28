export const formatDate = (value) => value
    ? new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
    : "—";

// Prix à la française, séparateur de milliers : 250000.5 → "250 000,5"
export const formatPrice = (value) => value != null && value !== ""
    ? new Intl.NumberFormat("fr-FR").format(value)
    : "—";

// Date seule, sans heure : "12 oct. 2026"
export const formatDateCourte = (value) => value
    ? new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// Un texte libre découpé en paragraphes. Le back range les notes d'un circuit
// dans un seul champ : rendu tel quel dans un <p>, ses retours à la ligne sont
// écrasés et tout finit en un pavé. On rend ce que l'auteur a écrit.
export const enParagraphes = (texte) => (texte ?? "")
    .split(/\n+/)
    .map((ligne) => ligne.trim())
    .filter(Boolean);

// Repas compris dans une journée : "Petit-déjeuner · Dîner"
export const formatRepas = (day) => {
    const repas = [
        day?.petitDejeuner && "Petit-déjeuner",
        day?.dejeuner && "Déjeuner",
        day?.diner && "Dîner",
    ].filter(Boolean);
    return repas.length ? repas.join(" · ") : "—";
};

// Un identifiant d'URL à partir d'un nom : « Parc national d'Isalo » → "parc-national-d-isalo"
export const slugifier = (texte) => String(texte ?? "")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
