import { useEffect, useRef } from "react";
import gsap from "gsap";

// Curseur en deux couches, comme sur les sites de maison :
// - un point qui colle exactement au pointeur
// - un anneau qui le rattrape avec du retard
// Le mix-blend-mode: difference (dans le CSS) l'inverse sur son fond :
// il reste lisible sur le sable, sur le noir et sur les photos.

const SUIVI = 0.5;          // retard de l'anneau, en secondes
const ECHELLE_SURVOL = 1.9; // grossissement au-dessus d'un élément cliquable
const ECHELLE_APPUI = 0.8;

const CLIQUABLE = 'a, button, [role="button"], label, summary, [data-cursor-hover]';
const SAISIE = 'input, textarea, select, [contenteditable="true"]';

export default function CursorClient() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        // Pas de curseur sur mesure au doigt ni au stylet
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        const racine = document.documentElement;
        racine.classList.add("has-custom-cursor");

        gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

        // quickSetter/quickTo écrivent directement dans le transform, sur le
        // ticker GSAP déjà en marche pour Lenis : aucune boucle rAF en plus.
        const posDotX = gsap.quickSetter(dot, "x", "px");
        const posDotY = gsap.quickSetter(dot, "y", "px");
        const posRingX = gsap.quickTo(ring, "x", { duration: SUIVI, ease: "power3" });
        const posRingY = gsap.quickTo(ring, "y", { duration: SUIVI, ease: "power3" });

        let visible = false;

        const onMove = (e) => {
            posDotX(e.clientX);
            posDotY(e.clientY);
            posRingX(e.clientX);
            posRingY(e.clientY);

            if (!visible) {
                visible = true;
                gsap.to([dot, ring], { opacity: 1, duration: 0.35, ease: "power2.out" });
            }
        };

        const etat = (mode) => {
            if (mode === "saisie") {
                // On rend la main au curseur natif : la barre de saisie porte du sens
                gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
                return;
            }
            const survol = mode === "survol";
            gsap.to(ring, {
                scale: survol ? ECHELLE_SURVOL : 1,
                borderColor: survol ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.85)",
                opacity: 1,
                duration: 0.4,
                ease: "power3.out",
            });
            gsap.to(dot, { scale: survol ? 0.6 : 1, opacity: 1, duration: 0.3, ease: "power3.out" });
        };

        const onOver = (e) => {
            const cible = e.target;
            if (typeof cible.closest !== "function") return;
            if (cible.closest(SAISIE)) return etat("saisie");
            etat(cible.closest(CLIQUABLE) ? "survol" : "repos");
        };

        const onDown = () => gsap.to(ring, { scale: ECHELLE_APPUI, duration: 0.25, ease: "power3.out" });
        const onUp = (e) => {
            const cliquable = e.target?.closest?.(CLIQUABLE);
            gsap.to(ring, { scale: cliquable ? ECHELLE_SURVOL : 1, duration: 0.35, ease: "power3.out" });
        };

        const onLeave = () => { visible = false; gsap.to([dot, ring], { opacity: 0, duration: 0.25 }); };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseover", onOver, { passive: true });
        window.addEventListener("mousedown", onDown, { passive: true });
        window.addEventListener("mouseup", onUp, { passive: true });
        document.addEventListener("mouseleave", onLeave);

        return () => {
            racine.classList.remove("has-custom-cursor");
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf([dot, ring]);
        };
    }, []);

    return (
        <>
            <div ref={ringRef} className="cursor-layer cursor-ring" aria-hidden="true" />
            <div ref={dotRef} className="cursor-layer cursor-dot" aria-hidden="true" />
        </>
    );
}
