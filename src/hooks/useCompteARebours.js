import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Decompte en secondes, qui s'arrete tout seul a zero.
 *
 * Sert a rendre lisible un 429 : plutot qu'un bouton grise sans explication,
 * l'utilisateur voit combien de temps il lui reste a patienter.
 *
 * On s'appuie sur une echeance absolue et non sur un compteur decremente a
 * chaque tick : un onglet passe en arriere-plan voit ses timers ralentis par
 * le navigateur, et un simple « -1 » par tick prendrait du retard sur
 * l'horloge du serveur.
 */
export function useCompteARebours() {
    const [restant, setRestant] = useState(0);
    const [actif, setActif] = useState(false);
    const echeance = useRef(0);

    useEffect(() => {
        if (!actif) return undefined;
        const id = setInterval(() => {
            const secondes = Math.max(0, Math.ceil((echeance.current - Date.now()) / 1000));
            setRestant(secondes);
            if (secondes === 0) setActif(false);
        }, 250);
        return () => clearInterval(id);
    }, [actif]);

    const lancer = useCallback((secondes) => {
        if (!secondes || secondes <= 0) return;
        echeance.current = Date.now() + secondes * 1000;
        setRestant(secondes);
        setActif(true);
    }, []);

    const arreter = useCallback(() => {
        setActif(false);
        setRestant(0);
    }, []);

    return { restant, lancer, arreter };
}

/** « 2 min 05 » plutot que « 125 » — un nombre nu ne dit pas son unite. */
export const formaterAttente = (secondes) => {
    if (secondes <= 0) return "";
    if (secondes < 60) return `${secondes} s`;
    const min = Math.floor(secondes / 60);
    return `${min} min ${String(secondes % 60).padStart(2, "0")}`;
};
