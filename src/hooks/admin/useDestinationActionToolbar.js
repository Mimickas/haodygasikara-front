import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getDestinationByIdApi, getTagsApi } from "../../api/admin/destinations";

// Les champs du formulaire, avec les étiquettes à cocher. Exportés : la page
// de création ou de modification les recharge elle-même quand on l'ouvre
// directement (lien, rechargement), sans passer par la liste.
export const chargerChampsDestination = async () => {
    const response = await getTagsApi();
    const tagOptions = response.data.map(t => ({
        label: t.name,
        value: t.id,
    }));

    return createConstant.destinations.map(group =>
        group.map(field =>
            field.name === "tagIds"
                ? { ...field, options: tagOptions }
                : field
        )
    );
};

// Le formulaire d'une destination existante. La réponse porte déjà `tagIds`
// (les ids à cocher) : le spread suffit.
export const chargerFormulaireDestination = async (id) => {
    const [fields, destinationRes] = await Promise.all([
        chargerChampsDestination(),
        getDestinationByIdApi(id),
    ]);
    return { fields, values: { ...destinationRes.data.data } };
};

export function useDestinationActionToolbar() {
    const navigate = useNavigate();

    const handleCreate = async () => {
        try {
            navigate("/admin/haodygasikara/destinations/create", {
                state: { fields: await chargerChampsDestination() },
            });
        } catch (error) {
            console.error("Erreur chargement tags :", error);
        }
    };

    const handleEdit = async (id) => {
        try {
            navigate(`/admin/haodygasikara/destinations/edit/${id}`, {
                state: await chargerFormulaireDestination(id),
            });
        } catch (error) {
            console.error("Erreur chargement de la destination :", error);
        }
    };

    return { actions: { create: handleCreate, edit: handleEdit } };
}
