import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Entrée d'une carte : le cadre se dévoile par le bas pendant que l'image
// revient de son zoom, puis le texte monte.
// Chaque carte s'anime elle-même : les cartes ajoutées par « charger la suite »
// n'obligent à recalculer aucun déclencheur.
export function useCardEnter(delay = 0) {
    const scopeRef = useRef(null);

    useGSAP(() => {
        const el = scopeRef.current;
        if (!el) return;

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            delay,
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
                invalidateOnRefresh: true,
            },
        });

        tl.fromTo("[data-card-media]",
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3 }
        )
            .fromTo("[data-card-img]", { scale: 1.35 }, { scale: 1, duration: 1.6 }, 0)
            .from("[data-card-text]", { yPercent: 40, opacity: 0, duration: 1 }, 0.35);
    }, { scope: scopeRef, dependencies: [delay] });

    return scopeRef;
}
