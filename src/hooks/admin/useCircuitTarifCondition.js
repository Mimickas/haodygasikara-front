import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { findAllCircuitTarifsApi } from "../../api/admin/circuitTarifApi";
import { findAllConditionTarifsApi } from "../../api/admin/conditionTarifApi";
import { formatCircuitTarif } from "../../utils/format";

export function useCircuitTarifCondition() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.circuitTarifConditions);

    const loadEnrichedFields = async () => {
        // Deux listes déroulantes à alimenter : on les charge en parallèle
        const [circuitTarifsResponse, conditionTarifsResponse] = await Promise.all([
            findAllCircuitTarifsApi(),
            findAllConditionTarifsApi(),
        ]);

        const circuitTarifOptions = (circuitTarifsResponse.data ?? []).map(t => ({
            label: formatCircuitTarif(t),
            value: t.id,
        }));

        const conditionTarifOptions = (conditionTarifsResponse.data ?? []).map(c => ({
            label: c.libelle,
            value: c.id,
        }));

        const enrichedFields = createConstant.circuitTarifConditions.map(group =>
            group.map(field => {
                if (field.name === "circuitTarifId")   return { ...field, options: circuitTarifOptions };
                if (field.name === "conditionTarifId") return { ...field, options: conditionTarifOptions };
                return field;
            })
        );

        setFields(enrichedFields);
    };

    const createCircuitTarifCondition = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des tarifs et conditions :", error);
        } finally {
            setOpen(true);
        }
    };

    const editCircuitTarifCondition = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des tarifs et conditions :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createCircuitTarifCondition,
        edit:   editCircuitTarifCondition,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
