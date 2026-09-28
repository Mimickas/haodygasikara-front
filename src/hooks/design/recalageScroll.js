import { ScrollTrigger } from "gsap/ScrollTrigger";

// ── Recaler les déclencheurs quand la page cesse de bouger ────────────────
//
// Un ScrollTrigger mesure la position de sa cible AU MOMENT où on le pose.
// Si la page bouge ensuite — une photo qui finit d'arriver, une police qui
// se substitue, une liste qui remplace son squelette —, cette mesure devient
// fausse et le déclencheur reste posé sur une position qui n'existe plus.
//
// Les deux symptômes viennent de là, et ce sont les deux qu'on nous rapporte :
//
//   * la page a GRANDI au-dessus du bloc → le déclencheur est trop HAUT :
//     l'entrée se joue hors champ, et on découvre un bloc déjà figé, comme
//     s'il ne s'animait pas ;
//   * la page a RÉTRÉCI au-dessus du bloc → le déclencheur est trop BAS :
//     on passe devant le bloc sans rien voir, et il n'apparaît qu'une fois
//     descendu bien plus loin.
//
// Un `ScrollTrigger.refresh()` appelé dans la foulée de la création ne répare
// rien : à cet instant, précisément, rien n'est encore arrivé. Il faut
// recaler APRÈS, et à chaque fois que la hauteur du document change.
//
// D'où ce module : une seule façon de recaler, partagée par toutes les
// révélations, qui écoute les trois choses qui déplacent un bloc — les
// images de la zone, le chargement complet de la page, et toute variation de
// hauteur du document (polices, contenus asynchrones, barre d'URL mobile).

const DELAI = 80;

/**
 * @param {ParentNode} [racine]  la zone dont les images comptent ; à défaut, le document
 * @returns {() => void}         à appeler au démontage
 */
export function recalerQuandLaPageSeStabilise(racine) {
    if (typeof window === "undefined") return () => {};

    const zone = racine ?? document;
    let minuteur = null;
    let derniereHauteur = -1;

    const recaler = () => {
        clearTimeout(minuteur);
        minuteur = setTimeout(() => {
            // Recaler coûte une relecture de toute la page : on ne le fait que
            // si elle a effectivement changé de hauteur. Une photo qui arrive
            // dans un cadre à hauteur fixe ne déplace rien — rien à recalculer.
            const hauteur = document.documentElement.scrollHeight;
            if (hauteur === derniereHauteur) return;
            derniereHauteur = hauteur;
            ScrollTrigger.refresh();
        }, DELAI);
    };

    // Le premier recalage, une fois la frame peinte : c'est lui qui rattrape
    // l'écart entre « React a rendu » et « le navigateur a mis en page ».
    const frame = requestAnimationFrame(recaler);

    // Les images pas encore arrivées. `complete` est vrai pour celles qui le
    // sont déjà (cache) : on ne s'abonne qu'aux autres.
    const images = Array.from(zone.querySelectorAll?.("img") ?? []).filter((img) => !img.complete);
    images.forEach((img) => {
        img.addEventListener("load", recaler);
        img.addEventListener("error", recaler);
    });

    window.addEventListener("load", recaler);

    // Le filet : tout ce qui change la hauteur du document passe par là, y
    // compris ce qu'on n'a pas prévu.
    const observateur = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(recaler);
    observateur?.observe(document.body);

    return () => {
        cancelAnimationFrame(frame);
        clearTimeout(minuteur);
        images.forEach((img) => {
            img.removeEventListener("load", recaler);
            img.removeEventListener("error", recaler);
        });
        window.removeEventListener("load", recaler);
        observateur?.disconnect();
    };
}

/** Le mouvement n'est pas un dû : qui demande la sobriété reçoit la page, sans entrée. */
export const mouvementSobre = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
