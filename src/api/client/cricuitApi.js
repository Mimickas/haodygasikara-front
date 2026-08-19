import api from "../axiosInstance";

export const findAllCircuitClientApi = async () => {
    const { data } = await api.get("/client/circuits");
    return data;
};