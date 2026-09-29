import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { recalerQuandLaPageSeStabilise } from "../../../hooks/design/recalageScroll";
import { findAllCircuitClientApi } from "../../../api/client/cricuitApi";
import CircuitCard from "../../../components/client/cardCircuit/CircuitCard";
import { DURATIONS } from "../../../constants/client/circuitFilters";
import { circuitDays, circuitSteps } from "../../../utils/circuit";
import CircuitFilters from "./components/filters/CircuitFilters";
import CircuitHero from "./components/hero/CircuitHero";
import { VISUELS_HERO } from "./components/hero/visuels";
import VoilePage from "../../../components/client/layout/VoilePage";
import { useChargementPage } from "../../../hooks/design/useChargementPage";
import { imageCloudinary } from "../../../utils/image";

const PER_PAGE = 6;
const HEADER_FALLBACK = 84;

// Ce que la page montre en ouvrant : les trois photographies du héros et la
// premiere page de cartes. Le reste arrive au defilement et n'a pas a retenir
// l'ouverture — a la largeur ou on les regarde, pas a celle du depot.

// Cherche dans le nom du circuit et dans les lieux traversés
const matchQuery = (circuit, needle) => {
    if (!needle) return true;
    const haystack = [circuit.nom, ...circuitSteps(circuit).map((s) => s.destination?.nom)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(needle);
};

export default function ViewCircuit() {
    const [circuits, setCircuits] = useState([]);
    const [status, setStatus] = useState("loading");
    const [query, setQuery] = useState("");
    const [duration, setDuration] = useState("all");
    const [page, setPage] = useState(1);
    const [headerHeight, setHeaderHeight] = useState(HEADER_FALLBACK);

    const indexRef = useRef(null);

    // La page ne s'ouvre qu'une fois le catalogue la ET ses visuels charges.
    // « Retombe » et non « abouti » : une erreur doit pouvoir s'afficher.
    const visuels = useMemo(
        () => status === "loading"
            ? null
            : [...VISUELS_HERO.map((v) => v.src),
               ...circuits.slice(0, PER_PAGE).map((c) => imageCloudinary(c.imageUrl, 1280)).filter(Boolean)],
        [status, circuits]);
    const { progression, pret } = useChargementPage({ donneesPretes: status !== "loading", images: visuels });

    const loadCircuits = useCallback(async () => {
        setStatus("loading");
        try {
            const res = await findAllCircuitClientApi();
            setCircuits(res?.data ?? []);
            setStatus("ready");
        } catch (error) {
            console.error("Chargement des circuits impossible", error);
            setStatus("error");
        }
    }, []);

    useEffect(() => { loadCircuits(); }, [loadCircuits]);

    // Le bandeau se colle juste sous le header — on mesure sa hauteur réelle
    useEffect(() => {
        const measure = () => setHeaderHeight(document.querySelector("header")?.offsetHeight ?? HEADER_FALLBACK);
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // Les cartes arrivent après le fetch : les déclencheurs doivent se recaler.
    //
    // Un unique recalage à 120 ms ne suffisait pas. À cet instant le squelette
    // vient de céder la place à la grille et aucune photo n'est arrivée : les
    // cartes se retrouvaient déclenchées à côté de leur position réelle —
    // entrée jouée hors champ, ou carte franchie sans qu'elle se révèle. On
    // recale maintenant à chaque fois que la page change de hauteur, et les
    // filtres comme « charger la suite » repassent par là (cf. recalageScroll).
    useEffect(() => {
        if (status !== "ready") return undefined;
        return recalerQuandLaPageSeStabilise(indexRef.current ?? undefined);
    }, [status, page, query, duration]);

    useEffect(() => { setPage(1); }, [query, duration]);

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const range = DURATIONS.find((d) => d.id === duration) ?? DURATIONS[0];
        return circuits.filter((c) => matchQuery(c, needle) && range.match(circuitDays(c)));
    }, [circuits, query, duration]);

    const visible = filtered.slice(0, page * PER_PAGE);
    const hasMore = visible.length < filtered.length;
    const hasFilters = Boolean(query.trim()) || duration !== "all";

    const scrollToIndex = useCallback(() => {
        indexRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const resetFilters = useCallback(() => { setQuery(""); setDuration("all"); }, []);

    return (
        <section className="w-full" style={{ backgroundColor: "var(--bg)" }}>
            <VoilePage progression={progression} pret={pret} />
            <CircuitHero onBrowse={scrollToIndex} topOffset={headerHeight} />
            
            <div ref={indexRef} data-header-text="var(--text-primary)" className="pb-32" style={{ scrollMarginTop: `${headerHeight}px` }}>
                <CircuitFilters
                    query={query}
                    onQuery={setQuery}
                    duration={duration}
                    onDuration={setDuration}
                    shown={visible.length}
                    total={filtered.length}
                    top={headerHeight}
                />

                <div className="px-5 sm:px-16 pt-12 lg:pt-20">
                    {status === "loading" && <CircuitGridSkeleton />}

                    {status === "error" && (
                        <EmptyState
                            title="La sélection est indisponible"
                            text="Le catalogue ne répond pas pour le moment. Réessayez dans un instant."
                            actionLabel="Réessayer"
                            onAction={loadCircuits}
                        />
                    )}

                    {status === "ready" && !filtered.length && (
                        hasFilters ? (
                            <EmptyState
                                title="Aucun itinéraire ne correspond"
                                text={query.trim()
                                    ? `Rien ne ressort pour « ${query.trim()} ». Élargissez la durée ou tentez un autre nom de lieu.`
                                    : "Aucun circuit sur cette durée. Essayez une autre fourchette."}
                                actionLabel="Afficher tout"
                                onAction={resetFilters}
                            />
                        ) : (
                            <EmptyState
                                title="La sélection se prépare"
                                text="Nos itinéraires signature seront publiés ici très prochainement."
                            />
                        )
                    )}

                    {status === "ready" && filtered.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {visible.map((circuit, index) => (
                                <CircuitCard
                                    key={circuit.id}
                                    circuit={circuit}
                                    index={index}
                                    delay={(index % 2) * 0.12}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Charger la suite — inutile tant que tout tient sur une page ── */}
                {status === "ready" && hasMore && (
                    <div className="px-5 sm:px-16 mt-12 lg:mt-20 flex justify-center">
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            className="px-14 py-5 font-body-strong text-[11px] uppercase tracking-[0.1em] transition-colors duration-300 cursor-pointer"
                            style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                        >
                            Charger la suite — {String(filtered.length - visible.length).padStart(2, "0")} restants
                        </button>
                    </div>
                )}
            </div>

        </section>
    );
}

function CircuitGridSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton-box w-full h-[480px] sm:h-[620px]" />
            ))}
        </div>
    );
}

function EmptyState({ title, text, actionLabel, onAction }) {
    return (
        <div className="py-28 flex flex-col items-center text-center">
            <span className="font-body-strong text-[11px] uppercase tracking-[0.1em] mb-6" style={{ color: "var(--brand-ocre)" }}>
                Sélection
            </span>
            <h3 className="font-title leading-none mb-6" style={{ color: "var(--text-primary)", fontSize: "clamp(2rem, 3.4vw, 3.25rem)" }}>
                {title}
            </h3>
            <p className="font-body text-[15px] leading-[1.8] max-w-md" style={{ color: "var(--text-muted)" }}>
                {text}
            </p>
            {actionLabel && (
                <button
                    onClick={onAction}
                    className="mt-10 px-10 py-4 font-body-strong text-[11px] uppercase tracking-[0.1em] transition-colors duration-300 cursor-pointer"
                    style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
