import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getTagsApi } from "../../api/admin/places";

export function useDestinationActionToolbar() {
    const navigate = useNavigate();

    const handleCreate = async () => {
        try {
            const response = await getTagsApi();
            const tagOptions = response.data.map(t => ({
                label: t.name,
                value: t.id,
            }));

            const enrichedFields = createConstant.destinations.map(group =>
                group.map(field =>
                    field.name === "tagIds"
                        ? { ...field, options: tagOptions }
                        : field
                )
            );
            
            navigate("/admin/haodygasikara/destinations/create", {
                state: { fields: enrichedFields }, 
            });
        } catch (error) {
            console.error("Erreur chargement tags :", error);
        }
    };

    const actions = {
        create: handleCreate,
        export: () => console.log("export destinations"),
        sort:   () => console.log("sort"),
    };

    return { actions };
}