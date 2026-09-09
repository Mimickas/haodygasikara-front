import { useCallback, useEffect, useRef, useState } from "react";

// Réordonnancement d'une liste au glisser-déposer, en événements pointeur.
//
// Pourquoi pas l'API HTML5 native (`draggable` + `dragstart`) comme côté
// administration : elle impose le fantôme du navigateur — une capture
// translucide de la ligne, rognée et désaturée — qu'on ne peut ni styler ni
// remplacer. Ici la ligne saisie reste la vraie ligne : on la déplace en
// `transform`, les voisines s'écartent en transition, et la liste garde son
// dessin. C'est le comportement d'une file d'attente de lecteur audio.
//
// Trois points tenus :
//   * pendant le geste, aucun rendu React — tout passe par des écritures
//     directes de `style.transform`. Le state ne bouge qu'au début et à la fin ;
//   * les hauteurs sont mesurées une seule fois, au début du geste, en
//     coordonnées de la liste (`offsetTop`) et non de l'écran : le défilement
//     automatique ne fausse donc aucun calcul ;
//   * `setPointerCapture` sur la poignée : le geste survit à une sortie du
//     curseur hors de la ligne, du panneau ou de la fenêtre.
//
// La liste doit porter `listRef` et un `position: relative` (les `offsetTop`
// des lignes s'y rapportent) ; chaque ligne porte `data-reorder-row`.

const TRANSITION = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)";

// Bande (en px) le long des bords du conteneur défilant qui entraîne le
// défilement automatique. Large : la barre condensée et le bandeau d'appel à
// l'action recouvrent déjà une soixantaine de pixels en haut comme en bas.
const BORD_AUTOSCROLL = 130;
const VITESSE_MAX = 20;

/**
 * @param {object}   options
 * @param {number}   options.count            nombre de lignes (borne du clavier)
 * @param {Function} options.onReorder        (depuis, vers) — à appliquer au modèle
 * @param {string}   options.scrollerSelector conteneur défilant, cherché en remontant
 */
export function useReorderDrag({ count, onReorder, scrollerSelector = "[data-panel-scroller]" }) {
    const listRef = useRef(null);
    // Seul état exposé au rendu : la ligne saisie, pour son élévation.
    const [dragIndex, setDragIndex] = useState(null);

    const geo = useRef(null);        // { lignes, tops, hauteurs } figés au début du geste
    const source = useRef(null);     // index saisi
    const cible = useRef(null);      // index d'arrivée visé
    const grab = useRef(0);          // écart entre le point de saisie et le haut de la ligne
    const pointerY = useRef(0);
    const scroller = useRef(null);
    const raf = useRef(null);

    const onReorderRef = useRef(onReorder);
    useEffect(() => { onReorderRef.current = onReorder; }, [onReorder]);

    // Replace la ligne saisie sous le curseur, décale les voisines et met à
    // jour l'index d'arrivée. Appelée à chaque mouvement et à chaque cran de
    // défilement automatique — jamais ailleurs.
    const majPositions = useCallback(() => {
        const liste = listRef.current;
        const g = geo.current;
        if (!liste || !g) return;

        const i = source.current;
        const hauteur = g.hauteurs[i];
        // Haut de la ligne saisie, exprimé dans le repère de la liste.
        const haut = pointerY.current - liste.getBoundingClientRect().top - grab.current;
        const centre = haut + hauteur / 2;

        // On avance d'un cran tant que le centre de la ligne saisie a dépassé
        // celui de sa voisine. Les repères comparés sont ceux d'origine : les
        // voisines sont décalées visuellement, pas dans la mesure.
        let t = i;
        while (t + 1 < g.lignes.length && centre > g.tops[t + 1] + g.hauteurs[t + 1] / 2) t += 1;
        while (t - 1 >= 0 && centre < g.tops[t - 1] + g.hauteurs[t - 1] / 2) t -= 1;
        cible.current = t;

        g.lignes.forEach((el, k) => {
            if (k === i) {
                el.style.transform = `translate3d(0, ${haut - g.tops[i]}px, 0)`;
                return;
            }
            const ecart = k > i && k <= t ? -hauteur : k < i && k >= t ? hauteur : 0;
            el.style.transform = ecart ? `translate3d(0, ${ecart}px, 0)` : "";
        });
    }, []);

    useEffect(() => {
        if (dragIndex === null) return undefined;

        const suivre = (e) => {
            pointerY.current = e.clientY;
            majPositions();
        };

        // Défilement automatique près des bords. La boucle ne travaille que
        // lorsqu'elle défile réellement : hors des bandes, elle ne fait que se
        // reprogrammer.
        const boucle = () => {
            const sc = scroller.current;
            if (sc) {
                const { top, bottom } = sc.getBoundingClientRect();
                const versHaut = pointerY.current - top;
                const versBas = bottom - pointerY.current;

                let pas = 0;
                if (versHaut < BORD_AUTOSCROLL) {
                    pas = -Math.min(VITESSE_MAX, (BORD_AUTOSCROLL - versHaut) / 5 + 3);
                } else if (versBas < BORD_AUTOSCROLL) {
                    pas = Math.min(VITESSE_MAX, (BORD_AUTOSCROLL - versBas) / 5 + 3);
                }

                if (pas) {
                    const avant = sc.scrollTop;
                    sc.scrollTop += pas;
                    if (sc.scrollTop !== avant) majPositions();
                }
            }
            raf.current = requestAnimationFrame(boucle);
        };

        // Les styles sont remis à zéro avant le `setDragIndex` : entre les deux
        // aucune peinture n'a lieu, la ligne ne clignote donc pas à sa place
        // d'origine avant que React ne redonne le nouvel ordre.
        const terminer = () => {
            const g = geo.current;
            const depuis = source.current;
            const vers = cible.current;

            g?.lignes.forEach((el) => {
                el.style.transition = "";
                el.style.transform = "";
                el.style.removeProperty("will-change");
            });

            geo.current = null;
            source.current = null;
            cible.current = null;
            document.body.style.removeProperty("cursor");
            document.body.style.removeProperty("user-select");
            setDragIndex(null);

            if (depuis != null && vers != null && depuis !== vers) onReorderRef.current?.(depuis, vers);
        };

        window.addEventListener("pointermove", suivre);
        window.addEventListener("pointerup", terminer);
        window.addEventListener("pointercancel", terminer);
        raf.current = requestAnimationFrame(boucle);

        return () => {
            window.removeEventListener("pointermove", suivre);
            window.removeEventListener("pointerup", terminer);
            window.removeEventListener("pointercancel", terminer);
            if (raf.current) cancelAnimationFrame(raf.current);
            raf.current = null;
        };
    }, [dragIndex, majPositions]);

    const commencer = useCallback((index) => (e) => {
        // Bouton principal uniquement : un clic droit ne saisit rien.
        if (e.button != null && e.button !== 0) return;

        const liste = listRef.current;
        if (!liste) return;
        const lignes = [...liste.querySelectorAll("[data-reorder-row]")];
        if (lignes.length < 2) return;

        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);

        geo.current = {
            lignes,
            tops: lignes.map((el) => el.offsetTop),
            hauteurs: lignes.map((el) => el.offsetHeight),
        };
        source.current = index;
        cible.current = index;
        grab.current = e.clientY - liste.getBoundingClientRect().top - geo.current.tops[index];
        pointerY.current = e.clientY;
        scroller.current = liste.closest(scrollerSelector);

        lignes.forEach((el, k) => {
            // La ligne saisie colle au curseur, les voisines s'écartent en douceur.
            el.style.transition = k === index ? "none" : TRANSITION;
            el.style.willChange = "transform";
        });

        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        setDragIndex(index);
    }, [scrollerSelector]);

    // Même déplacement au clavier. Le focus suit la ligne, sinon la flèche
    // suivante agirait sur une autre étape que celle qu'on vient de bouger.
    const deplacer = useCallback((index, delta) => {
        const vers = Math.min(Math.max(index + delta, 0), count - 1);
        if (vers === index) return;
        onReorderRef.current?.(index, vers);
        requestAnimationFrame(() => {
            listRef.current?.querySelectorAll("[data-reorder-handle]")[vers]?.focus();
        });
    }, [count]);

    const poigneeProps = useCallback((index) => ({
        "data-reorder-handle": "",
        onPointerDown: commencer(index),
        onKeyDown: (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                deplacer(index, -1);
            } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                deplacer(index, 1);
            }
        },
        // Sans ça, un glissement au doigt fait défiler le panneau au lieu de saisir.
        style: { touchAction: "none" },
    }), [commencer, deplacer]);

    return { listRef, dragIndex, poigneeProps, deplacer };
}
