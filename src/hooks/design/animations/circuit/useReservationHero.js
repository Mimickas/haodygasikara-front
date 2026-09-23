import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── L'ouverture de la page de réservation ─────────────────────────────────
//
// Le même geste que partout ailleurs sur le site : la photographie se pose
// depuis une échelle légèrement supérieure, le texte monte, les panneaux
// d'étapes se posent l'un après l'autre.
//
// Les deux règles du projet tiennent ici comme ailleurs : on ne fait bouger
// qu'`opacity` et `transform`, et `clearProps` rend l'écran au repos
// exactement tel que la feuille de style le décrit. Retirer cet appel retire
// toute la chorégraphie, et il ne reste rien.
//
// Une prudence propre à CETTE page : l'animation ne doit jamais retarder la
// lecture d'un formulaire. Les durées sont courtes, et les panneaux ne
// dépendent d'aucun défilement pour apparaître au-delà du premier écran — un
// déclencheur mal placé laisserait un champ invisible.

const SOBRE = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** @param {boolean} pret false tant que le circuit n'est pas chargé. */
export function useReservationHero(pret) {
    useEffect(() => {
        if (!pret || SOBRE()) return;

        const contexte = gsap.context(() => {
            const vise = (s) => {
                const trouves = gsap.utils.toArray(s);
                return trouves.length ? trouves : null;
            };

            const media = vise("[data-resa-media]");
            const items = vise("[data-resa-item]");
            const etapes = vise("[data-resa-etape]");

            const ouverture = gsap.timeline();

            if (media) {
                ouverture.from(media, {
                    scale: 1.07,
                    duration: 1.7,
                    ease: "expo.out",
                    clearProps: "transform",
                }, 0);
            }

            if (items) {
                ouverture.from(items, {
                    y: 22,
                    opacity: 0,
                    duration: 0.85,
                    stagger: 0.08,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                }, 0.18);
            }

            // Les trois panneaux se posent tout de suite, sans ScrollTrigger :
            // ce sont des champs à remplir, pas un récit à dérouler.
            if (etapes) {
                ouverture.from(etapes, {
                    y: 26,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                }, 0.4);
            }
        });

        return () => contexte.revert();
    }, [pret]);
}
