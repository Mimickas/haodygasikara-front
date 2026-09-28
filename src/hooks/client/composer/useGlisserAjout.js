import { useCallback, useEffect, useRef, useState } from "react";
import { SEUIL_GLISSEMENT_PX } from "../../../constants/client/composer";

// ── Glisser une destination du catalogue vers l'itinéraire ─────────────────
//
// Frère de useReorderDrag (qui réordonne les étapes) : mêmes événements
// pointeur, même refus du fantôme du navigateur. Ici, une vignette dessinée
// par nous suit le curseur, et une ligne d'insertion montre où l'étape va
// tomber dans l'itinéraire.
//
//   * Un appui qui ne bouge pas de plus de 6 px est un CLIC : il ouvre la
//     fiche de la destination.
//   * Au-delà, c'est un GLISSEMENT : la vignette apparaît, la zone
//     d'itinéraire s'éclaire au survol, et le lâcher insère l'étape à
//     l'endroit indiqué.
//   * Souris uniquement. Au doigt, glisser fait défiler le catalogue — c'est
//     ce qu'on attend d'une liste sur téléphone ; le bouton « + » ajoute.
//
// Pendant le geste, la vignette bouge par écriture directe de `transform`,
// dans un requestAnimationFrame : aucun rendu React à chaque mouvement. Le
// state ne change que quand l'index d'insertion change.

export function useGlisserAjout({ zoneRef, listeRef, onDeposer, onClic }) {
    const [glisse, setGlisse] = useState(null);          // la destination en cours de glissement
    const [insertion, setInsertion] = useState(null);    // index d'insertion, null hors de la zone

    const geste = useRef(null);
    const fantome = useRef(null);
    const raf = useRef(null);
    const pointeur = useRef({ x: 0, y: 0 });
    const insertionRef = useRef(null);

    const rappels = useRef({ onDeposer, onClic });
    useEffect(() => { rappels.current = { onDeposer, onClic }; }, [onDeposer, onClic]);

    const nettoyer = useCallback(() => {
        if (raf.current) cancelAnimationFrame(raf.current);
        raf.current = null;
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");
        const f = fantome.current;
        fantome.current = null;
        if (f) {
            f.classList.add("cx-cp-fantome--sortie");
            setTimeout(() => f.remove(), 220);
        }
        geste.current = null;
        insertionRef.current = null;
        setGlisse(null);
        setInsertion(null);
    }, []);

    // Où tomberait l'étape : avant la première ligne dont le milieu est sous le curseur.
    const calculerInsertion = useCallback(() => {
        const zone = zoneRef.current;
        if (!zone) return null;
        const { x, y } = pointeur.current;
        const r = zone.getBoundingClientRect();
        if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
        const lignes = [...(listeRef.current?.querySelectorAll("[data-reorder-row]") ?? [])];
        const index = lignes.findIndex((el) => {
            const b = el.getBoundingClientRect();
            return y < b.top + b.height / 2;
        });
        return index === -1 ? lignes.length : index;
    }, [zoneRef, listeRef]);

    const boucle = useCallback(() => {
        const f = fantome.current;
        if (f) f.style.transform = `translate3d(${pointeur.current.x + 14}px, ${pointeur.current.y + 14}px, 0)`;
        const i = calculerInsertion();
        if (i !== insertionRef.current) {
            insertionRef.current = i;
            setInsertion(i);
        }
        raf.current = requestAnimationFrame(boucle);
    }, [calculerInsertion]);

    const commencerGlissement = useCallback((destination) => {
        const f = document.createElement("div");
        f.className = "cx-cp-fantome";
        const img = destination.image ? `<span class="cx-cp-fantome__image" style="background-image:url('${encodeURI(destination.image)}')"></span>` : "";
        const nom = document.createElement("span");
        nom.className = "cx-cp-fantome__nom";
        nom.textContent = destination.nom;          // textContent : jamais de HTML venu des données
        f.innerHTML = img;
        f.appendChild(nom);
        document.body.appendChild(f);
        fantome.current = f;
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        setGlisse(destination);
        raf.current = requestAnimationFrame(boucle);
    }, [boucle]);

    useEffect(() => {
        const bouger = (e) => {
            const g = geste.current;
            if (!g) return;
            pointeur.current = { x: e.clientX, y: e.clientY };
            const bouge = Math.hypot(e.clientX - g.x, e.clientY - g.y) > SEUIL_GLISSEMENT_PX;
            // Au doigt, bouger, c'est faire défiler la liste : le geste s'arrête là, sans clic.
            if (g.tactile) {
                if (bouge) geste.current = null;
                return;
            }
            if (!g.lance && bouge) {
                g.lance = true;
                commencerGlissement(g.destination);
            }
        };
        const lacher = () => {
            const g = geste.current;
            if (!g) return;
            if (!g.lance) {
                geste.current = null;
                rappels.current.onClic?.(g.destination);
                return;
            }
            const index = insertionRef.current;
            if (index != null) rappels.current.onDeposer?.(g.destination, index);
            nettoyer();
        };
        const echap = (e) => { if (e.key === "Escape" && geste.current?.lance) nettoyer(); };

        window.addEventListener("pointermove", bouger);
        window.addEventListener("pointerup", lacher);
        window.addEventListener("pointercancel", nettoyer);
        window.addEventListener("keydown", echap);
        return () => {
            window.removeEventListener("pointermove", bouger);
            window.removeEventListener("pointerup", lacher);
            window.removeEventListener("pointercancel", nettoyer);
            window.removeEventListener("keydown", echap);
        };
    }, [commencerGlissement, nettoyer]);

    useEffect(() => () => nettoyer(), [nettoyer]);

    const carteProps = useCallback((destination) => ({
        onPointerDown: (e) => {
            if (e.button !== 0) return;
            if (e.target.closest("button, a, input")) return;      // les boutons de la fiche gardent leur clic
            if (e.pointerType !== "mouse") {
                geste.current = { destination, x: e.clientX, y: e.clientY, lance: false, tactile: true };
                return;
            }
            e.preventDefault();
            geste.current = { destination, x: e.clientX, y: e.clientY, lance: false };
            pointeur.current = { x: e.clientX, y: e.clientY };
        },
    }), []);

    return { carteProps, glisse, insertion };
}
