import api from "../axiosInstance";

export const getDestinationsApi = async () => {
    const { data } = await api.get("/admin/destinations");
    return data;
};

export const createDestinationApi = (data) => api.post('/admin/destinations', data);

// Pour remplir les options du multiselect tags
export const getTagsApi = async () => {
    const { data } = await api.get("/admin/tags");
    return data;
};

export const getDestinationByIdApi = (id) => api.get(`/admin/destinations/${id}`);

export const updateDestinationApi = (id, data) => api.put(`/admin/destinations/${id}`,data);

export const deleteDestinationsApi = (id) => api.delete(`/admin/destinations/${id}`);

export const getDestinationStatsApi = () => api.get("/admin/destinations/stats");