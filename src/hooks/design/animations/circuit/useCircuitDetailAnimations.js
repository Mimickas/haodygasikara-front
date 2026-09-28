import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Les animations de la fiche circuit ────────────────────────────────────
//
// ── La règle qui tient tout le fichier ───────────────────────────────────
// CE HOOK NE CHANGE AUCUN DESSIN. Il n'ajoute pas un élément, n'en déplace
// aucun, ne touche ni une couleur ni une taille. Il ne fait bouger que deux
// propriétés — `opacity` et `transform` — celles que le compositeur traite
// seul, sans refaire la mise en page.
//
// Et il se branche sur les classes QUI EXISTENT DÉJÀ. Aucun `data-` à semer
// dans les composants, donc aucun fichier de section modifié : le jour où on
// veut retirer toute la chorégraphie, on retire cet appel et il ne reste rien.
//
// `clearProps` à la fin de chaque entrée est ce qui garantit la promesse : une
// fois l'animation jouée, GSAP retire ses styles en ligne et l'élément revient
// exactement à ce que la feuille de style dit de lui.
//
// ── Le parti pris ────────────────────────────────────────────────────────
// Rien ne clignote, rien ne rebondit, rien ne tourne. Tout monte de quelques
// dizaines de pixels en se révélant, sur une courbe qui décélère franchement
// (expo/power3). C'est le seul geste, décliné : c'est ce qui fait qu'une page
// paraît chère plutôt qu'animée.
//
// Deux temps :
//   1. L'OUVERTURE du héro, au chargement — le nom, la ligne de méta, le
//      filet qui se tire, la bande qui se pose.
//   2. LA RÉVÉLATION au défilement, section par section, une seule fois.
//
// Plus une parallaxe très courte sur le héro : la photo descend moins vite que
// la page. C'est ce qui donne la profondeur, et ça ne coûte qu'un transform.

/** Les gens qui ont demandé moins de mouvement en reçoivent zéro. */
const SOBRE = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export function useCircuitDetailAnimations(pret) {
    useEffect(() => {
        // Le circuit arrive après un aller-retour réseau : avant lui, la page
        // est vide et il n'y a rien à animer.
        if (!pret || SOBRE()) return;

        // Un cran de retard sur la peinture : sans lui, ScrollTrigger mesure
        // des sections dont les images n'ont pas encore de hauteur, et place
        // ses déclencheurs au mauvais endroit.
        const contexte = gsap.context(() => {
            const vise = (selecteur) => {
                const trouves = gsap.utils.toArray(selecteur);
                return trouves.length ? trouves : null;
            };

            // ── 1. L'ouverture du héro ──────────────────────────────────
            const titre = vise("[data-hero-titre]");
            const meta = vise("[data-hero-meta]");
            const filet = vise("[data-hero-filet]");
            const vignettes = vise("[data-hero-vignette]");
            const media = vise("[data-hero-media]");

            const ouverture = gsap.timeline();

            // La photo entre plus large que son cadre et se pose. Le mouvement
            // se lit sans qu'on voie jamais de bord vide.
            if (media) {
                ouverture.from(media, {
                    scale: 1.08,
                    duration: 1.9,
                    ease: "expo.out",
                    clearProps: "transform",
                }, 0);
            }

            if (titre) {
                ouverture.from(titre, {
                    yPercent: 18,
                    opacity: 0,
                    duration: 1.25,
                    ease: "expo.out",
                    clearProps: "transform,opacity",
                }, 0.15);
            }

            if (meta) {
                ouverture.from(meta, {
                    y: 24,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                }, 0.32);
            }

            // Le filet se tire de la gauche : il ne s'allume pas, il se trace.
            if (filet) {
                ouverture.from(filet, {
                    scaleX: 0,
                    transformOrigin: "left center",
                    duration: 1.1,
                    ease: "expo.out",
                    clearProps: "transform",
                }, 0.38);
            }

            if (vignettes) {
                ouverture.from(vignettes, {
                    y: 26,
                    opacity: 0,
                    duration: 0.85,
                    stagger: 0.07,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                }, 0.55);
            }

            // ── La parallaxe du héro ────────────────────────────────────
            // La photo descend moins vite que la page. Court — 8 % — parce
            // qu'au-delà on voit le bord du cadre arriver.
            const hero = document.querySelector("[data-header-text] .relative");
            if (media && hero) {
                gsap.to(media, {
                    yPercent: 8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: hero,
                        start: "top top",
                        end: "bottom top",
                        scrub: true,
                    },
                });
            }

            // ── 2. La révélation au défilement ──────────────────────────
            // Une seule fois : une section qui rejoue son entrée à chaque
            // passage donne le mal de mer et fait bon marché.
            const monte = (selecteur, options = {}) => {
                const cibles = vise(selecteur);
                if (!cibles) return;
                gsap.from(cibles, {
                    y: options.y ?? 34,
                    opacity: 0,
                    duration: options.duration ?? 1,
                    stagger: options.stagger ?? 0.08,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                    scrollTrigger: {
                        trigger: options.trigger ?? cibles[0],
                        start: options.start ?? "top 88%",
                        once: true,
                    },
                });
            };

            // Chaque section monte D'UN BLOC quand le déclencheur est sa
            // propre en-tête : sinon le titre s'anime, puis le texte se
            // redéclenche trois lignes plus bas, et la page tressaute.
            document.querySelectorAll(".cx-tete").forEach((tete) => {
                gsap.from(tete.children, {
                    y: 34,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.09,
                    ease: "power3.out",
                    clearProps: "transform,opacity",
                    scrollTrigger: { trigger: tete, start: "top 88%", once: true },
                });
            });

            // « Le voyage » — la planche photo, la fiche, les volets
            monte(".cx-voyage__cadre", { y: 44, duration: 1.2, stagger: 0.12 });
            monte(".cx-specs .cx-mention", { y: 28, stagger: 0.06 });
            monte(".cx-compte > div", { y: 26, stagger: 0.07 });
            monte(".cx-depliant", { y: 24, stagger: 0.07 });
            monte(".cx-devis", { y: 24 });
            monte(".cx-themes", { y: 20 });

            // L'itinéraire — son en-tête est une .cx-tete (animée plus haut),
            // puis les haltes une à une
            monte(".cx-leg", { y: 36, stagger: 0.09, start: "top 92%" });

            // Les images arrivent après coup et changent les hauteurs : sans
            // ce recalage, les déclencheurs des sections basses sont posés sur
            // des positions périmées et se jouent trop tôt — ou jamais.
            ScrollTrigger.refresh();
        });

        return () => contexte.revert();
    }, [pret]);
}
