import api from "../axiosInstance";

// CRUD des points d'intérêt d'une destination (hôtels, restaurants, sites à visiter…)

export const createPoiApi = async (payload) => {
    const { data } = await api.post("/admin/pois", payload);
    return data;
};

// destinationId optionnel : filtre la liste sur une seule destination
export const findAllPoisApi = async (destinationId) => {
    const { data } = await api.get("/admin/pois", {
        params: destinationId ? { destinationId } : undefined,
    });
    return data;
};

export const updatePoiApi = (id, payload) => api.put(`/admin/pois/${id}`, payload);

export const deletePoiApi = (id) => api.delete(`/admin/pois/${id}`);

// Retirer un hébergement de la vente (ou l'y remettre) sans le supprimer :
// indisponible, il n'est plus proposé aux voyageurs.
export const changerDisponibilitePoiApi = async (id, disponible) => {
    const { data } = await api.patch(`/admin/pois/${id}/disponibilite`, { disponible });
    return data;
};
