import api from "../axiosInstance";

// CRUD de la liaison entre un jour de programme et un point d'intérêt (visite ou activité)

export const createCircuitDayPoiApi = async (payload) => {
    const { data } = await api.post("/admin/circuit-day-pois", payload);
    return data;
};

// circuitDayId optionnel : filtre la liste sur un seul jour
export const findAllCircuitDayPoisApi = async (circuitDayId) => {
    const { data } = await api.get("/admin/circuit-day-pois", {
        params: circuitDayId ? { circuitDayId } : undefined,
    });
    return data;
};

export const findCircuitDayPoiByIdApi = async (id) => {
    const { data } = await api.get(`/admin/circuit-day-pois/${id}`);
    return data;
};

export const updateCircuitDayPoiApi = (id, payload) => api.put(`/admin/circuit-day-pois/${id}`, payload);

export const deleteCircuitDayPoiApi = (id) => api.delete(`/admin/circuit-day-pois/${id}`);
