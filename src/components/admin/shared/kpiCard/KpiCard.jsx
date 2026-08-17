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
            duration: 0.25,
            ease: "power2.out",
        });
    }, { scope: container, dependencies: [loading] }); // ← rejoue quand loading bascule

    return (
        <div ref={container} className="mb-5 flex items-center justify-between gap-4 w-full">
            {cards.map((item, i) => (
                <div
                    key={loading ? i : item.label}
                    className={`p-4 w-full ${loading ? "skeleton-box" : ""}`}
                    style={loading ? { borderRadius: "var(--radius-lg)" } : { boxShadow: "var(--shadow-normal)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--bg-card)" }}
                >
                    {loading ? (
                        <>
                            <div className="skeleton-box h-4 w-2/3"></div>
                            <div className="skeleton-box h-8 w-1/2 my-2"></div>
                            <div className="skeleton-box h-4 w-3/4"></div>
                        </>
                    ) : (
                        <>
                            <p className="text-md font-medium" style={{ color: "var(--text-muted)" }}>
                                {item.label}
                            </p>
                            <p className="text-2xl font-bold my-2" style={{ color: item.accent }}>
                                {item.value}
                            </p>
                            <p className="text-md font-med" style={{ color: "var(--text-muted)" }}>
                                {item.hint}
                            </p>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}