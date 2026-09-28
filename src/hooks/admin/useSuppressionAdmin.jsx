import { useState } from "react";
import { useConfirmation } from "../../components/admin/ui/confirmation/useConfirmation";
import { apiErrorMessage } from "../../utils/apiError";

// ── Supprimer une ligne, partout pareil ────────────────────────────────────
//
// Confirmation dans la charte, appel au serveur, rechargement ; un refus
// (« cette étiquette est portée par une destination… ») s'affiche en tête de
// page avec la phrase du serveur.
//
//   const suppression = useSuppressionAdmin({ supprimer: deleteTagApi, apres: charger,
//       titre: "Supprimer cette étiquette ?", texte: "…" });
//   <DataTable onDelete={suppression.demander} … />
//   <BandeauErreur message={suppression.erreur} onFermer={() => suppression.setErreur(null)} />
//   {suppression.modale}

export function useSuppressionAdmin({ supprimer, apres, titre, texte, action = "Supprimer" }) {
    const { confirmer, modale } = useConfirmation();
    const [erreur, setErreur] = useState(null);

    const demander = async (id) => {
        if (!(await confirmer({ titre, texte, action, surtitre: "Suppression" }))) return;
        try {
            await supprimer(id);
            setErreur(null);
            await apres?.();
        } catch (error) {
            setErreur(apiErrorMessage(error, "La suppression n'a pas abouti."));
        }
    };

    return { demander, erreur, setErreur, modale };
}
