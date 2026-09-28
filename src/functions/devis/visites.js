// ── Les visites d'une demande de devis, en fonctions pures ────────────────
//
// Le serveur découpe le voyage en étapes et identifie chacune par le jour où
// elle commence. Une étape porte DEUX listes : `incluses`, comprises dans le
// circuit — elles s'affichent, elles ne se décochent pas —, et `options`, au
// choix du voyageur. Un choix, ici, c'est donc { [premierJour]: [poiId…] }.
//
// Le pendant de hebergements.js : là-bas on choisit UN hôtel par séjour, ici
// on coche ce qu'on veut parmi les options.

/**
 * Les choix de départ : ceux du brouillon qui sont encore proposés (une visite
 * a pu être retirée de la vente entre-temps). Rien n'est coché d'office —
 * contrairement à l'hébergement, une option se prend, elle ne se subit pas.
 */
export function visitesInitiales(etapes, enregistrees = {}) {
    const choix = {};
    for (const e of etapes) {
        const voulues = enregistrees?.[e.premierJour] ?? [];
        const retenues = e.options.filter((v) => voulues.includes(v.id)).map((v) => v.id);
        if (retenues.length) choix[e.premierJour] = retenues;
    }
    return choix;
}

/** Cocher / décocher une visite d'une étape, sans toucher aux autres. */
export function basculerVisite(choix, premierJour, poiId) {
    const prises = choix[premierJour] ?? [];
    const apres = prises.includes(poiId)
        ? prises.filter((id) => id !== poiId)
        : [...prises, poiId];
    const suivant = { ...choix };
    if (apres.length) suivant[premierJour] = apres;
    else delete suivant[premierJour];
    return suivant;
}

export const visitePrise = (choix, premierJour, poiId) =>
    (choix[premierJour] ?? []).includes(poiId);

/** Ce que la demande envoie : une ligne par visite retenue, l'étape avec. */
export const versChoixVisites = (etapes, choix) =>
    etapes.flatMap((e) =>
        e.options
            .filter((v) => visitePrise(choix, e.premierJour, v.id))
            .map((v) => ({ premierJour: e.premierJour, poiId: v.id })),
    );

/** Le nombre total d'options retenues sur tout le voyage. */
export const compterVisitesPrises = (choix) =>
    Object.values(choix).reduce((total, prises) => total + prises.length, 0);

/** Ce que le récapitulatif annonce : « 4 comprises · 2 en plus ». */
export function resumeVisites(etapes, choix) {
    const incluses = etapes.reduce((total, e) => total + e.incluses.length, 0);
    const prises = compterVisitesPrises(choix);
    const morceaux = [];
    if (incluses) morceaux.push(`${incluses} comprise${incluses > 1 ? "s" : ""}`);
    if (prises) morceaux.push(`${prises} en plus`);
    return morceaux.length ? morceaux.join(" · ") : "Aucune pour l'instant";
}

/** « Jour 4 », « Jours 4 à 6 ». */
export const libelleJours = ({ premierJour, dernierJour }) =>
    dernierJour > premierJour ? `Jours ${premierJour} à ${dernierJour}` : `Jour ${premierJour}`;
