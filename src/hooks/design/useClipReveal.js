// useClipReveal.js
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useClipReveal() {
    const revealRef = useRef(null);   // la section qui se dé-masque

    useEffect(() => {
        const el = revealRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { clipPath: "inset(100% 0 0 0)" },   // entièrement masquée par le haut
                {
                    clipPath: "inset(0% 0 0 0)",     // révélée
                    ease: "none",
                    scrollTrigger: {
                        trigger: el,
                        start: "top bottom",
                        end: "top top",
                        scrub: 1.2,
                        invalidateOnRefresh: true,
                        refreshPriority: 2,
                    }
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return revealRef;
}