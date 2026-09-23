import api from "../axiosInstance";

// CRUD des catégories de tarif (ex : Adulte, Enfant, Groupe)

export const createCategoryTarifApi = async (payload) => {
    const { data } = await api.post("/admin/category-tarifs", payload);
    return data;
};

export const findAllCategoryTarifsApi = async () => {
    const { data } = await api.get("/admin/category-tarifs");
    return data;
};

export const findCategoryTarifByIdApi = async (id) => {
    const { data } = await api.get(`/admin/category-tarifs/${id}`);
    return data;
};

export const updateCategoryTarifApi = (id, payload) => api.put(`/admin/category-tarifs/${id}`, payload);

export const deleteCategoryTarifApi = (id) => api.delete(`/admin/category-tarifs/${id}`);
