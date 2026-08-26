import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// 1 "unité" de durée dans la timeline = ce nombre de vh de scroll physique.
// Monte pour ralentir TOUTE la séquence, descends pour accélérer.
const VH_PER_UNIT = 45;

export function useCircuitReveal(count) {
    const triggerRef = useRef(null);
    const circuitContainerRef = useRef(null);
    const circuitRefs = useRef([]);
    const etapesContainerRef = useRef(null);
    const [active, setActive] = useState(0);

    const setCircuitRef = useCallback((el, i) => {
        circuitRefs.current[i] = el;
    }, []);

    useGSAP(() => {
        if (!count || !triggerRef.current || !circuitContainerRef.current) return;

        const els = circuitRefs.current.slice(0, count);
        const phraseLines = gsap.utils.toArray("[data-phrase]");
        const finalChars = gsap.utils.toArray("[data-final-char]");
        const panels = gsap.utils.toArray("[data-panel]");
        const revealItems = gsap.utils.toArray("[data-reveal]");
        const regionFrames = gsap.utils.toArray("[data-region-frame]");
        const regionImgs = gsap.utils.toArray("[data-region-img]");
        const regionLabels = gsap.utils.toArray("[data-region-label]");

        const tl = gsap.timeline({ paused: true });

        const circuitContent = (i) => {
            const scope = els[i];
            if (!scope) return {};
            return {
                title: scope.querySelector("[data-circuit-title]"),
                line: scope.querySelector("[data-circuit-line]"),
                metas: scope.querySelectorAll("[data-circuit-meta]"),
            };
        };

        const revealContent = (i, position) => {
            const { title, line, metas } = circuitContent(i);
            tl.to(title, { y: 0, opacity: 1, duration: 1.3, ease: "expo.out" }, position);
            tl.to(line, { scaleX: 1, duration: 1.4, ease: "power4.out" }, position + 0.15);
            tl.to(metas, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", stagger: 0.12 }, position + 0.35);
        };

        // --- États initiaux ---
        els.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, { yPercent: i === 0 ? 0 : 100, zIndex: i, scale: 1, transformOrigin: "center center" });
            const { title, line, metas } = circuitContent(i);
            gsap.set(title, { y: 60, opacity: 0 });
            gsap.set(line, { scaleX: 0 });
            gsap.set(metas, { y: 30, opacity: 0 });
        });
        gsap.set(phraseLines, { opacity: 0, xPercent: (i) => (i % 2 === 0 ? -40 : 40), letterSpacing: "0.4em" });
        gsap.set(finalChars, { opacity: 0, scaleY: 0, transformOrigin: "center center" });
        gsap.set(panels, { yPercent: 0 });
        gsap.set(circuitContainerRef.current, { yPercent: 0 });
        gsap.set(etapesContainerRef.current, { yPercent: 0 });
        gsap.set(revealItems, { opacity: 0, y: 40 });

        // Régions : la 1re image visible, les suivantes masquées par le bas
        gsap.set(regionFrames, {
            clipPath: (i) => (i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)"),
            zIndex: (i) => i,
        });
        gsap.set(regionImgs, { scale: 1, transformOrigin: "center center" });
        gsap.set(regionLabels, {
            opacity: (i) => (i === 0 ? 1 : 0),
            y: (i) => (i === 0 ? 0 : 20),
        });

        // --- La phrase apparaît ---
        tl.to(phraseLines, { opacity: 1, xPercent: 0, letterSpacing: "0em", duration: 1.4, ease: "expo.out", stagger: 0.04 });
        tl.to({}, { duration: 0.9 }); // conservée

        // --- Transition phrase → Découvrez ---
        tl.to(phraseLines, { opacity: 0, xPercent: (i) => (i % 2 === 0 ? 60 : -60), letterSpacing: "0.6em", duration: 1.1, ease: "expo.in", stagger: 0.03 });
        tl.to({}, { duration: 0.45 }); // conservée

        // --- "Découvrez." apparaît ---
        tl.to(finalChars, { opacity: 1, scaleY: 1, duration: 1.1, ease: "expo.out", stagger: 0.05 });
        tl.to({}, { duration: 0.7 }); // conservée

        // --- Transition Découvrez → rideau ---
        tl.to(finalChars, { scaleY: 0, opacity: 0, duration: 0.7, ease: "expo.in", stagger: { amount: 0.3, from: "center" } });
        tl.to({}, { duration: 0.45 }); // conservée

        // --- Le rideau s'ouvre ---
        tl.to(panels, { yPercent: -100, duration: 3.6, ease: "power4.inOut", stagger: 0.4 });

        // --- Contenu du circuit 0 ---
        revealContent(0, tl.duration());
        tl.to({}, { duration: 0.15 });

        // --- Carousel des circuits ---
        tl.addLabel("circuits");
        for (let i = 1; i < count; i++) {
            const enterAt = tl.duration();
            tl.to(els[i], { yPercent: 0, ease: "none", duration: 3.2 });
            tl.to(els[i - 1], { scale: 1.12, ease: "none", duration: 3.2 }, "<");
            revealContent(i, enterAt + 3.2);
            tl.to({}, { duration: 0.15 });
        }
        tl.to({}, { duration: 0.25 });

        // --- Les circuits remontent, révèlent les étapes ---
        tl.to(circuitContainerRef.current, { yPercent: -100, duration: 1.6, ease: "power4.inOut" });
        tl.to(revealItems, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.15 }, "-=0.8");
        tl.to({}, { duration: 0.7 });

        // --- Les étapes remontent, révèlent les régions ---
        tl.addLabel("horizontal");
        tl.to(etapesContainerRef.current, { yPercent: -100, duration: 1.6, ease: "power4.inOut" });
        tl.to({}, { duration: 0.4 });

        // --- Chaque région se substitue à la précédente ---
        for (let i = 1; i < regionFrames.length; i++) {
            const at = tl.duration();

            tl.to(regionFrames[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 2.4, ease: "power3.inOut" }, at);
            if (regionImgs[i - 1]) {
                tl.to(regionImgs[i - 1], { scale: 1.08, ease: "none", duration: 2.4 }, at);
            }
            if (regionLabels[i - 1]) {
                tl.to(regionLabels[i - 1], { opacity: 0, y: -20, duration: 0.7, ease: "power2.in" }, at + 0.3);
            }
            if (regionLabels[i]) {
                tl.to(regionLabels[i], { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, at + 1.1);
            }

            tl.to({}, { duration: 0.5 });
        }

        tl.to({}, { duration: 0.5 });

        triggerRef.current.style.height = `${tl.duration() * VH_PER_UNIT}vh`;

        ScrollTrigger.create({
            trigger: triggerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
            refreshPriority: 2,
            animation: tl,
            onUpdate: () => {
                const t = tl.time();
                const circuitsStart = tl.labels.circuits ?? 0;
                const horizontalStart = tl.labels.horizontal ?? tl.duration();
                if (t <= circuitsStart) { setActive(0); return; }
                if (t >= horizontalStart) { setActive(count - 1); return; }
                const p = (t - circuitsStart) / (horizontalStart - circuitsStart);
                setActive(Math.min(count - 1, Math.round(p * (count - 1))));
            },
        });

    }, { scope: triggerRef, dependencies: [count] });

    return { triggerRef, circuitContainerRef, etapesContainerRef, active, setCircuitRef };
}