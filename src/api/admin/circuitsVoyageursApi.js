import api from "../axiosInstance";

// Les circuits composés par les voyageurs, en lecture seule : l'agence les lit
// pour préparer un devis ou comprendre ce que les voyageurs composent.

export const findCircuitsVoyageursApi = async () => {
    const { data } = await api.get("/admin/circuits-voyageurs");
    return data;
};

export const findCircuitVoyageurApi = async (id) => {
    const { data } = await api.get(`/admin/circuits-voyageurs/${id}`);
    return data;
};
