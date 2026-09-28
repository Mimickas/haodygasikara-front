// hooks/design/animations/home/firstHero.js
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Ouverture de la page d'accueil.
// La timeline ne part QUE lorsque les visuels sont prêts : lancée au montage,
// elle se jouait derrière l'écran de chargement et personne ne la voyait.
//
// 1. le compteur et sa barre s'effacent vers le haut
// 2. le voile de chargement remonte d'un bloc et découvre le héro
// 3. l'image se pose depuis un fort zoom, en glissant plus lentement que
//    le voile — c'est ce décalage qui donne la profondeur
// 4. sur-titre, titre ligne par ligne, bouton, puis la barre du bas qui
//    se dessine de gauche à droite
export function useHeroIntro(pret, onVoileParti) {
    const scopeRef = useRef(null);

    useGSAP(() => {
        if (!pret) return;

        const voile = document.querySelector("[data-loader]");
        const contenuVoile = voile ? voile.querySelectorAll("[data-loader-item]") : [];

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        if (voile) {
            tl.to(contenuVoile, {
                y: -26,
                opacity: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: "power2.in",
            }, 0)
                .to(voile, {
                    yPercent: -100,
                    duration: 1.25,
                    ease: "power4.inOut",
                    onComplete: onVoileParti,
                }, 0.35);
        }

        // L'image démarre pendant que le voile remonte : elle est découverte
        // en mouvement, jamais figée.
        tl.fromTo("[data-hero-img]",
            { scale: 1.32, yPercent: 6 },
            { scale: 1, yPercent: 0, duration: 2.8, ease: "power2.out" },
            0.35
        );

        tl.fromTo("[data-hero-kicker]",
            { yPercent: 120, opacity: 0, letterSpacing: "0.6em" },
            { yPercent: 0, opacity: 1, letterSpacing: "0.1em", duration: 1.2 },
            1.15
        );

        tl.from("[data-hero-title] .line",
            { yPercent: 118, duration: 1.35, stagger: 0.13 },
            1.3
        );

        tl.from("[data-hero-cta]",
            { y: 26, opacity: 0, duration: 0.9 },
            1.9
        );

        // Le filet et son contenu se révèlent de gauche à droite
        tl.fromTo("[data-hero-bar]",
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.inOut" },
            2.0
        );
    }, { scope: scopeRef, dependencies: [pret] });

    return scopeRef;
}
