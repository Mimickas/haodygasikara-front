import { useEffect, useMemo, useState } from "react";
import { FaArrowDown } from "react-icons/fa6";
import { useCircuitHero } from "../../../../../hooks/design/animations/circuit/useCircuitHero";

// Le contraste vient de la masse photographique posée contre le sable :
// toutes les images occupent le même panneau, donc exactement le même cadre.
const FALLBACK_IMAGES = [
    "/img/home/firstHero/baoba.jpg",
    "/img/home/ctaSection/tropical-beach-landscape-with-deckchair-parasol-from-nosy-be-madagascar-vintage-light-filter.jpg",
    "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg",
];

const MAX_IMAGES = 5;
const SLIDE_MS = 6000;
const CURTAIN_PANELS = 6;

const TITLE_LINES = ["Explorer", "Madagascar."];

const INTRO =
    "Ici, vous choisissez où voyager. Ouvrez un circuit pour suivre son tracé sur la carte, parcourir ses étapes une à une, puis demander votre devis.";

export default function CircuitHero({ circuits = [], onBrowse, topOffset = 84 }) {
    const scopeRef = useCircuitHero();
    const [current, setCurrent] = useState(0);

    const images = useMemo(() => {
        const fromCatalogue = circuits.map((c) => c.imageUrl).filter(Boolean);
        return [...fromCatalogue, ...FALLBACK_IMAGES].slice(0, MAX_IMAGES);
    }, [circuits]);

    useEffect(() => {
        if (images.length < 2) return;
        const id = setInterval(() => setCurrent((i) => (i + 1) % images.length), SLIDE_MS);
        return () => clearInterval(id);
    }, [images.length]);

    return (
        <section
            ref={scopeRef}
            data-header-text="var(--text-primary)"
            className="relative h-screen w-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-territoires)" }}
        >
            {/* Le panneau photo demarre sous le header, sinon le logo devient illisible dessus */}
            <div className="relative z-10 h-full flex" style={{ paddingTop: `${topOffset}px` }}>
                {/* ── Colonne texte ──────────────────────────────────────── */}
                <div
                    data-hero-content
                    className="flex flex-col justify-center pl-16 pr-14 pb-16"
                    style={{ width: "46%" }}
                >
                    <span className="block overflow-hidden mb-8">
                        <span
                            data-hero-kicker
                            className="block font-body-strong text-[11px] uppercase tracking-[0.55em]"
                            style={{ color: "var(--brand-terre)" }}
                        >
                            Tous nos circuits
                        </span>
                    </span>

                    <h1
                        className="font-title"
                        style={{ color: "var(--text-primary)", fontSize: "clamp(2.75rem, 5.6vw, 6.5rem)", lineHeight: 0.88 }}
                    >
                        {TITLE_LINES.map((line) => (
                            <span key={line} className="block overflow-hidden">
                                <span data-hero-line className="block pb-[0.06em]">{line}</span>
                            </span>
                        ))}
                    </h1>

                    <p
                        className="mt-9 max-w-md font-body text-[16px] leading-[1.85]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {INTRO.split(" ").map((mot, i) => (
                            <span key={i} data-hero-word className="inline-block">
                                {mot}&nbsp;
                            </span>
                        ))}
                    </p>

                    <button
                        data-hero-cue
                        onClick={onBrowse}
                        className="group mt-12 self-start flex items-center gap-5 px-11 py-5 transition-colors duration-300 cursor-pointer"
                        style={{ backgroundColor: "var(--bg-dark)", color: "var(--text-inverse)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-terre)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-dark)")}
                    >
                        <span className="font-body-strong text-[11px] uppercase tracking-[0.3em]">
                            Voir la sélection
                        </span>
                        <FaArrowDown className="text-[11px] transition-transform duration-500 ease-out group-hover:translate-y-1" />
                    </button>
                </div>

                {/* ── Panneau image, pleine hauteur jusqu'au bord ────────── */}
                <div data-hero-panel className="relative overflow-hidden" style={{ width: "54%" }}>
                    {/* plus haut que le cadre : la dérive ne découvre jamais de vide */}
                    <div data-hero-media className="absolute inset-x-0" style={{ top: "-8%", bottom: "-8%" }}>
                        {images.map((src, i) => (
                            <img
                                key={src + i}
                                src={src}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
                                style={{ opacity: i === current ? 1 : 0, transitionDuration: "2200ms" }}
                            />
                        ))}
                    </div>

                    {images.length > 1 && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
                            {images.map((src, i) => (
                                <span
                                    key={src + i}
                                    className="transition-all duration-700 ease-out"
                                    style={{
                                        width: "2px",
                                        height: i === current ? "34px" : "14px",
                                        backgroundColor: i === current ? "var(--text-inverse)" : "rgba(247,245,240,0.4)",
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Rideau d'ouverture ─────────────────────────────────────── */}
            <div data-curtain-wrap className="absolute inset-0 z-30 flex pointer-events-none">
                {Array.from({ length: CURTAIN_PANELS }).map((_, i) => (
                    <div key={i} data-curtain className="flex-1 h-full" style={{ backgroundColor: "var(--bg-territoires)" }} />
                ))}
            </div>
        </section>
    );
}
