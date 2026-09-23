import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { findAllCircuitApi } from "../../api/admin/circuit";
import { findAllPoisApi } from "../../api/admin/poiApi";
import { circuitSteps } from "../../utils/circuit";
import { formatCircuitStep, formatPoi } from "../../utils/format";

export function useCircuitDay() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.circuitDays);

    const loadEnrichedFields = async () => {
        // Les étapes viennent des circuits, les hébergements des POI : on charge les deux en parallèle
        const [circuitsResponse, poisResponse] = await Promise.all([
            findAllCircuitApi(),
            findAllPoisApi(),
        ]);

        const pois  = poisResponse.data ?? [];
        const steps = (circuitsResponse.data ?? []).flatMap(circuit =>
            circuitSteps(circuit).map(step => ({ circuit, step }))
        );

        const circuitStepOptions = steps.map(({ circuit, step }) => ({
            label: formatCircuitStep(circuit, step),
            value: step.id,
        }));

        // ← une option par couple (étape, hébergement de sa destination) : FormModal
        //   ne garde que celles dont le parent est l'étape sélectionnée
        const hebergementOptions = steps.flatMap(({ step }) =>
            pois
                .filter(p => p.categoryPoi?.isHebergement && p.destinationId === step.idDestination)
                .map(p => ({ label: formatPoi(p), value: p.id, parent: step.id }))
        );

        const enrichedFields = createConstant.circuitDays.map(group =>
            group.map(field => {
                if (field.name === "circuitStepId") return { ...field, options: circuitStepOptions };
                if (field.name === "hebergementId") return { ...field, options: hebergementOptions };
                return field;
            })
        );

        setFields(enrichedFields);
    };

    const createCircuitDay = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des étapes et hébergements :", error);
        } finally {
            setOpen(true);
        }
    };

    const editCircuitDay = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des étapes et hébergements :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createCircuitDay,
        edit:   editCircuitDay,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
