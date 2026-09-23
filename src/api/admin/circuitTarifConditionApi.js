import api from "../axiosInstance";

// CRUD de la liaison entre un tarif de circuit et une condition de tarif

export const createCircuitTarifConditionApi = async (payload) => {
    const { data } = await api.post("/admin/circuit-tarif-conditions", payload);
    return data;
};

// circuitTarifId optionnel : filtre la liste sur un seul tarif
export const findAllCircuitTarifConditionsApi = async (circuitTarifId) => {
    const { data } = await api.get("/admin/circuit-tarif-conditions", {
        params: circuitTarifId ? { circuitTarifId } : undefined,
    });
    return data;
};

export const findCircuitTarifConditionByIdApi = async (id) => {
    const { data } = await api.get(`/admin/circuit-tarif-conditions/${id}`);
    return data;
};

export const updateCircuitTarifConditionApi = (id, payload) => api.put(`/admin/circuit-tarif-conditions/${id}`, payload);

export const deleteCircuitTarifConditionApi = (id) => api.delete(`/admin/circuit-tarif-conditions/${id}`);
