import { useEffect, useState } from "react";
import { findMesDevisApi } from "../../../api/client/devisApi";
import { useAuth } from "../../useAuth";
import { estDemandeVivante } from "../../../constants/client/devis";

// La demande de devis « vivante » du voyageur pour un circuit, s'il en a une :
// à l'étude, devis reçu ou accepté. La fiche du circuit et la page de demande
// s'en servent pour ne pas proposer « Demander un devis » une seconde fois.
// Null pour un visiteur, ou tant que la liste n'est pas arrivée.

export function useDemandeVivante(circuitId) {
    const { isAuthenticated } = useAuth();
    const [demande, setDemande] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || !circuitId) { setDemande(null); return undefined; }
        let vivant = true;
        findMesDevisApi()
            .then((r) => {
                if (!vivant) return;
                const liste = r?.data ?? [];
                setDemande(liste.find((d) => String(d.circuit?.id) === String(circuitId) && estDemandeVivante(d.statutAffiche)) ?? null);
            })
            .catch(() => { if (vivant) setDemande(null); });
        return () => { vivant = false; };
    }, [isAuthenticated, circuitId]);

    return demande;
}
