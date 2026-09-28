// Les statuts d'une demande de devis, tels que le back les renvoie dans
// `statutAffiche`. EXPIRE n'est pas stocké : c'est un devis proposé dont la
// date de validité est passée, constaté à la lecture.
//
// `ton` choisit l'encre de la pastille — une par famille, pas une par statut :
// l'œil doit lire « ça avance », « à vous de jouer », « c'est clos ».
export const STATUTS_DEVIS = {
    ENVOYE:   { libelle: "Demande envoyée",       ton: "attente" },
    EN_COURS: { libelle: "En cours d'étude",      ton: "attente" },
    PROPOSE:  { libelle: "Devis reçu",            ton: "action"  },
    ACCEPTE:  { libelle: "Devis accepté",         ton: "acquis"  },
    REFUSE:   { libelle: "Devis refusé",          ton: "clos"    },
    DECLINE:  { libelle: "Décliné par l'agence",  ton: "clos"    },
    ANNULE:   { libelle: "Demande retirée",       ton: "clos"    },
    EXPIRE:   { libelle: "Devis expiré",          ton: "clos"    },
};

// Les quatre étapes que la frise montre toujours, même avant d'y être : le
// voyageur doit voir où il en est ET ce qui vient ensuite.
export const ETAPES_FRISE = [
    { statut: "ENVOYE",   libelle: "Envoyée" },
    { statut: "EN_COURS", libelle: "À l'étude" },
    { statut: "PROPOSE",  libelle: "Devis reçu" },
    { statut: "ACCEPTE",  libelle: "Accepté" },
];

export const libelleStatutDevis = (code) => STATUTS_DEVIS[code]?.libelle ?? code ?? "—";

export const tonStatutDevis = (code) => STATUTS_DEVIS[code]?.ton ?? "attente";

// « 4 850 000 MGA »
export const montantDevis = (valeur, devise) =>
    valeur == null
        ? "—"
        : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(valeur)}${devise ? ` ${devise}` : ""}`;

// Nombre de jours pleins avant une date AAAA-MM-JJ (négatif si passée).
export const joursAvant = (dateIso) => {
    if (!dateIso) return null;
    const [a, m, j] = dateIso.split("-").map(Number);
    const cible = new Date(a, m - 1, j);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    return Math.round((cible - aujourdhui) / 86400000);
};

// Une demande qui tient encore le voyage : à l'étude, devis reçu (non expiré)
// ou accepté. Tant qu'elle vit, le voyage ne se modifie plus et on n'en
// redemande pas un devis — même règle que le serveur (QuoteRequest#estVivante).
export const STATUTS_VIVANTS = ["ENVOYE", "EN_COURS", "PROPOSE", "ACCEPTE"];
export const estDemandeVivante = (statut) => STATUTS_VIVANTS.includes(statut);

// Le seul geste utile face à une demande vivante, en un libellé de bouton.
export const actionDemandeVivante = (statut) => ({
    PROPOSE: "Voir et confirmer le devis",
    ACCEPTE: "Voir le devis accepté",
}[statut] ?? "Suivre ma demande");
