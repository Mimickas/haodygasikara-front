import api from "../axiosInstance";

// Les reservations, cote agence. Pas de create ni de delete : une reservation
// nait d'une demande du visiteur, et elle s'annule — elle ne s'efface pas.
export const findAllReservationsApi = async () => {
    const { data } = await api.get("/admin/reservations");
    return data;
};

// Le referentiel des statuts, pour la liste deroulante. L'ecran n'en declare
// aucun : il les demande, comme pour la fiche technique d'un circuit.
export const findReservationStatutsApi = async () => {
    const { data } = await api.get("/admin/reservations/statuts");
    return data;
};

// Le changement de statut ALLONGE l'historique, il ne le reecrit pas.
export const changerStatutReservationApi = (id, payload) =>
    api.put(`/admin/reservations/${id}/statut`, payload);

export const findReservationStatsApi = () => api.get("/admin/reservations/stats");
