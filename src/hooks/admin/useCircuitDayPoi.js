import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { findAllCircuitDaysApi } from "../../api/admin/circuitDayApi";
import { findAllCircuitApi } from "../../api/admin/circuit";
import { findAllPoisApi } from "../../api/admin/poiApi";
import { formatCircuitDay, formatPoi } from "../../utils/format";

export function useCircuitDayPoi() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.circuitDayPois);

    const loadEnrichedFields = async () => {
        // Trois listes à croiser : les jours, leurs circuits (pour numéroter) et les POI
        const [daysResponse, circuitsResponse, poisResponse] = await Promise.all([
            findAllCircuitDaysApi(),
            findAllCircuitApi(),
            findAllPoisApi(),
        ]);

        const days         = daysResponse.data ?? [];
        const circuitsById = new Map((circuitsResponse.data ?? []).map(c => [c.id, c]));
        const pois         = poisResponse.data ?? [];

        const circuitDayOptions = days
            .map(d => ({
                label: formatCircuitDay(d, circuitsById.get(d.circuitId)),
                value: d.id,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "fr", { numeric: true }));   // ← « Jour 2 » avant « Jour 10 »

        // ← une option par couple (jour, POI de sa destination) : FormModal
        //   ne garde que celles dont le parent est le jour sélectionné
        const poiOptions = days.flatMap(d =>
            pois
                .filter(p => p.destinationId === d.destinationId)
                .map(p => ({ label: formatPoi(p), value: p.id, parent: d.id }))
        );

        const enrichedFields = createConstant.circuitDayPois.map(group =>
            group.map(field => {
                if (field.name === "circuitDayId") return { ...field, options: circuitDayOptions };
                if (field.name === "poiId")        return { ...field, options: poiOptions };
                return field;
            })
        );

        setFields(enrichedFields);
    };

    const createCircuitDayPoi = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des jours et points d'intérêt :", error);
        } finally {
            setOpen(true);
        }
    };

    const editCircuitDayPoi = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des jours et points d'intérêt :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createCircuitDayPoi,
        edit:   editCircuitDayPoi,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
