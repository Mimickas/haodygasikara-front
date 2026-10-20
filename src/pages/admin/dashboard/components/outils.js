// Les petits outils partagés par les blocs du tableau de bord.

export const B = "/admin/haodygasikara";

// La promesse faite au voyageur : une réponse à sa demande de devis en 48 h.
export const HEURES_PROMESSE = 48;

export const pourcent = (taux) => (taux == null ? "—" : `${taux} %`);

// « 1 voyage », « 3 voyages »
export const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;
