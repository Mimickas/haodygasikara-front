import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
        });

        lenis.on("scroll", ScrollTrigger.update);

        const update = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.off("scroll", ScrollTrigger.update);
            gsap.ticker.remove(update);
            lenis.destroy();
        };
    }, []);
}