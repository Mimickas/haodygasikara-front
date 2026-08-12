import api from "../axiosInstance";

export const createCircuit = async (data) => {
    const response = await api.post("/admin/circuit", data);

    return response.data;
};
