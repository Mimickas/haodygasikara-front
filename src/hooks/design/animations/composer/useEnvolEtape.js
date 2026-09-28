import { useCallback, useMemo, useRef } from "react";
import gsap from "gsap";

// Ajout par « + » : la photo de la destination quitte sa carte et vole
// jusqu'au numéro de la nouvelle étape, où elle se fond. Le geste relie les
// deux moitiés de l'écran — on voit OÙ l'étape est allée, sans le lire.
//
// Deux temps, parce que la cible n'existe pas encore au moment du clic :
//   * preparer(photo) note le cadre de départ au clic ;
//   * lancer(numero) part quand la ligne de l'itinéraire est dans le DOM
//     (appelé par l'itinéraire à l'entrée de la ligne).
// Une préparation vieille de plus d'une seconde et demie est oubliée : elle
// ne correspond plus à rien de ce que l'on voit.

const PEREMPTION_MS = 1500;
const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function useEnvolEtape() {
    const enAttente = useRef(null);

    const preparer = useCallback((photo, image) => {
        enAttente.current = photo && image
            ? { cadre: photo.getBoundingClientRect(), image, le: Date.now() }
            : null;
    }, []);

    /** @returns {boolean} vrai si un envol a été lancé (la ligne peut alors attendre qu'il arrive). */
    const lancer = useCallback((cible) => {
        const depart = enAttente.current;
        enAttente.current = null;
        if (!depart || !cible || Date.now() - depart.le > PEREMPTION_MS || SOBRE()) return false;

        const arrivee = cible.getBoundingClientRect();
        // Itinéraire masqué (onglets du téléphone) : rien vers où voler.
        if (!arrivee.width || !arrivee.height) return false;

        const vol = document.createElement("div");
        vol.className = "cx-cp-envol";
        vol.style.backgroundImage = `url("${encodeURI(depart.image)}")`;
        Object.assign(vol.style, {
            left: `${depart.cadre.left}px`,
            top: `${depart.cadre.top}px`,
            width: `${depart.cadre.width}px`,
            height: `${depart.cadre.height}px`,
        });
        document.body.appendChild(vol);

        gsap.timeline({ onComplete: () => vol.remove() })
            .to(vol, {
                left: arrivee.left,
                top: arrivee.top,
                width: arrivee.width,
                height: arrivee.height,
                duration: 0.9,
                ease: "power3.inOut",
            })
            .to(vol, { opacity: 0, duration: 0.35, ease: "power2.out" }, "-=0.12");
        return true;
    }, []);

    return useMemo(() => ({ preparer, lancer }), [preparer, lancer]);
}
