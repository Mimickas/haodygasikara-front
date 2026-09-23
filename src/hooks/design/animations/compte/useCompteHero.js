import { useEffect } from "react";
import gsap from "gsap";

// ── L'ouverture du hero de l'espace voyageur ──────────────────────────────
//
// Le même geste que l'accueil et que la fiche circuit, décliné : la photo se
// pose depuis une échelle légèrement supérieure, l'accroche et le nom montent
// de sous leur masque, le filet se TRACE depuis la gauche — il ne s'allume pas
// — puis le pied se pose.
//
// Deux règles, comme partout ailleurs dans le projet :
//   • on ne fait bouger qu'`opacity` et `transform`, les deux propriétés que le
//     compositeur traite seul, sans refaire la mise en page ;
//   • `clearProps` à la fin, donc l'écran au repos est exactement celui que la
//     feuille de style décrit. Retirer cet appel retire toute la chorégraphie,
//     et il ne reste rien.
//
// Pas de ScrollTrigger ici : ce hero est au-dessus de la ligne de flottaison,
// il se joue au chargement. Un déclencheur au défilement ne partirait jamais.

const SOBRE = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** @param {boolean} pret false tant que le compte n'est pas chargé. */
export function useCompteHero(pret) {
    useEffect(() => {
        if (!pret || SOBRE()) return;

        const contexte = gsap.context(() => {
            const vise = (s) => {
                const trouves = gsap.utils.toArray(s);
                return trouves.length ? trouves : null;
            };

            const media = vise("[data-compte-media]");
            const kicker = vise("[data-compte-kicker]");
            const lignes = vise("[data-compte-ligne]");
            const filet = vise("[data-compte-filet]");
            const pied = vise("[data-compte-pied]");

            const ouverture = gsap.timeline();

            if (media) {
                ouverture.from(media, {
                    scale: 1.08,
                    duration: 1.9,
                    ease: "expo.out",
                    clearProps: "transform",
                }, 0);
            }

            if (kicker) {
                ouverture.from(kicker, {
                    y: 18,
                    opacity: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                }, 0.15);
            }

            // yPercent et non y : chaque ligne monte de SA propre hauteur,
            // quelle que soit la taille du corps à cette largeur d'écran.
            if (lignes) {
                ouverture.from(lignes, {
                    yPercent: 105,
                    duration: 1.15,
                    stagger: 0.08,
                    ease: "expo.out",
                    clearProps: "transform",
                }, 0.22);
            }

            if (filet) {
                ouverture.from(filet, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1.1,
                    ease: "expo.out",
                    clearProps: "transform",
                }, 0.5);
            }

            if (pied) {
                ouverture.from(pied, {
                    y: 24,
                    opacity: 0,
                    duration: 0.95,
                    stagger: 0.1,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                }, 0.62);
            }
        });

        return () => contexte.revert();
    }, [pret]);
}
