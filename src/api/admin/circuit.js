import api from "../axiosInstance";

export const createCircuit = async (data) => {
    const response = await api.post("/admin/circuit", data);

    return response.data;
};

export const findAllCircuitApi = async () => {
    const response = await api.get("/admin/circuit");
    return response.data;
};

export const deleteCircuitApi = async (id) => {
    const response = await api.delete(`/admin/circuit/${id}`);
    return response.data;
};

export const findByIdCircuitApi = async (id) => {
    const response = await api.get(`/admin/circuit/${id}`);
    return response;
}

export const updateCircuitApi = async (id, data) => {
    const response = await api.put(`/admin/circuit/${id}`, data);
    return response;
}
