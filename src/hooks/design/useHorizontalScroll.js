import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHorizontalScroll() {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const ctx = gsap.context(() => {
            const distance = track.scrollWidth - window.innerWidth;

            // Défilement horizontal pendant que la section est figée
            const scrollTween = gsap.to(track, {
                x: -distance,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: () => `+=${distance}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                },
            });

            // Parallax : chaque image glisse à contre-sens dans son cadre
            gsap.utils.toArray("[data-parallax-img]").forEach((img) => {
                gsap.fromTo(
                    img,
                    { xPercent: -12 },
                    {
                        xPercent: 12,
                        ease: "none",
                        scrollTrigger: {
                            trigger: img.parentElement,
                            containerAnimation: scrollTween,
                            start: "left right",
                            end: "right left",
                            scrub: true,
                        },
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return { sectionRef, trackRef };
}