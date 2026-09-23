import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { getDestinationsApi } from "../../api/admin/destinations";
import { findAllCategoryPoisApi } from "../../api/admin/categoryPoiApi";

export function usePoi() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.pois);

    const loadEnrichedFields = async () => {
        // Deux listes déroulantes à alimenter : on les charge en parallèle
        const [destinationsResponse, categoriesResponse] = await Promise.all([
            getDestinationsApi(),
            findAllCategoryPoisApi(),
        ]);

        const destinationOptions = (destinationsResponse.data ?? []).map(d => ({
            label: d.nom,
            value: d.id,
        }));

        const categoryPoiOptions = (categoriesResponse.data ?? []).map(c => ({
            label: c.isHebergement ? `${c.name} (hébergement)` : c.name,   // ← l'admin sait tout de suite où l'on peut dormir
            value: c.id,
        }));

        const enrichedFields = createConstant.pois.map(group =>
            group.map(field => {
                if (field.name === "destinationId") return { ...field, options: destinationOptions };
                if (field.name === "categoryPoiId") return { ...field, options: categoryPoiOptions };
                return field;
            })
        );

        setFields(enrichedFields);
    };

    const createPoi = async () => {
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des destinations et catégories :", error);
        } finally {
            setOpen(true);
        }
    };

    const editPoi = async () => {     // ← même logique, même enrichissement
        try {
            await loadEnrichedFields();
        } catch (error) {
            console.error("Erreur chargement des destinations et catégories :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        create: createPoi,
        edit:   editPoi,
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
