import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Révèle les enfants marqués [data-reveal] en fondu + montée douce au scroll
export function useScrollReveal() {
    const scopeRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const items = gsap.utils.toArray("[data-reveal]");
            items.forEach((el) => {
                gsap.fromTo(
                    el,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%",
                            toggleActions: "play none none none",
                        },
                    }
                );
            });
        }, scopeRef);

        return () => ctx.revert();
    }, []);

    return scopeRef;
}