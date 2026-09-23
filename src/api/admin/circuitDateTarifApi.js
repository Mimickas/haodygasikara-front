import api from "../axiosInstance";

// CRUD des dates de départ d'un circuit (le même voyage part en octobre, novembre, décembre…)

export const createCircuitDateTarifApi = async (payload) => {
    const { data } = await api.post("/admin/circuit-date-tarifs", payload);
    return data;
};

// circuitId optionnel : filtre la liste sur un seul circuit
export const findAllCircuitDateTarifsApi = async (circuitId) => {
    const { data } = await api.get("/admin/circuit-date-tarifs", {
        params: circuitId ? { circuitId } : undefined,
    });
    return data;
};

export const findCircuitDateTarifByIdApi = async (id) => {
    const { data } = await api.get(`/admin/circuit-date-tarifs/${id}`);
    return data;
};

export const updateCircuitDateTarifApi = (id, payload) => api.put(`/admin/circuit-date-tarifs/${id}`, payload);

export const deleteCircuitDateTarifApi = (id) => api.delete(`/admin/circuit-date-tarifs/${id}`);
