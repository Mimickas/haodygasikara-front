import api from "../axiosInstance";

// Les demandes de devis vues de l'agence : les demandes de prix des voyageurs.
// Pas de création ni de suppression : une demande naît d'un voyageur et se
// clôt, elle ne s'efface pas.

export const findAllDemandesDevisApi = async () => {
    const { data } = await api.get("/admin/devis");
    return data;
};

export const findStatsDevisApi = async () => {
    const { data } = await api.get("/admin/devis/stats");
    return data;
};

export const prendreEnChargeDevisApi = async (id) => {
    const { data } = await api.put(`/admin/devis/${id}/prendre-en-charge`);
    return data;
};

// payload : { montant, devise, validiteJusquau (AAAA-MM-JJ), message }
export const proposerDevisApi = async (id, payload) => {
    const { data } = await api.put(`/admin/devis/${id}/proposer`, payload);
    return data;
};

export const declinerDevisApi = async (id, motif) => {
    const { data } = await api.put(`/admin/devis/${id}/decliner`, { motif });
    return data;
};

// L'e-mail de l'étape en cours, à nouveau (accusé, devis ou motif du déclin).
// Réponse : la demande relue, avec emailEnvoyeLe ou emailErreur.
export const renvoyerEmailDevisApi = async (id) => {
    const { data } = await api.put(`/admin/devis/${id}/renvoyer-email`);
    return data;
};

export const noterDevisApi = async (id, notes) => {
    const { data } = await api.put(`/admin/devis/${id}/notes`, { notes });
    return data;
};

// Les hébergements choisis par le voyageur, en lignes de devis à chiffrer.
export const findPostesSuggeresDevisApi = async (id) => {
    const { data } = await api.get(`/admin/devis/${id}/postes-suggeres`);
    return data;
};

// Le récapitulatif en PDF (réponse axios complète : le nom du fichier est dans les en-têtes).
export const telechargerPdfDevisApi = (id) => api.get(`/admin/devis/${id}/pdf`, { responseType: "blob" });
