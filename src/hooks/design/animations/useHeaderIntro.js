import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function useHeaderIntro() {
    const scopeRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.from("[data-header-menu]", { y: -30, autoAlpha: 0, duration: 0.9 }, 0.4)
            .from("[data-header-logo]", { y: -30, autoAlpha: 0, duration: 0.9 }, 0.5)
            .from("[data-header-cta]",  { y: -30, autoAlpha: 0, duration: 0.9 }, 0.6);

    }, { scope: scopeRef });

    return scopeRef;
}