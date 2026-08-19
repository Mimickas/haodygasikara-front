import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/all";

export function useSmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,              // durée de l'inertie (plus grand = plus glissant)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expo out — le feeling "premium"
            smoothWheel: true,
        });
        lenis.on("scroll", ScrollTrigger.update);
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);
}