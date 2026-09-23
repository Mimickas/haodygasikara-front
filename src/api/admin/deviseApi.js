import api from "../axiosInstance";

// CRUD des devises (code = 3 lettres ISO 4217, normalisé en majuscules par le backend)

export const createDeviseApi = async (payload) => {
    const { data } = await api.post("/admin/devises", payload);
    return data;
};

export const findAllDevisesApi = async () => {
    const { data } = await api.get("/admin/devises");
    return data;
};

export const findDeviseByIdApi = async (id) => {
    const { data } = await api.get(`/admin/devises/${id}`);
    return data;
};

export const updateDeviseApi = (id, payload) => api.put(`/admin/devises/${id}`, payload);

export const deleteDeviseApi = (id) => api.delete(`/admin/devises/${id}`);
