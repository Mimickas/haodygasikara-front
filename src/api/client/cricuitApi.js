import api from "../axiosInstance";

export const findAllCircuitClientApi = async () => {
    const { data } = await api.get("/client/circuits");
    return data;
};

export const findCircuitClientById = async (id) => {
    const {data} = await api.get(`/client/circuits/${id}`);
    return data;
};
// La prise de reservation. On n'envoie que des identifiants et des quantites :
// aucun prix, aucun total. Le serveur relit les montants en base et renvoie
// ceux qu'il a enregistres (cf. ReservationService).
export const createReservationApi = async (payload) => {
    const { data } = await api.post("/client/reservations", payload);
    return data;
};

// Les reservations du voyageur connecte. Le back exige le compte et repond
// 401 sans lui : /api/client/** est ouvert par la configuration, c'est le
// service qui tranche.
export const findMesReservationsApi = async () => {
    const { data } = await api.get("/client/reservations/mes");
    return data;
};
