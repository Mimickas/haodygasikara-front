import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── La révélation au défilement ───────────────────────────────────────────
// Un seul geste, décliné : les blocs montent de quelques dizaines de pixels en
// se révélant, sur une courbe qui décélère franchement. Rien ne clignote, rien
// ne rebondit, rien ne tourne — c'est ce qui fait qu'une page paraît chère
// plutôt qu'animée.
//
// Le hook ne touche AUCUN dessin : il se branche sur des classes existantes,
// ne fait bouger qu'`opacity` et `transform` — les deux propriétés que le
// compositeur traite seul, sans refaire la mise en page — et les retire une
// fois jouées (`clearProps`). Retirer l'appel retire toute la chorégraphie, et
// il ne reste rien.
//
// `once: true` : un bloc qui rejoue son entrée à chaque passage donne le mal
// de mer et fait bon marché.

const SOBRE = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * @param {Array<string|{ cible: string, y?: number, stagger?: number, depart?: string }>} blocs
 * @param {boolean} pret  false tant que les données ne sont pas là : sans ça,
 *                        ScrollTrigger pose ses déclencheurs sur une page vide.
 */
export function useRevelation(blocs, pret = true) {
    useEffect(() => {
        if (!pret || SOBRE()) return;

        const contexte = gsap.context(() => {
            blocs.forEach((bloc) => {
                const { cible, y = 32, stagger = 0.08, depart = "top 88%" } =
                    typeof bloc === "string" ? { cible: bloc } : bloc;

                const elements = gsap.utils.toArray(cible);
                if (!elements.length) return;

                gsap.from(elements, {
                    y,
                    opacity: 0,
                    duration: 1,
                    stagger,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                    scrollTrigger: { trigger: elements[0], start: depart, once: true },
                });
            });

            // Les images arrivent après coup et changent les hauteurs : sans ce
            // recalage, les déclencheurs des blocs bas sont posés sur des
            // positions périmées et se jouent trop tôt — ou jamais.
            ScrollTrigger.refresh();
        });

        return () => contexte.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pret]);
}
