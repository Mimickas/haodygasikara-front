import api from "../axiosInstance";

// Ce que choisissent les voyageurs : les destinations de leurs voyages, et les
// circuits de l'agence qui font naître des demandes de devis.

export const findChoixVoyageursApi = async () => {
    const { data } = await api.get("/admin/statistiques/choix-voyageurs");
    return data;
};
