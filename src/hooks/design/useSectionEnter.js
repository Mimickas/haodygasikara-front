// useSectionEnter.js
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSectionEnter() {
    const enterRef = useRef(null);

    useEffect(() => {
        const el = enterRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { yPercent: 20, scale: 0.94, opacity: 0.6 },
                {
                    yPercent: 0,
                    scale: 1,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top bottom",
                        end: "top top",
                        scrub: 1.2,
                        invalidateOnRefresh: true,
                        refreshPriority: 2,
                    },
                }
            );
        });

        return () => ctx.revert();
    }, []);

    return enterRef;
}