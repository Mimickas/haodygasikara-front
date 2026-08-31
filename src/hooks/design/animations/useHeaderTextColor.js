import { useEffect, useState } from "react";

export function useHeaderTextColor(headerRef) {
    const [textColor, setTextColor] = useState("var(--text-inverse)");

    useEffect(() => {
        if (!headerRef.current) return;

        const headerHeight = headerRef.current.offsetHeight;
        const sections = document.querySelectorAll("[data-header-text]");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setTextColor(entry.target.dataset.headerText);
                });
            },
            { rootMargin: `-${headerHeight}px 0px -${window.innerHeight - headerHeight - 1}px 0px` }
        );
        sections.forEach((s) => observer.observe(s));

        // Override pour les séquences pilotées par GSAP scrub : plusieurs
        // calques y partagent la même position DOM (absolute inset-0),
        // seule la timeline sait lequel est réellement visible à l'écran.
        const handleForcedColor = (e) => setTextColor(e.detail);
        window.addEventListener("header:text-color", handleForcedColor);

        return () => {
            observer.disconnect();
            window.removeEventListener("header:text-color", handleForcedColor);
        };
    }, [headerRef]);

    return textColor;
}