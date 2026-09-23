import api from "../axiosInstance";

// CRUD des conditions de tarif (ex : "Age >= 18")
// type et operator sont les NOMS des enums backend (ex "AGE", "GTE")

export const createConditionTarifApi = async (payload) => {
    const { data } = await api.post("/admin/condition-tarifs", payload);
    return data;
};

export const findAllConditionTarifsApi = async () => {
    const { data } = await api.get("/admin/condition-tarifs");
    return data;
};

export const findConditionTarifByIdApi = async (id) => {
    const { data } = await api.get(`/admin/condition-tarifs/${id}`);
    return data;
};

export const updateConditionTarifApi = (id, payload) => api.put(`/admin/condition-tarifs/${id}`, payload);

export const deleteConditionTarifApi = (id) => api.delete(`/admin/condition-tarifs/${id}`);

// Alimente les dropdowns type / operator -> data = { types: [{value,label}], operators: [{value,label}] }
export const getConditionTarifEnumsApi = async () => {
    const { data } = await api.get("/admin/condition-tarifs/enums");
    return data;
};
