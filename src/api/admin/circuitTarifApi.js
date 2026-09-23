import api from "../axiosInstance";

// CRUD des tarifs d'un circuit (prix + catégorie + devise + conditions rattachées)

export const createCircuitTarifApi = async (payload) => {
    const { data } = await api.post("/admin/circuit-tarifs", payload);
    return data;
};

// circuitId optionnel : filtre la liste sur un seul circuit
export const findAllCircuitTarifsApi = async (circuitId) => {
    const { data } = await api.get("/admin/circuit-tarifs", {
        params: circuitId ? { circuitId } : undefined,
    });
    return data;
};

export const findCircuitTarifByIdApi = async (id) => {
    const { data } = await api.get(`/admin/circuit-tarifs/${id}`);
    return data;
};

export const updateCircuitTarifApi = (id, payload) => api.put(`/admin/circuit-tarifs/${id}`, payload);

export const deleteCircuitTarifApi = (id) => api.delete(`/admin/circuit-tarifs/${id}`);
