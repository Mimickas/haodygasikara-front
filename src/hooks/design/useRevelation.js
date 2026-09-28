import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mouvementSobre, recalerQuandLaPageSeStabilise } from "./recalageScroll";

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
//
// ── Un déclencheur PAR élément, et non un par lot ─────────────────────────
//
// Le hook posait un seul déclencheur, sur le PREMIER élément du lot, et
// animait tout le lot d'un coup. Sur une page courte ça ne se voit pas ; sur
// une liste — /mes-circuits, /mes-devis — c'est la panne : la première carte
// entre, les suivantes jouent leur entrée hors champ, et le reste du
// défilement ne révèle plus rien. Pire, un lot dont le premier élément n'est
// jamais atteint laisse TOUT le lot à `opacity: 0`, donc invisible pour de bon.
//
// `ScrollTrigger.batch` fait exactement ce qu'on veut : un déclencheur par
// élément, et les éléments qui entrent ENSEMBLE sont animés ensemble, en
// cascade. La cascade redevient ce qu'elle doit être — une conséquence de ce
// qu'on voit, pas une minuterie lancée une fois pour toutes.

/**
 * @param {Array<string|{ cible: string, y?: number, stagger?: number, depart?: string }>} blocs
 * @param {boolean} pret false tant que les données ne sont pas là : sans ça,
 *                       ScrollTrigger pose ses déclencheurs sur une page vide.
 * @param {*} cle        change quand le contenu change (une liste qui gagne ou
 *                       perd des éléments) : les déclencheurs sont alors reposés
 *                       sur le nouveau contenu. Sans elle, une carte ajoutée
 *                       après coup n'est jamais révélée.
 */
export function useRevelation(blocs, pret = true, cle = null) {
    // `useLayoutEffect` et non `useEffect` : masquer les blocs est la PREMIÈRE
    // image de l'animation, elle doit donc être posée avant que le navigateur
    // peigne. En effet différé, le bloc était peint une frame en pleine
    // opacité, puis sautait à l'invisible pour se révéler — un clignotement
    // qu'on lit comme un défaut d'affichage, et c'en est un.
    useLayoutEffect(() => {
        if (!pret || mouvementSobre()) return;

        const contexte = gsap.context(() => {
            blocs.forEach((bloc) => {
                const { cible, y = 32, stagger = 0.08, depart = "top 88%" } =
                    typeof bloc === "string" ? { cible: bloc } : bloc;

                const elements = gsap.utils.toArray(cible);
                if (!elements.length) return;

                gsap.set(elements, { y, opacity: 0 });

                ScrollTrigger.batch(elements, {
                    start: depart,
                    once: true,
                    onEnter: (lot) => gsap.to(lot, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger,
                        ease: "power3.out",
                        // L'élément rend ses styles dès qu'il est arrivé : plus
                        // rien de GSAP ne pèse sur lui, et aucun recalage
                        // ultérieur ne peut le renvoyer à l'invisible.
                        clearProps: "transform,opacity",
                        overwrite: true,
                    }),
                });
            });
        });

        // Les positions ne valent que si la page a fini de bouger (cf. recalageScroll).
        const arreterLeRecalage = recalerQuandLaPageSeStabilise();

        return () => {
            arreterLeRecalage();
            contexte.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pret, cle]);
}
