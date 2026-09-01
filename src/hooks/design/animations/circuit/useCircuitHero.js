import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Ouverture de la page circuits, commune aux deux variantes d'accroche.
// 1. un rideau se lève panneau par panneau
// 2. l'image se pose en zoom arrière, le titre monte ligne par ligne,
//    le texte apparait mot par mot, la flèche suit
// 3. au scroll, image et contenu partent à des vitesses différentes
export function useCircuitHero() {
    const scopeRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.to("[data-curtain]", {
            yPercent: -101,
            duration: 1.15,
            stagger: 0.075,
            ease: "power4.inOut",
        }, 0.15)
            .set("[data-curtain-wrap]", { display: "none" })

            .fromTo("[data-hero-media]",
                { scale: 1.25 },
                { scale: 1, duration: 2.6, ease: "power2.out" },
                0.35
            )

            .from("[data-hero-kicker]", { yPercent: 110, duration: 1 }, 0.95)
            .from("[data-hero-line]", { yPercent: 115, duration: 1.25, stagger: 0.1 }, 1.05)
            .from("[data-hero-word]", { opacity: 0, y: 22, duration: 0.75, stagger: 0.022 }, 1.55)
            .from("[data-hero-cue]", { opacity: 0, y: 20, duration: 0.9 }, 1.95);

        // Variante claire seulement : le panneau image s'ouvre depuis la droite
        const panel = scopeRef.current?.querySelector("[data-hero-panel]");
        if (panel) {
            tl.fromTo(panel,
                { clipPath: "inset(0% 0% 0% 100%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" },
                0.5
            );
        }

        // Parallaxe de sortie : l'image traine, le contenu s'efface
        const drift = {
            trigger: scopeRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
        };

        gsap.to("[data-hero-media]", { yPercent: 16, ease: "none", scrollTrigger: drift });
        gsap.to("[data-hero-content]", { yPercent: -12, opacity: 0, ease: "none", scrollTrigger: { ...drift } });
    }, { scope: scopeRef });

    return scopeRef;
}
