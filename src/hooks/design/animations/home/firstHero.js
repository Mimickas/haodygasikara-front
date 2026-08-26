// hooks/design/useHeroIntro.js
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function useHeroIntro() {
    const scopeRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // 1. L'image se dévoile : léger zoom arrière + montée d'opacité
        tl.fromTo("[data-hero-img]",
            { scale: 1.15, opacity: 0 },
            { scale: 1, opacity: 0.75, duration: 1.8 }
        );

        // 2. Le kicker (petit texte ocre) apparaît
        tl.from("[data-hero-kicker]",
            { y: 30, opacity: 0, duration: 0.9 },
            "-=1.0"
        );

        // 3. Le grand titre monte, ligne par ligne
        tl.from("[data-hero-title] .line",
            { yPercent: 120, opacity: 0, duration: 1.2, stagger: 0.12 },
            "-=0.6"
        );

        // 4. Le bouton + la barre du bas apparaissent ensemble
        tl.from("[data-hero-cta]", { y: 20, opacity: 0, duration: 0.8 }, "-=0.7");
        tl.from("[data-hero-bar]", { opacity: 0, duration: 0.9 }, "-=0.6");

    }, { scope: scopeRef });

    return scopeRef;
}