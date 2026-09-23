import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { getConditionTarifEnumsApi } from "../../api/admin/conditionTarifApi";

export function useConditionTarif() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.conditionTarifs);

    const loadEnrichedFields = async () => {
        // Les deux listes déroulantes viennent du même endpoint /admin/condition-tarifs/enums
        const response = await getConditionTarifEnumsApi();
        const { types = [], operators = [] } = response.data ?? {};

        const typeOptions = types.map(t => ({
            label: t.label,
            value: t.value,
        }));

        const operatorOptions = operators.map(o => ({
            label: o.label,
            value: o.value,
        }));

        const enrichedFields = createConstant.conditionTarifs.map(group =>
            group.map(field => {
                if (field.name === "type")     return { ...field, options: typeOptions };
                if (field.name === "operator") return { ...field, options: operatorOptions };
                return field;
            })
        );

        setFields(enrichedFields);
    };

    const createConditionTarif = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des énumérations de conditions :", error);
        } finally {
            setOpen(true);
        }
    };

    const editConditionTarif = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des énumérations de conditions :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createConditionTarif,
        edit:   editConditionTarif,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
