import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function CircuitIndexRow({ index, nom, img, depart, arrivee, jours }) {
    const rowRef = useRef(null);
    const revealRef = useRef(null);
    const innerRef = useRef(null);
    const imgRef = useRef(null);

    useEffect(() => {
        const row = rowRef.current;
        const reveal = revealRef.current;
        const inner = innerRef.current;
        const image = imgRef.current;
        if (!row) return;

        const position = (e) => {
            reveal.style.top = `${e.clientY}px`;
            reveal.style.left = `${e.clientX}px`;
        };

        const onEnter = (e) => {
            position(e);
            gsap.killTweensOf([inner, image]);
            reveal.style.opacity = 1;
            gsap.fromTo(inner, { xPercent: -100 }, { xPercent: 0, duration: 0.5, ease: "expo.out" });
            gsap.fromTo(image, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "expo.out" });
        };

        const onMove = (e) => requestAnimationFrame(() => position(e));

        const onLeave = () => {
            gsap.killTweensOf([inner, image]);
            gsap.to(inner, { xPercent: 100, duration: 0.4, ease: "expo.out" });
            gsap.to(image, {
                xPercent: -100, duration: 0.4, ease: "expo.out",
                onComplete: () => { reveal.style.opacity = 0; },
            });
        };

        row.addEventListener("mouseenter", onEnter);
        row.addEventListener("mousemove", onMove);
        row.addEventListener("mouseleave", onLeave);
        return () => {
            row.removeEventListener("mouseenter", onEnter);
            row.removeEventListener("mousemove", onMove);
            row.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <div
            ref={rowRef}
            className="group relative grid grid-cols-12 gap-8 items-center py-12 cursor-pointer transition-colors duration-500"
            style={{ borderTop: "1px solid var(--border)" }}
        >

            <div className="col-span-1">
                <span className="font-body text-xs tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <div className="col-span-6">
                <h3
                    className="font-title text-6xl leading-none transition-all duration-700 ease-out group-hover:translate-x-6"
                    style={{ color: "var(--text-primary)" }}
                >
                    {nom}
                </h3>
            </div>

            <div className="col-span-3">
                {depart && arrivee && (
                    <span className="font-body text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {depart} → {arrivee}
                    </span>
                )}
            </div>

            <div className="col-span-2 text-right">
                {jours > 0 && (
                    <span className="font-body text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {jours} jours
                    </span>
                )}
            </div>


            <div
                ref={revealRef}
                className="pointer-events-none fixed top-0 left-0"
                style={{
                    opacity: 0,
                    width: "360px",
                    height: "460px",
                    marginLeft: "1%",
                    marginTop: "1%",
                    zIndex: 30,
                }}
            >
                <div ref={innerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                    <div
                        ref={imgRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}