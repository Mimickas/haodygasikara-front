import { FaArrowRight } from "react-icons/fa6";

export default function CircuitCard({ circuit: c, index, drift = 0, tall = false }) {
    const steps = c.steps ?? [];
    const depart = steps[0]?.place?.nom;
    const arrivee = steps[steps.length - 1]?.place?.nom;
    const totalJours = steps.reduce((sum, s) => sum + (s.durationDays ?? 0), 0);

    return (
        <div data-card data-drift={drift} className="group cursor-pointer">
            <div className="relative overflow-hidden">
                {c.imageUrl ? (
                    <img
                        src={c.imageUrl}
                        alt={c.nom}
                        className="w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.04]"
                        style={{ height: tall ? "720px" : "560px", filter: "brightness(0.95)" }}
                    />
                ) : (
                    <div className="w-full flex items-center justify-center" style={{ height: tall ? "720px" : "560px", backgroundColor: "var(--bg-sunken)" }}>
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Pas d'image</span>
                    </div>
                )}

                <div
                    className="absolute inset-0 transition-opacity duration-700 ease-out opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(17,17,17,0.45), transparent 55%)" }}
                />

                {/* Index éditorial en filigrane */}
                <span
                    className="absolute top-8 left-8 font-body text-xs tracking-[0.3em] pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* Cercle Voir */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className="flex items-center justify-center rounded-full transition-all duration-700 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                        style={{ width: "118px", height: "118px", border: "1px solid rgba(255,255,255,0.75)", backdropFilter: "blur(3px)" }}
                    >
                        <span className="font-body text-xs uppercase tracking-[0.25em]" style={{ color: "#fff" }}>Voir</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-end justify-between gap-6">
                    <div className="flex flex-col gap-3">
                        <h3
                            className="font-title text-4xl leading-none transition-transform duration-500 ease-out group-hover:translate-x-1"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {c.nom}
                        </h3>
                        <div className="flex items-center gap-4 font-body text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                            {depart && arrivee && <span>{depart} → {arrivee}</span>}
                            {depart && arrivee && totalJours > 0 && (
                                <span style={{ width: "1px", height: "12px", backgroundColor: "var(--border-strong)" }} />
                            )}
                            {totalJours > 0 && <span>{totalJours} jours</span>}
                        </div>
                    </div>

                    <span className="flex items-center gap-2 shrink-0 pb-1" style={{ color: "var(--text-primary)" }}>
                        <span className="font-body text-xs uppercase tracking-[0.2em]">Découvrir</span>
                        <FaArrowRight className="text-xs transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
                    </span>
                </div>
            </div>
        </div>
    );
}