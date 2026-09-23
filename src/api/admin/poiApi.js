import api from "../axiosInstance";

// CRUD des points d'intérêt d'une destination (hôtels, restaurants, sites à visiter…)

export const createPoiApi = async (payload) => {
    const { data } = await api.post("/admin/pois", payload);
    return data;
};

// destinationId optionnel : filtre la liste sur une seule destination
export const findAllPoisApi = async (destinationId) => {
    const { data } = await api.get("/admin/pois", {
        params: destinationId ? { destinationId } : undefined,
    });
    return data;
};

export const findPoiByIdApi = async (id) => {
    const { data } = await api.get(`/admin/pois/${id}`);
    return data;
};

export const updatePoiApi = (id, payload) => api.put(`/admin/pois/${id}`, payload);

export const deletePoiApi = (id) => api.delete(`/admin/pois/${id}`);
