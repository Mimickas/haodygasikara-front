import api from "../axiosInstance";

// CRUD du programme jour par jour d'un circuit (déroulé, hébergement du soir, repas + visites rattachées)

export const createCircuitDayApi = async (payload) => {
    const { data } = await api.post("/admin/circuit-days", payload);
    return data;
};

// circuitId optionnel : filtre le programme sur un seul circuit
export const findAllCircuitDaysApi = async (circuitId) => {
    const { data } = await api.get("/admin/circuit-days", {
        params: circuitId ? { circuitId } : undefined,
    });
    return data;
};

export const findCircuitDayByIdApi = async (id) => {
    const { data } = await api.get(`/admin/circuit-days/${id}`);
    return data;
};

export const updateCircuitDayApi = (id, payload) => api.put(`/admin/circuit-days/${id}`, payload);

export const deleteCircuitDayApi = (id) => api.delete(`/admin/circuit-days/${id}`);
