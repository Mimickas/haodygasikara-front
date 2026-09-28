import api from "../axiosInstance";

// Les suggestions du créateur de circuit, vues de l'agence : combien ont été
// montrées, combien ajoutées, et les destinations le plus souvent associées.

export const findEfficaciteSuggestionsApi = async () => {
    const { data } = await api.get("/admin/suggestions/efficacite");
    return data;
};

// Sans attendre le calcul de la nuit — après un lot de circuits, par exemple.
export const recalculerAssociationsApi = async () => {
    const { data } = await api.post("/admin/suggestions/recalculer");
    return data;
};
