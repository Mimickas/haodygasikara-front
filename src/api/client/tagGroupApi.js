import api from "../axiosInstance";

export const findAllTagsGroupsApiClient = async () => {
    const { data } = await api.get("/client/tags-groups");
    return data;
};