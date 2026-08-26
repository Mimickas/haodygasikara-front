import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useParallaxClose() {
    const innerRef = useRef(null);     // le div INTÉRIEUR qui zoome
    const incomingRef = useRef(null);  // la section circuits (trigger)

    useEffect(() => {
        const inner = innerRef.current;
        const incoming = incomingRef.current;
        if (!inner || !incoming) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                inner,
                { scale: 1, filter: "brightness(1)" },
                {
                    scale: 0.85,
                    filter: "brightness(0.5)",
                    ease: "none",
                    scrollTrigger: {
                        trigger: incoming,
                        start: "top bottom",
                        end: "top top",
                        scrub: 1.2,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return { innerRef, incomingRef };
}