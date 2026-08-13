import api from "../axiosInstance";

export const getPlacesApi = async () => {
    const { data } = await api.get("/admin/places");
    return data;
};

export const createPlaceApi = (data) => api.post('/admin/places', data);

// Pour remplir les options du multiselect tags
export const getTagsApi = async () => {
    const { data } = await api.get("/admin/tags");
    return data;
};

export const getPlaceByIdApi = (id) => api.get(`/admin/places/${id}`);

export const updatePlaceApi = (id, data) => api.put(`/admin/places/${id}`,data);

export const deletePlacesApi = (id) => api.delete(`/admin/places/${id}`);