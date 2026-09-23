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

export const findCircuitStatsApi = () => api.get("/admin/circuit/stats");

// Referentiel de la fiche technique : styles, niveaux, langues, transports et
// postes d'inclusion. Servi par le back a partir de ses enums — le formulaire
// n'en redeclare aucun, ajouter une langue ne se fait qu'a un seul endroit.
export const findCircuitEnumsApi = async () => {
    const { data } = await api.get("/admin/circuit/enums");
    return data;
};
