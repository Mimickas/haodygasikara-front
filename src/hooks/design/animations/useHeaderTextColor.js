import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function useHeaderTextColor(headerRef) {
    const [textColor, setTextColor] = useState("var(--text-inverse)");
    const { pathname } = useLocation();

    // Le header survit aux changements de route : sans re-scan, l'observer
    // resterait accroché aux sections de la page précédente, déjà démontées.
    useEffect(() => {
        if (!headerRef.current) return;

        // Une valeur negative ici produirait « --1px » et ferait echouer la
        // construction de l'observer, donc planter toute l'application.
        const headerHeight = Math.max(0, headerRef.current.offsetHeight);
        const basDeBande = Math.max(0, window.innerHeight - headerHeight - 1);

        const sections = document.querySelectorAll("[data-header-text]");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setTextColor(entry.target.dataset.headerText);
                });
            },
            { rootMargin: `-${headerHeight}px 0px -${basDeBande}px 0px` }
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
    }, [headerRef, pathname]);

    return textColor;
}
