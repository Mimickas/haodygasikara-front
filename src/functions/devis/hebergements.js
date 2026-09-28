// ── Les hébergements d'une demande de devis, en fonctions pures ────────────
//
// Le serveur découpe le voyage en séjours (nuits consécutives aux mêmes
// hébergements proposés) et identifie chacun par le jour de sa première nuit.
// Un choix, ici, c'est donc { [premierJour]: hotelId }.

/**
 * Les choix de départ : ceux du brouillon s'ils sont encore proposés (un hôtel
 * a pu être retiré de la vente entre-temps), sinon l'hôtel conseillé.
 */
export function choixInitiaux(sejours, enregistres = {}) {
    const choix = {};
    for (const s of sejours) {
        const voulu = enregistres?.[s.premierJour];
        if (s.hotels.some((h) => h.id === voulu)) choix[s.premierJour] = voulu;
        else if (s.conseille != null) choix[s.premierJour] = s.conseille;
    }
    return choix;
}

/** Ce que la demande envoie : un choix par séjour qui propose au moins un hôtel. */
export const versChoixHebergements = (sejours, choix) =>
    sejours
        .filter((s) => s.hotels.length > 0 && choix[s.premierJour] != null)
        .map((s) => ({ premierJour: s.premierJour, hotelId: choix[s.premierJour] }));

/** L'hôtel retenu pour un séjour, ou null (le conseiller choisira). */
export const hotelChoisi = (sejour, choix) =>
    sejour.hotels.find((h) => h.id === choix[sejour.premierJour]) ?? null;

/** « Nuit 1 », « Nuits 3 à 5 ». */
export const libelleNuits = ({ nuits, premierJour, dernierJour }) =>
    nuits > 1 ? `Nuits ${premierJour} à ${dernierJour}` : `Nuit ${premierJour}`;
