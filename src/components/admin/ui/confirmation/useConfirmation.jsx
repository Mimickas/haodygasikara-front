import { useCallback, useState } from "react";
import ModaleConfirmation from "./ModaleConfirmation";

// ── Demander confirmation, dans la charte ──────────────────────────────────
//
// Remplace window.confirm() : même fenêtre que les formulaires (filet d'un
// pixel, sur-titre, titre serif), Échap ou un clic dehors annulent.
//
//   const { confirmer, modale } = useConfirmation();
//   if (!(await confirmer({ titre, texte, action: "Supprimer" }))) return;
//   …
//   return <>{…}{modale}</>;

export function useConfirmation() {
    const [demande, setDemande] = useState(null);

    const confirmer = useCallback((options) => new Promise((resoudre) => {
        setDemande({ ...options, resoudre });
    }), []);

    const repondre = useCallback((oui) => {
        setDemande((d) => {
            d?.resoudre(oui);
            return null;
        });
    }, []);

    const modale = demande ? (
        <ModaleConfirmation {...demande} onAnnuler={() => repondre(false)} onConfirmer={() => repondre(true)} />
    ) : null;

    return { confirmer, modale };
}
