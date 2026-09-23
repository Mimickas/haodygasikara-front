import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { findAllCircuitApi } from "../../api/admin/circuit";

export function useCircuitDateTarif() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.circuitDateTarifs);

    const loadEnrichedFields = async () => {
        // Une seule liste déroulante à alimenter : les circuits
        const circuitsResponse = await findAllCircuitApi();

        const circuitOptions = (circuitsResponse.data ?? []).map(c => ({
            // ← la durée est dans le libellé : plus besoin d'aller l'additionner dans le circuit
            label: c.dureeJours
                ? `${c.name} — ${c.dureeJours} jour(s)`
                : `${c.name} — programme à compléter`,
            value: c.id,
        }));

        const enrichedFields = createConstant.circuitDateTarifs.map(group =>
            group.map(field =>
                field.name === "circuitId"
                    ? { ...field, options: circuitOptions }
                    : field
            )
        );

        setFields(enrichedFields);
    };

    const createCircuitDateTarif = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des circuits :", error);
        } finally {
            setOpen(true);
        }
    };

    const editCircuitDateTarif = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des circuits :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createCircuitDateTarif,
        edit:   editCircuitDateTarif,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
