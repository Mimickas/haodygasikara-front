import api from "../axiosInstance";

// CRUD des catégories de point d'intérêt (ex : Hôtel, Restaurant, Site historique)

export const createCategoryPoiApi = async (payload) => {
    const { data } = await api.post("/admin/category-pois", payload);
    return data;
};

export const findAllCategoryPoisApi = async () => {
    const { data } = await api.get("/admin/category-pois");
    return data;
};

export const updateCategoryPoiApi = (id, payload) => api.put(`/admin/category-pois/${id}`, payload);

export const deleteCategoryPoiApi = (id) => api.delete(`/admin/category-pois/${id}`);
