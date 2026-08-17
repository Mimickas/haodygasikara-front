import api from "../axiosInstance";

export const createTagsGroupsApi = async (tagGroupData) => {
    const { data } = await api.post("/admin/tags-groups", tagGroupData);
    return data;
};

export const getTagsGroupsApi = async () => {
    const { data } = await api.get("/admin/tags-groups");
    return data;
};

export const getTagGroupStatsApi = () => api.get("/admin/tags-groups/stats");