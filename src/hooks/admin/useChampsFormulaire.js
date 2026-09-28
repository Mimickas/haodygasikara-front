import { useCallback, useEffect, useMemo, useState } from "react";
import { premierChampFautif, validerChamps } from "../../utils/validationChamps";

// ── La logique commune aux deux formulaires de l'administration ────────────
//
// Il y en a deux : la PAGE (CreateModal, pour créer ou modifier un circuit,
// une destination) et la FENÊTRE (FormModal, pour les listes). Ils lisaient la
// même déclaration de champs (createConstant.js) mais chacun avait son propre
// rendu, et ils avaient divergé :
//
//   * `radio`, `steps` et `inclusions` n'existaient que dans la page ;
//   * `dependsOn` — un champ dont les options dépendent d'un autre — n'existait
//     que dans la fenêtre ;
//   * aucun des deux ne vérifiait quoi que ce soit avant d'envoyer.
//
// Tout est ici, une fois : les valeurs, les dépendances, la validation. Les
// deux écrans ne gardent que leur habillage — une page a un pied collant, une
// fenêtre a une croix.

export function useChampsFormulaire(fields, values, coherence) {
    const plats = useMemo(() => fields.flat(), [fields]);

    const initiales = useCallback(() => plats.reduce((acc, field) => {
        acc[field.name] = values?.[field.name] ?? field.defaultValue ?? "";
        return acc;
    }, {}), [plats, values]);

    const [formData, setFormData] = useState(initiales);
    const [erreurs, setErreurs] = useState({});

    // Les valeurs relues arrivent après coup (la fenêtre rouvre sur une autre
    // ligne, la page charge sa fiche) : le formulaire les reprend.
    useEffect(() => {
        setFormData(initiales());
        setErreurs({});
    }, [initiales]);

    const setChamp = useCallback((name, val) => {
        // Corriger un champ efface son message : l'erreur ne survit pas à sa cause.
        setErreurs(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
        setFormData(prev => {
            const next = { ...prev, [name]: val };
            // Changer un champ vide ceux qui en dépendent, et leurs propres
            // dépendants : un hébergement d'une autre destination ne doit pas
            // rester sélectionné sous une étape qu'on vient de changer.
            let parents = [name];
            while (parents.length) {
                const enfants = plats.filter(f => parents.includes(f.dependsOn));
                enfants.forEach(f => { next[f.name] = f.defaultValue ?? ""; });
                parents = enfants.map(f => f.name);
            }
            return next;
        });
    }, [plats]);

    /** Les options d'un champ, filtrées par son parent s'il en a un. */
    const optionsDe = useCallback((field) => (field.dependsOn
        ? (field.options ?? []).filter(o => String(o.parent) === String(formData[field.dependsOn]))
        : (field.options ?? [])), [formData]);

    /**
     * Le libellé du champ parent tant qu'il n'est pas rempli, sinon null.
     * Un champ dépendant s'ouvrait jusqu'ici sur une liste vide, ce qui se lit
     * comme une panne : il reste fermé et dit de quoi il dépend.
     */
    const attenteDe = useCallback((field) => {
        if (!field.dependsOn || formData[field.dependsOn]) return null;
        return plats.find(f => f.name === field.dependsOn)?.label ?? null;
    }, [formData, plats]);

    /**
     * Vérifie tout. Renvoie true si c'est bon ; sinon pose les messages et met
     * le focus sur le premier champ fautif.
     */
    const valider = useCallback(() => {
        const fautes = Object.fromEntries(
            Object.entries(validerChamps(fields, formData, coherence)).filter(([, m]) => m));
        setErreurs(fautes);
        const premier = premierChampFautif(fields, fautes);
        if (premier) document.getElementById(`champ-${premier}`)?.focus();
        return !premier;
    }, [fields, formData, coherence]);

    return { formData, setFormData, setChamp, erreurs, valider, optionsDe, attenteDe };
}
