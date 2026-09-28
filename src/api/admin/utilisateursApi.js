import api from "../axiosInstance";

// Les comptes, en lecture seule. Créer un administrateur passe par
// registerAdminApi (authApi.js) : réservé à un administrateur connecté.
export const findUtilisateursApi = async () => {
    const { data } = await api.get("/admin/utilisateurs");
    return data;
};
