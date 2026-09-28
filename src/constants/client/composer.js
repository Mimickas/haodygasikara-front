// Les réglages du créateur de circuit, au même endroit.

export const NUITS_MIN_ETAPE = 1;
export const NUITS_MAX_ETAPE = 30;
export const ETAPES_MAX = 30;

// Attentes avant d'interroger le serveur : assez courtes pour paraître
// instantanées, assez longues pour ne pas partir à chaque lettre tapée.
export const DELAI_RECHERCHE_MS = 280;
export const DELAI_VERIFICATION_MS = 450;

// Distance (px) à parcourir avant qu'un appui sur une fiche devienne un
// glissement : en dessous, c'est un clic, qui ouvre la fiche.
export const SEUIL_GLISSEMENT_PX = 6;

export const TRIS = [
    { valeur: "PERTINENCE", libelle: "Pertinence" },
    { valeur: "PROXIMITE",  libelle: "Proximité" },
    { valeur: "ETOILES",    libelle: "Recommandées" },
    { valeur: "NOM",        libelle: "A → Z" },
];

export const STATUTS_CIRCUIT = {
    BROUILLON: { libelle: "Brouillon", ton: "attente" },
    FINALISE:  { libelle: "Finalisé",  ton: "acquis" },
};

// Clé du brouillon d'un visiteur sans compte : il compose, se connecte au
// moment d'enregistrer, et retrouve tout à son retour.
export const CLE_BROUILLON_LOCAL = "haody:composer:brouillon";
