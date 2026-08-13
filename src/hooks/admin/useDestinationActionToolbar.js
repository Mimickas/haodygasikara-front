import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getPlaceByIdApi, getTagsApi } from "../../api/admin/places";

export function useDestinationActionToolbar() {
    const navigate = useNavigate();

    // logique partagée create/edit
    const buildFields = async () => {
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

    const handleCreate = async () => {
        try {
            const fields = await buildFields();
            navigate("/admin/haodygasikara/destinations/create", {
                state: { fields },
            });
        } catch (error) {
            console.error("Erreur chargement tags :", error);
        }
    };

    const handleEdit = async (id) => {
        const [tagsRes, placeRes] = await Promise.all([
            getTagsApi(),
            getPlaceByIdApi(id),
        ]);

        const tagOptions = tagsRes.data.map(t => ({ label: t.name, value: t.id }));
        const fields = createConstant.destinations.map(group =>
            group.map(field =>
                field.name === "tagIds" ? { ...field, options: tagOptions } : field
            )
        );

        const place = placeRes.data.data;  
        const values = {
            ...place,
            tagsIds: place.tags?.map(t => t.id) ?? [],
        };

        navigate(`/admin/haodygasikara/destinations/edit/${id}`, {
            state: { fields, values },   // ← values ENVOYÉ
        });
    };

    const actions = { create: handleCreate, edit: handleEdit,
        export: () => console.log("export destinations"),
        sort: () => console.log("sort") };

    return { actions };
}