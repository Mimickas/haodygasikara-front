import { useState } from "react";
import { getTagsGroupsApi } from "../../api/admin/tagGroupApi";
import createConstant from "../../constants/admin/createConstant";



export function useTags() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.tags); // ← fields enrichis

    const createTag = async () => {
        try {
            const response = await getTagsGroupsApi();
            const tagGroupOptions = response.data.map(g => ({
                label: g.name,
                slug: g.slug,
                value: g.id,
            }));

            // Injecter les options dans le field "tagGroup"
            const enrichedFields = createConstant.tags.map(group =>
                group.map(field =>
                    field.name === "idTagGroup"
                        ? { ...field, options: tagGroupOptions }
                        : field
                )
            );

            setFields(enrichedFields);
        } catch (error) {
            console.error("Erreur chargement groupes :", error);
        } finally {
            setOpen(true); // ouvre le modal même si erreur
        }
    };

    const actions = {
        create: () => createTag(),
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields }; // ← exporter fields
}