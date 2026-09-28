import gsap from "gsap";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";

export default function KpiCard({ items = [], loading = false }) {
    const cards = loading ? Array.from({ length: 4 }) : items;
    const container = useRef(null);

    useGSAP(() => {
        if (loading) return;              // ← n'anime pas le skeleton
        gsap.from(container.current.children, {
            opacity: 0,
            y: 6,
            duration: 0.35,
            ease: "power2.out",
            stagger: 0.06,
        });
    }, { scope: container, dependencies: [loading] }); // ← rejoue quand loading bascule

    return (
        // ← un seul bandeau découpé par des filets d'un pixel (gap-px sur fond de bordure),
        //   plutôt que quatre cartes arrondies posées sur une ombre
        <div
            ref={container}
            className="mb-8 grid grid-cols-2 xl:grid-cols-4 gap-px w-full"
            style={{ backgroundColor: "var(--border)", border: "1px solid var(--border)" }}
        >
            {cards.map((item, i) => (
                <div
                    key={loading ? i : item.label}
                    className="relative px-6 py-6"
                    style={{ backgroundColor: "var(--bg-card)" }}
                >
                    {loading ? (
                        <>
                            <div className="skeleton-box h-3 w-1/2" style={{ borderRadius: 0 }}></div>
                            <div className="skeleton-box h-9 w-2/3 mt-4 mb-3" style={{ borderRadius: 0 }}></div>
                            <div className="skeleton-box h-3 w-3/4" style={{ borderRadius: 0 }}></div>
                        </>
                    ) : (
                        <>
                            {/* ← la couleur de la page tient dans un filet de 2px, le chiffre reste à l'encre */}
                            <span
                                aria-hidden="true"
                                className="absolute left-0 top-6 h-3"
                                style={{ width: "2px", backgroundColor: item.accent }}
                            />
                            <p
                                className="font-body-strong text-[11px] uppercase leading-none"
                                style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
                            >
                                {item.label}
                            </p>
                            <p
                                className="font-body-strong text-4xl leading-none mt-4 mb-3"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {item.value}
                            </p>
                            <p className="font-body text-[13px] leading-snug" style={{ color: "var(--text-muted)" }}>
                                {item.hint}
                            </p>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
