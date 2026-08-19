import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Colore le texte mot par mot au scroll (gris pâle → couleur pleine)
export function useTextColorReveal() {
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const words = el.querySelectorAll("[data-word]");

        const ctx = gsap.context(() => {
            gsap.fromTo(
                words,
                { opacity: 0.15 },
                {
                    opacity: 1,
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: el,
                        start: "top 75%",
                        end: "bottom 60%",
                        scrub: true,          // ← lie l'animation à la position de scroll
                    },
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return containerRef;
}