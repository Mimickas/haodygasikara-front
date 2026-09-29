import { useEffect, useState } from "react";
import { FaArrowDown } from "react-icons/fa6";
import { useCircuitHero } from "../../../../../hooks/design/animations/circuit/useCircuitHero";
import { VISUELS_HERO } from "./visuels";

// Le contraste vient de la masse photographique posée contre le sable :
// toutes les images occupent le même panneau, donc exactement le même cadre.
//
// Les visuels vivent à côté (./visuels) : la PAGE les précharge avant de lever
// son voile, ce héros les affiche — une seule liste pour les deux.
const VISUELS = VISUELS_HERO;

// Le panneau occupe 54 % de la largeur à partir de 1024 px, tout l'écran en
// dessous : sans cette indication le navigateur suppose 100vw et prend
// systématiquement la version 2880.
const CADRE = "(min-width: 1024px) 54vw, 100vw";

const SLIDE_MS = 6000;
const CURTAIN_PANELS = 6;

const TITLE_LINES = ["Explorer", "Madagascar."];

const INTRO =
    "Ici, vous choisissez où voyager. Ouvrez un circuit pour suivre son tracé sur la carte, parcourir ses étapes une à une, puis demander votre devis.";

export default function CircuitHero({ onBrowse, topOffset = 84 }) {
    const scopeRef = useCircuitHero();
    const [current, setCurrent] = useState(0);

    // Le carrousel compte sur CE QU'IL AFFICHE, et rien d'autre.
    //
    // Il tournait sur une liste calculée à part — les photos du catalogue,
    // puis les visuels de secours —, alors que le panneau n'a jamais rendu que
    // les visuels de secours. Les deux comptes coïncidaient par accident
    // (trois et trois) : un quatrième visuel, ou un plafond retouché, et
    // l'index partait sur une image inexistante, donc sur un panneau vide. La
    // liste était de surcroît recalculée à chaque arrivée du catalogue, pour
    // rien. (Si l'on veut un jour les photos des circuits dans le héros, c'est
    // le rendu qu'il faut changer — pas cette minuterie.)
    useEffect(() => {
        if (VISUELS.length < 2) return undefined;
        const id = setInterval(
            () => setCurrent((i) => (i + 1) % VISUELS.length),
            SLIDE_MS,
        );
        return () => clearInterval(id);
    }, []);

    return (
        <section
            ref={scopeRef}
            data-header-text="var(--text-primary)"
            className="relative h-screen w-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-territoires)" }}
        >
            {/* Le panneau photo demarre sous le header, sinon le logo devient illisible dessus */}
            <div className="relative z-10 h-full flex flex-col lg:flex-row" style={{ paddingTop: `${topOffset}px` }}>
                {/* ── Colonne texte ──────────────────────────────────────── */}
                <div
                    data-hero-content
                    className="flex flex-col justify-center w-full lg:w-[46%] px-5 sm:px-16 lg:pl-16 lg:pr-14 pt-8 pb-8 lg:pt-0 lg:pb-16"
                >
                    <span className="block overflow-hidden mb-8">
                        <span
                            data-hero-kicker
                            className="block font-body-strong text-[11px] uppercase tracking-[0.1em]"
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
                        className="mt-6 lg:mt-9 max-w-md font-body text-[15px] lg:text-[16px] leading-[1.8] lg:leading-[1.85]"
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
                        className="group mt-8 lg:mt-12 self-start flex items-center gap-5 px-8 lg:px-11 py-4 lg:py-5 transition-colors duration-300 cursor-pointer"
                        style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                    >
                        <span className="font-body-strong text-[11px] uppercase tracking-[0.1em]">
                            Voir la sélection
                        </span>
                        <FaArrowDown className="text-[11px] transition-transform duration-500 ease-out group-hover:translate-y-1" />
                    </button>
                </div>

                {/* ── Panneau image, pleine hauteur jusqu'au bord ────────── */}
                <div data-hero-panel className="relative overflow-hidden flex-1 min-h-[28%] lg:flex-none lg:w-[54%]">
                    {/* plus haut que le cadre : la dérive ne découvre jamais de vide */}
                    <div data-hero-media className="absolute inset-x-0" style={{ top: "-8%", bottom: "-8%" }}>
                        {VISUELS.map((visuel, i) => (
                            <img
                                key={i}
                                src={visuel.src}
                                srcSet={visuel.srcSet}
                                sizes={CADRE}
                                alt=""
                                decoding="async"
                                fetchPriority={i === 0 ? "high" : "low"}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out"
                                style={{ opacity: i === current ? 1 : 0, transitionDuration: "2200ms" }}
                            />
                        ))}
                    </div>

                    {VISUELS.length > 1 && (
                        <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
                            {VISUELS.map((_, i) => (
                                <span
                                    key={i}
                                    className="transition-all duration-700 ease-out"
                                    style={{
                                        width: "2px",
                                        height: i === current ? "34px" : "14px",
                                        backgroundColor: i === current ? "var(--text-inverse)" : "rgba(245,240,230,0.4)",
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
