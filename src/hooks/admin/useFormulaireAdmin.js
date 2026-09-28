import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiErrorMessage } from "../../utils/apiError";

// Le formulaire d'une page de création ou de modification de l'administration.
//
// La liste l'ouvre en lui passant champs et valeurs dans l'état de navigation.
// Mais une page ouverte DIRECTEMENT — lien collé, rechargement (F5) — n'a pas
// cet état : elle plantait sur « Cannot destructure property 'fields' ».
// Elle se charge maintenant elle-même, avec `charger` ({ fields, values? }).
export function useFormulaireAdmin(charger) {
    const { state } = useLocation();
    const [formulaire, setFormulaire] = useState(
        state?.fields ? { fields: state.fields, values: state.values } : null);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        if (formulaire) return undefined;
        let actif = true;
        charger()
            .then((f) => actif && setFormulaire(f))
            .catch((e) => actif && setErreur(apiErrorMessage(e, "Le formulaire n'a pas pu être chargé.")));
        return () => { actif = false; };
        // Une seule fois : l'état de navigation ou le chargement, pas les deux
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { formulaire, erreur };
}
