import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";
import { findReservationStatutsApi } from "../../api/admin/reservationApi";

// Le formulaire de changement de statut.
//
// La liste déroulante est alimentée par le référentiel du back
// (/admin/reservations/statuts) : l'écran ne redéclare aucun statut. Ajouter
// « EN_ATTENTE_ACOMPTE » en base suffira à le voir apparaître ici, sans
// toucher au front — c'est tout l'intérêt d'avoir sorti le statut dans une
// table plutôt que dans un enum compilé.
export function useReservation() {
    const [open, setOpen] = useState(false);
    const [fields, setFields] = useState(createConstant.reservations);

    const chargerStatuts = async () => {
        const reponse = await findReservationStatutsApi();
        // value = le nom gravé (ce qui part au serveur), label = le libellé
        const options = (reponse?.data ?? []).map(s => ({
            label: s.label,
            value: s.value,
        }));

        setFields(createConstant.reservations.map(group =>
            group.map(field =>
                field.name === "statut" ? { ...field, options } : field
            )
        ));
    };

    const ouvrir = async () => {
        try {
            await chargerStatuts();
        } catch (error) {
            console.error("Erreur chargement des statuts de réservation :", error);
        } finally {
            setOpen(true);
        }
    };

    const actions = {
        // Pas de `create` : une réservation naît d'une demande du visiteur.
        edit:   ouvrir,
        export: () => console.log("export réservations"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
