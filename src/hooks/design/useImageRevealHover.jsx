import { useEffect, useRef } from "react";
import gsap from "gsap";

// Reproduit l'effet Codrops "Image Reveal Hover" (HoverImgFx1)
// Deux couches glissent en sens opposés → effet de volet qui dévoile l'image.
export function useImageRevealHover(img) {
    const linkRef = useRef(null);      // l'élément survolé (le <a>)
    const revealRef = useRef(null);    // .hover-reveal — suit le curseur
    const innerRef = useRef(null);     // .hover-reveal__inner — overflow hidden
    const imgRef = useRef(null);       // .hover-reveal__img — le fond image

    useEffect(() => {
        const link = linkRef.current;
        const reveal = revealRef.current;
        const inner = innerRef.current;
        const image = imgRef.current;
        if (!link) return;

        const GAP = 32;
        const MARGE = 16;

        // L'image se pose à droite du curseur et centrée sur lui — elle bascule
        // à gauche si elle allait sortir de l'écran, et ne déborde jamais en haut
        // ni en bas.
        const positionElement = (e) => {
            const w = reveal.offsetWidth;
            const h = reveal.offsetHeight;

            let left = e.clientX + GAP;
            if (left + w > window.innerWidth - MARGE) left = e.clientX - GAP - w;

            const top = Math.min(
                Math.max(e.clientY - h / 2, MARGE),
                window.innerHeight - h - MARGE
            );

            reveal.style.left = `${left}px`;
            reveal.style.top = `${top}px`;
        };

        const onEnter = (e) => {
            positionElement(e);
            gsap.killTweensOf([inner, image]);
            reveal.style.opacity = 1;

            gsap.fromTo(inner, { xPercent: -100 }, { xPercent: 0, duration: 0.2, ease: "sine.out" });
            gsap.fromTo(image, { xPercent: 100 }, { xPercent: 0, duration: 0.2, ease: "sine.out" });
        };

        const onMove = (e) => requestAnimationFrame(() => positionElement(e));

        const onLeave = () => {
            gsap.killTweensOf([inner, image]);
            gsap.to(inner, { xPercent: 100, duration: 0.2, ease: "sine.out" });
            gsap.to(image, {
                xPercent: -100,
                duration: 0.2,
                ease: "sine.out",
                onComplete: () => { reveal.style.opacity = 0; },
            });
        };

        link.addEventListener("mouseenter", onEnter);
        link.addEventListener("mousemove", onMove);
        link.addEventListener("mouseleave", onLeave);

        return () => {
            link.removeEventListener("mouseenter", onEnter);
            link.removeEventListener("mousemove", onMove);
            link.removeEventListener("mouseleave", onLeave);
        };
    }, [img]);

    return { linkRef, revealRef, innerRef, imgRef };
}