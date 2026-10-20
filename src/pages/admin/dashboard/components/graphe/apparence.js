// ── L'apparence des graphiques du tableau de bord ─────────────────────────
//
// Recharts écrit les couleurs en attributs SVG, où var() ne passe pas partout :
// d'où les valeurs, avec le jeton d'où elles viennent. Le lagon de la charte,
// un cran plus profond pour qu'une barre se détache nettement du gris ; paires
// vérifiées au script (écart en vision normale et daltonienne, contraste sur
// la carte). Le gris reste sous 3:1 : chaque barre porte donc son chiffre, et
// chaque graphique a son tableau.

export const ACCENT = "#2F6E82";       // la barre en tête, les devis acceptés
export const LAGUNE_CLAIR = "#93AFB9"; // les autres demandes : même teinte, plus claire
export const GRIS = "#B5A999";         // le reste du classement
export const SURFACE = "#FDFBF6";      // --bg-card : l'écart de 2 px entre deux segments
export const ENCRE = "#2B211A";        // --text-primary
export const ENCRE_DOUCE = "#5A4B3E";  // --text-secondary
export const FILET = "#E3DACB";        // --border

// Une ligne par catégorie, des barres fines qui laissent de l'air entre elles
export const HAUTEUR_LIGNE = 36;
export const EPAISSEUR = 18;
export const LARGEUR_NOMS = 150;
export const MARGES = { top: 4, right: 40, bottom: 4, left: 0 };
export const SURVOL = { fill: "rgba(43, 33, 26, 0.04)" };

export const hauteurGraphe = (lignes) => lignes * HAUTEUR_LIGNE + 8;
