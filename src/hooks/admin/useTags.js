import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { getTagsGroupsApi } from "../../api/admin/tagGroupApi";

export function useTags() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.tags);

    const loadEnrichedFields = async () => {
        const response = await getTagsGroupsApi();
        const tagGroupOptions = response.data.map(g => ({
            label: g.name,
            value: g.id,
        }));

        const enrichedFields = createConstant.tags.map(group =>
            group.map(field =>
                field.name === "idTagGroup"
                    ? { ...field, options: tagGroupOptions }
                    : field
            )
        );

        setFields(enrichedFields);
    };

    const createTag = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement groupes :", error);
        } finally {
            setOpen(true);
        }
    };

    const editTag = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement groupes :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createTag,
        edit:   editTag,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}