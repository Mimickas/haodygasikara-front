import api from "../axiosInstance";

export const findAllTagsApiClient = async () => {
    const { data } = await api.get("/client/tags");
    return data;
};