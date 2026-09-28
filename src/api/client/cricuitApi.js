import api from "../axiosInstance";

export const findAllCircuitClientApi = async () => {
    const { data } = await api.get("/client/circuits");
    return data;
};

export const findCircuitClientById = async (id) => {
    const {data} = await api.get(`/client/circuits/${id}`);
    return data;
};

// Les hébergements au choix, séjour par séjour : ceux que l'agence propose
// et qui sont encore disponibles. [{ premierJour, dernierJour, nuits, etape, hotels, conseille }]
export const findHebergementsCircuitApi = async (id) => {
    const { data } = await api.get(`/client/circuits/${id}/hebergements`);
    return data;
};

// Les visites au choix, étape par étape : celles que l'agence comprend dans le
// circuit, et celles qu'elle propose en plus. Un voyage composé n'a rien de
// prévu : il reçoit le catalogue de chaque lieu traversé.
// [{ premierJour, dernierJour, jours, destinationId, etape, incluses, options }]
export const findVisitesCircuitApi = async (id) => {
    const { data } = await api.get(`/client/circuits/${id}/visites`);
    return data;
};
