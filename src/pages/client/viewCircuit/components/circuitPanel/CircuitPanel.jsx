import { useEffect, useState } from "react";
import { FaXmark, FaArrowRight } from "react-icons/fa6";
import { Star } from "lucide-react";
import BaseMap from "../../../../../components/ui/map/BaseMap/BaseMap";
import { circuitDays, circuitRoute, circuitSteps } from "../../../../../utils/circuit";

const CONDENSED_AT = 320;

export default function CircuitPanel({ circuit, onClose }) {
    const [condensed, setCondensed] = useState(false);

    // Échap ferme le panneau
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    if (!circuit) return null;

    const steps = circuitSteps(circuit);
    const route = circuitRoute(circuit);
    const jours = circuitDays(circuit);

    return (
        <div className="fixed inset-0 z-[90]">
            <div onClick={onClose} className="panel-backdrop absolute inset-0" style={{ backgroundColor: "rgba(16,14,11,0.6)", backdropFilter: "blur(4px)" }} />

            <div
                className="slide-panel absolute top-0 right-0 h-full"
                style={{ width: "74%", backgroundColor: "var(--bg-secondary)" }}
            >
                {/* ===== BARRE CONDENSÉE — apparait dès qu'on quitte le héro ===== */}
                <div
                    className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-8 px-16 py-5 transition-all duration-500 ease-out"
                    style={{
                        backgroundColor: "var(--bg-dark)",
                        opacity: condensed ? 1 : 0,
                        transform: condensed ? "translateY(0)" : "translateY(-100%)",
                        pointerEvents: condensed ? "auto" : "none",
                    }}
                >
                    <div className="flex items-baseline gap-5 min-w-0">
                        <h3 className="font-title text-2xl leading-none truncate" style={{ color: "var(--text-inverse)" }}>
                            {circuit.nom}
                        </h3>
                        {jours > 0 && (
                            <span className="font-body text-[11px] uppercase tracking-[0.3em] shrink-0" style={{ color: "var(--brand-ocre)" }}>
                                {jours} jours
                            </span>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="shrink-0 w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-60 cursor-pointer"
                        style={{ color: "var(--text-inverse)" }}
                        aria-label="Fermer"
                    >
                        <FaXmark />
                    </button>
                </div>

                <div
                    className="h-full overflow-y-auto scroll-fine"
                    style={{ overscrollBehavior: "contain" }}
                    onScroll={(e) => setCondensed(e.currentTarget.scrollTop > CONDENSED_AT)}
                    onWheel={(e) => e.stopPropagation()}
                >
                    {/* ===== HÉRO ===== */}
                    <div className="relative" style={{ height: "80vh" }}>
                        {circuit.imageUrl ? (
                            <img src={circuit.imageUrl} alt={circuit.nom} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full" style={{ backgroundColor: "var(--bg-dark)" }} />
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(16,14,11,0.88), rgba(16,14,11,0.12) 55%, rgba(16,14,11,0.35))" }} />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center transition-colors duration-300 cursor-pointer"
                            style={{ backgroundColor: "rgba(247,245,240,0.14)", color: "var(--text-inverse)", backdropFilter: "blur(6px)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--text-inverse)"; e.currentTarget.style.color = "var(--bg-dark)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(247,245,240,0.14)"; e.currentTarget.style.color = "var(--text-inverse)"; }}
                            aria-label="Fermer"
                        >
                            <FaXmark />
                        </button>

                        <div className="absolute inset-x-0 bottom-0 px-16 pb-16">
                            {circuit.isTemplate && (
                                <span className="inline-block mb-5 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] font-body-strong" style={{ backgroundColor: "var(--brand-lagune)", color: "var(--text-inverse)" }}>
                                    Modèle
                                </span>
                            )}
                            <p className="font-body-strong text-[11px] uppercase tracking-[0.5em] mb-5" style={{ color: "var(--brand-ocre)" }}>
                                Itinéraire signature
                            </p>
                            <h2 className="font-title leading-[0.88]" style={{ color: "var(--text-inverse)", fontSize: "clamp(3.5rem, 6vw, 6.5rem)" }}>
                                {circuit.nom}
                            </h2>
                            <div className="flex items-center gap-5 mt-8 font-body text-sm uppercase tracking-[0.25em]" style={{ color: "rgba(247,245,240,0.85)" }}>
                                {route && <span>{route.depart} → {route.arrivee}</span>}
                                {route && jours > 0 && <span>·</span>}
                                {jours > 0 && <span>{jours} jours</span>}
                                <span>·</span>
                                <span>{steps.length} étapes</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== CARTE ===== */}
                    <div className="px-16 pt-20">
                        <p className="font-body-strong text-[11px] uppercase tracking-[0.5em] mb-3" style={{ color: "var(--brand-ocre)" }}>
                            Le tracé
                        </p>
                        <h3 className="font-title text-4xl leading-none mb-8" style={{ color: "var(--text-primary)" }}>
                            Votre parcours
                        </h3>
                        <div style={{ height: "60vh" }}>
                            <BaseMap circuit={circuit} />
                        </div>
                    </div>

                    {/* ===== ÉTAPES ===== */}
                    <div className="px-16 pt-24">
                        <p className="font-body-strong text-[11px] uppercase tracking-[0.5em] mb-3" style={{ color: "var(--brand-ocre)" }}>
                            Étape par étape
                        </p>
                        <h3 className="font-title text-4xl leading-none mb-12" style={{ color: "var(--text-primary)" }}>
                            {steps.length} moments
                        </h3>

                        {/* Toutes les vignettes ont le même cadre */}
                        <div className="grid grid-cols-2 gap-8">
                            {steps.map((st, index) => {
                                const img = st.place?.images?.[0]?.url;
                                const stars = Math.round(st.place?.stars ?? 0);

                                return (
                                    <div key={index} className="group">
                                        <div className="relative overflow-hidden" style={{ height: "300px", backgroundColor: "var(--bg-dark)" }}>
                                            {img && (
                                                <img
                                                    src={img}
                                                    alt={st.place?.nom}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                                                />
                                            )}
                                            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(16,14,11,0.9) 0%, rgba(16,14,11,0.15) 52%, rgba(16,14,11,0.5) 100%)" }} />

                                            <span className="absolute top-6 left-6 font-body text-[11px] tracking-[0.4em]" style={{ color: "rgba(247,245,240,0.75)" }}>
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <span className="absolute top-6 right-6 font-body text-[11px] uppercase tracking-[0.3em]" style={{ color: "rgba(247,245,240,0.75)" }}>
                                                {st.durationDays} jour{st.durationDays > 1 ? "s" : ""}
                                            </span>

                                            <div className="absolute inset-x-0 bottom-0 p-8">
                                                <h4 className="font-title text-3xl leading-none mb-4" style={{ color: "var(--text-inverse)" }}>
                                                    {st.place?.nom}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <Star key={i} size={13} fill={i < stars ? "var(--brand-ocre)" : "none"} stroke={i < stars ? "var(--brand-ocre)" : "rgba(247,245,240,0.5)"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ===== À PROPOS ===== */}
                    <div className="px-16 pt-24 pb-40">
                        {circuit.notes && (
                            <div className="max-w-3xl">
                                <p className="font-body-strong text-[11px] uppercase tracking-[0.5em] mb-3" style={{ color: "var(--brand-ocre)" }}>
                                    À propos
                                </p>
                                <h3 className="font-title text-4xl leading-none mb-8" style={{ color: "var(--text-primary)" }}>
                                    L'esprit du voyage
                                </h3>
                                <p className="font-body text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    {circuit.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== CTA PERMANENT ===== */}
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-8 px-16 py-6" style={{ backgroundColor: "var(--bg-dark)" }}>
                    <div className="flex items-baseline gap-5 min-w-0">
                        <span className="font-body text-[11px] uppercase tracking-[0.35em]" style={{ color: "rgba(247,245,240,0.6)" }}>
                            Devis sur mesure sous 48 h
                        </span>
                    </div>

                    <button
                        className="flex items-center gap-4 px-12 py-4 font-body-strong text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 cursor-pointer shrink-0"
                        style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                    >
                        Demander un devis
                        <FaArrowRight className="text-[11px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
