import { FaArrowRight } from "react-icons/fa6";
import { useCardEnter } from "../../../hooks/design/useCardEnter";
import { circuitDays, circuitRoute, circuitSteps } from "../../../utils/circuit";

// Toutes les cartes ont exactement le même cadre.
const CARD_HEIGHT = "620px";

export default function CircuitCard({ circuit: c, index, delay = 0, onClick }) {
    const cardRef = useCardEnter(delay);

    const steps = circuitSteps(c);
    const route = circuitRoute(c);
    const jours = circuitDays(c);

    return (
        <article ref={cardRef} data-card onClick={onClick} className="group cursor-pointer">
            <div
                data-card-media
                className="relative overflow-hidden"
                style={{ height: CARD_HEIGHT, backgroundColor: "var(--bg-dark)" }}
            >
                {c.imageUrl ? (
                    <img
                        data-card-img
                        src={c.imageUrl}
                        alt={c.nom}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                    />
                ) : (
                    <div data-card-img className="absolute inset-0 flex items-center justify-center">
                        <span className="font-body text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(247,245,240,0.4)" }}>
                            Visuel à venir
                        </span>
                    </div>
                )}

                {/* Le texte vit sur l'image : c'est là que se joue le contraste */}
                <div
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ background: "linear-gradient(to top, rgba(16,14,11,0.92) 0%, rgba(16,14,11,0.22) 46%, rgba(16,14,11,0.55) 100%)" }}
                />

                <span
                    className="absolute top-8 left-8 font-body text-[11px] tracking-[0.4em]"
                    style={{ color: "rgba(247,245,240,0.75)" }}
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                {jours > 0 && (
                    <span
                        className="absolute top-8 right-8 font-body text-[11px] uppercase tracking-[0.3em]"
                        style={{ color: "rgba(247,245,240,0.75)" }}
                    >
                        {jours} jours
                    </span>
                )}

                {/* Cercle d'appel au survol */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                        className="flex items-center justify-center rounded-full opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-out font-body text-[10px] uppercase tracking-[0.25em]"
                        style={{ width: "124px", height: "124px", backgroundColor: "rgba(247,245,240,0.14)", color: "var(--text-inverse)", backdropFilter: "blur(6px)" }}
                    >
                        Explorer
                    </span>
                </div>

                <div data-card-text className="absolute inset-x-0 bottom-0 p-10">
                    <h3
                        className="font-title leading-[0.95] transition-transform duration-700 ease-out group-hover:-translate-y-1"
                        style={{ color: "var(--text-inverse)", fontSize: "clamp(2rem, 2.7vw, 3.25rem)" }}
                    >
                        {c.nom}
                    </h3>

                    <div className="mt-5 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 font-body text-[11px] uppercase tracking-[0.22em] min-w-0" style={{ color: "rgba(247,245,240,0.7)" }}>
                            {route && <span className="truncate">{route.depart} → {route.arrivee}</span>}
                            {route && steps.length > 0 && <span>·</span>}
                            {steps.length > 0 && <span className="shrink-0">{steps.length} étapes</span>}
                        </div>

                        <span
                            className="flex items-center gap-2 shrink-0 font-body-strong text-[10px] uppercase tracking-[0.25em] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out"
                            style={{ color: "var(--brand-ocre)" }}
                        >
                            Découvrir
                            <FaArrowRight className="text-[10px]" />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
