import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// ── La galerie des destinations, en mouvement ──────────────────────────────
//
//   * PREMIÈRE APPARITION : chaque photo se découvre de bas en haut
//     (clip-path) pendant qu'elle se pose en zoom arrière — les cadres de
//     l'accueil, en plus court. Le départ attend la levée du rideau.
//   * ENSUITE : l'ordre change souvent (la pertinence dépend de la dernière
//     étape, un filtre retire des cartes). GSAP Flip fait glisser chaque carte
//     de son ancienne place à la nouvelle ; celles qui arrivent montent en
//     fondu. Rien ne saute.
//
// Flip compare deux photographies des positions. La précédente est reprise à
// chaque défilement de la galerie : prise avant, elle ferait partir les cartes
// de là où elles étaient AVANT que l'on fasse défiler.

export function useGalerieVivante({ defileRef, grilleRef, cle, pret }) {
    const etat = useRef(null);
    const premiere = useRef(true);

    useEffect(() => {
        const defile = defileRef.current;
        if (!defile) return undefined;
        let raf = null;
        const capturer = () => {
            raf = null;
            const cartes = grilleRef.current?.querySelectorAll("[data-cp-carte]");
            if (cartes?.length) etat.current = Flip.getState(cartes);
        };
        const programmer = () => { if (!raf) raf = requestAnimationFrame(capturer); };
        defile.addEventListener("scroll", programmer, { passive: true });
        window.addEventListener("resize", programmer);
        return () => {
            defile.removeEventListener("scroll", programmer);
            window.removeEventListener("resize", programmer);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [defileRef, grilleRef]);

    useLayoutEffect(() => {
        const grille = grilleRef.current;
        if (!pret || !grille) return;
        const cartes = grille.querySelectorAll("[data-cp-carte]");
        if (!cartes.length) {
            etat.current = null;
            return;
        }

        if (!SOBRE()) {
            if (premiere.current) {
                const photos = grille.querySelectorAll("[data-cp-carte] img");
                gsap.fromTo(cartes,
                    { clipPath: "inset(100% 0% 0% 0%)" },
                    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power4.out", stagger: 0.08, delay: 0.7, clearProps: "clipPath" });
                if (photos.length) {
                    gsap.fromTo(photos,
                        { scale: 1.3 },
                        { scale: 1, duration: 2, ease: "power2.out", stagger: 0.08, delay: 0.7, clearProps: "transform" });
                }
            } else if (etat.current) {
                Flip.from(etat.current, {
                    targets: cartes,
                    duration: 0.85,
                    ease: "power3.inOut",
                    absolute: false,
                    clearProps: "transform",
                    onEnter: (entrees) => gsap.fromTo(entrees,
                        { opacity: 0, y: 36 },
                        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.05, clearProps: "transform,opacity" }),
                });
            }
        }
        premiere.current = false;
        etat.current = Flip.getState(cartes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cle, pret]);
}
