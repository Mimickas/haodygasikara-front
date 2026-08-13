import api from "../axiosInstance";

export const createTagsApi = async (tagData) => {
    const { data } = await api.post("/admin/tags", tagData);
    return data;
};

export const findAllTags = async () => {
    const { data } = await api.get("/admin/tags");
    return data;
};

export const updateTagApi = (id, payload) => api.put(`/admin/tags/${id}`, payload);