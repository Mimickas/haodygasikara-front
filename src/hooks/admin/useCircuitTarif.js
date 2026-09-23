import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { findAllCircuitDateTarifsApi } from "../../api/admin/circuitDateTarifApi";
import { findAllCategoryTarifsApi } from "../../api/admin/categoryTarifApi";
import { findAllDevisesApi } from "../../api/admin/deviseApi";
import { formatCircuitDate } from "../../utils/format";

export function useCircuitTarif() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.circuitTarifs);

    const loadEnrichedFields = async () => {
        // Trois listes déroulantes à alimenter : on les charge en parallèle
        const [datesResponse, categoriesResponse, devisesResponse] = await Promise.all([
            findAllCircuitDateTarifsApi(),
            findAllCategoryTarifsApi(),
            findAllDevisesApi(),
        ]);

        // ← on choisit une DATE de départ, plus un circuit : le libellé porte les deux
        const circuitDateTarifOptions = (datesResponse.data ?? [])
            .map(d => ({
                label: formatCircuitDate(d),
                value: d.id,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "fr"));

        const categoryTarifOptions = (categoriesResponse.data ?? []).map(c => ({
            label: c.name,
            value: c.id,
        }));

        const deviseOptions = (devisesResponse.data ?? []).map(d => ({
            label: `${d.name} (${d.code})`,
            value: d.id,
        }));

        const enrichedFields = createConstant.circuitTarifs.map(group =>
            group.map(field => {
                if (field.name === "circuitDateTarifId") return { ...field, options: circuitDateTarifOptions };
                if (field.name === "categoryTarifId")    return { ...field, options: categoryTarifOptions };
                if (field.name === "deviseId")           return { ...field, options: deviseOptions };
                return field;
            })
        );

        setFields(enrichedFields);
    };

    const createCircuitTarif = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des dates, catégories et devises :", error);
        } finally {
            setOpen(true);
        }
    };

    const editCircuitTarif = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des dates, catégories et devises :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createCircuitTarif,
        edit:   editCircuitTarif,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
