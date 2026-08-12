import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getPlacesApi } from "../../api/admin/places";

export function useCircuitActionToolbar() {
    const navigate = useNavigate();

    const handleCreate = async () => {
        try {
            const response = await getPlacesApi();
            const placeOptions = response.data.map(p => ({
                label: p.name || p.nom,
                value: p.id,
            }));

            const enrichedFields = createConstant.circuits.map(group =>
                group.map(field =>
                    field.name === "steps"
                        ? { ...field, options: placeOptions }
                        : field
                )
            );
            
            navigate("/admin/haodygasikara/circuits/create", {
                state: { fields: enrichedFields }, 
            });
        } catch (error) {
            console.error("Erreur chargement places :", error);
        }
    };

    const actions = {
        create: handleCreate,
        export: () => console.log("export destinations"),
        sort:   () => console.log("sort"),
    };

    return { actions };
}