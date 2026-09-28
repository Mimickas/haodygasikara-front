import api from "../axiosInstance";

// Les demandes de devis du voyageur. Le back exige le compte et répond 401
// sans lui : /api/client/** est ouvert par la configuration, c'est le service
// qui tranche — l'intercepteur renouvelle alors le jeton et rejoue l'appel.

// payload : { circuitId, dateSouhaitee?, nombreVoyageurs, message?, hebergements? }
// Aucun prix : le devis est chiffré à la main par l'agence.
export const creerDemandeDevisApi = async (payload) => {
    const { data } = await api.post("/client/devis", payload);
    return data;
};

export const findMesDevisApi = async () => {
    const { data } = await api.get("/client/devis/mes");
    return data;
};

export const accepterDevisApi = async (id) => {
    const { data } = await api.post(`/client/devis/${id}/accepter`);
    return data;
};

export const refuserDevisApi = async (id, motif) => {
    const { data } = await api.post(`/client/devis/${id}/refuser`, { motif });
    return data;
};

export const annulerDemandeDevisApi = async (id, motif) => {
    const { data } = await api.post(`/client/devis/${id}/annuler`, { motif });
    return data;
};

// Le récapitulatif de SA demande en PDF (réponse axios complète : le nom est dans les en-têtes).
export const telechargerPdfMonDevisApi = (id) => api.get(`/client/devis/${id}/pdf`, { responseType: "blob" });
