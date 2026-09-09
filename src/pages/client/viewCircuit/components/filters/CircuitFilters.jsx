import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { DURATIONS } from "../../../../../constants/client/circuitFilters";

// Bandeau de marque : c'est la seule grande surface colorée du site.
// Une bande sombre neutre ancrait bien la grille mais ne disait rien
// de Haodygasikara.
export default function CircuitFilters({ query, onQuery, duration, onDuration, shown, total, top }) {
    return (
        <div className="sticky z-30 px-16 py-6" style={{ top, backgroundColor: "var(--brand-terre)" }}>
            <div className="flex items-center justify-between gap-12">
                <div className="flex items-baseline gap-4 shrink-0">
                    <h2 className="font-title text-3xl leading-none" style={{ color: "var(--text-inverse)" }}>
                        La sélection
                    </h2>
                    <span className="font-body text-[11px] uppercase tracking-[0.3em]" style={{ color: "rgba(247,245,240,0.75)" }}>
                        {String(shown).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </span>
                </div>

                <label className="flex items-center gap-3 flex-1 max-w-md">
                    <FaMagnifyingGlass className="text-[12px] shrink-0" style={{ color: "rgba(247,245,240,0.6)" }} />
                    <input
                        value={query}
                        onChange={(e) => onQuery(e.target.value)}
                        placeholder="Rechercher un itinéraire, une destination"
                        className="field-input-dark w-full bg-transparent outline-none py-1.5 font-body text-sm"
                        style={{ color: "var(--text-inverse)" }}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQuery("")}
                            className="shrink-0 cursor-pointer transition-opacity hover:opacity-60"
                            style={{ color: "rgba(247,245,240,0.55)" }}
                            aria-label="Effacer la recherche"
                        >
                            <FaXmark className="text-[12px]" />
                        </button>
                    )}
                </label>

                <div className="flex items-center gap-8 shrink-0">
                    {DURATIONS.map((d) => {
                        const active = d.id === duration;
                        return (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => onDuration(d.id)}
                                className="relative font-body text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 cursor-pointer py-1"
                                style={{ color: active ? "var(--text-inverse)" : "rgba(247,245,240,0.62)" }}
                            >
                                {d.label}
                                <span
                                    className="absolute left-0 -bottom-0.5 block h-px transition-all duration-500 ease-out"
                                    style={{ width: active ? "100%" : "0%", backgroundColor: "var(--text-inverse)" }}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
