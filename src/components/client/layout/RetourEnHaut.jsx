import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// ── Chaque page s'ouvre en haut ───────────────────────────────────────────
// Le navigateur restaure la position de défilement d'une page à l'autre, ce
// qui a du sens quand on revient en arrière — on retrouve la ligne qu'on
// lisait — et aucun sens quand on OUVRE une page : on arrive au milieu d'un
// contenu qu'on n'a jamais vu.
//
// D'où la distinction sur le type de navigation :
//
//   PUSH / REPLACE  une nouvelle page → on remonte en haut
//   POP             retour arrière    → on laisse le navigateur restaurer
//
// Tout remonter, y compris au retour, serait l'erreur inverse : quelqu'un qui
// ouvre une fiche circuit depuis le milieu de la liste puis revient doit
// retrouver sa place dans la liste, pas repartir du début.
//
// Le défilement est instantané, jamais animé : une page qui s'ouvre en
// glissant vers le haut donne l'impression d'avoir raté quelque chose.
export default function RetourEnHaut() {
    const { pathname } = useLocation();
    const type = useNavigationType();

    useEffect(() => {
        if (type === "POP") return;

        // Lenis (useSmoothScroll) pilote le défilement et garde sa propre
        // position : passer par window.scrollTo seul le laisserait revenir à
        // son ancienne valeur au premier cran de molette.
        const lenis = window.lenis;
        if (lenis?.scrollTo) {
            lenis.scrollTo(0, { immediate: true });
        }

        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname, type]);

    return null;
}
