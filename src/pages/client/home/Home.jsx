import { FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import Button from "../../../components/ui/button/Button";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCircuitReveal } from "../../../hooks/design/useCircuitReveal";
import { useHeroIntro } from "../../../hooks/design/animations/home/firstHero";
import { useAssetsLoader } from "../../../hooks/design/useAssetsLoader";

const heroImages = [
    "/img/luxury-sexy-attractive-woman-dressed-black-dress-posing-pier-luxury-resort-hotel-wearing-sunglasses-summer-vacation-tropical-beach.jpg",
    "/img/home/firstHero/female-manager-eyeglasses-with-folder-hand.jpg",
    "/img/home/firstHero/medium-shot-man-living-as-digital-nomad.jpg",
];

const phrase = [
    "Un voyage ne se réserve pas.",
    "Il se compose, geste après geste.",
    "Nous dessinons avec vous",
    "le Madagascar dont vous rêvez.",
];

const etapes = [
    { n: "01", titre: "Épinglez vos étapes", desc: "Sur une carte interactive de Madagascar, vous désignez les lieux qui vous appellent. Chaque point posé dessine peu à peu la ligne de votre voyage." },
    { n: "02", titre: "Ajustez votre style", desc: "Durée, niveau de confort, rythme, nombre de voyageurs. Le circuit épouse votre manière de voyager, pas l'inverse." },
    { n: "03", titre: "Recevez votre devis", desc: "Notre équipe locale orchestre la logistique et vous adresse une proposition sur mesure sous quarante-huit heures." },
];

const regions = [
    { n: "01", nom: "Hautes Terres", desc: "Rizières en terrasses, maisons de brique rouge et brumes matinales.", img: "/img/home/ctaSection/blue-sea-water-summer-silhouette.jpg" },
    { n: "02", nom: "Côte Est", desc: "Forêt primaire, canal des Pangalanes et pluies chaudes.", img: "/img/home/ctaSection/bird-flying-with-trees-background.jpg" },
    { n: "03", nom: "Grand Sud", desc: "Épineux, baobabs et terre ocre jusqu'à l'horizon.", img: "/img/home/ctaSection/luxury-sexy-attractive-woman-dressed-black-dress-posing-pier-luxury-resort-hotel-wearing-sunglasses-summer-vacation-tropical-beach (1).jpg" },
    { n: "04", nom: "Nord & Îles", desc: "Eaux turquoise, tsingy et villages de pêcheurs.", img: "/img/home/ctaSection/tropical-beach-landscape-with-deckchair-parasol-from-nosy-be-madagascar-vintage-light-filter.jpg" },
];

const circuits = [
    { id: "c1", nom: "Majunga vers le nord", depart: "Majunga", arrivee: "Nosy Be", jours: 8,
      desc: "Remontée de la côte ouest | des plages ocre du Boeny | jusqu'aux eaux de Nosy Be.",
      imageUrl: "/img/home/circuit/san-diego-dawn-early-morning-with-palm-tree-silhouette.jpg" },
    { id: "c2", nom: "Route du Sud", depart: "Tananarive", arrivee: "Tuléar", jours: 12,
      desc: "Remontée de la côte ouest | des plages ocre du Boeny | jusqu'aux eaux de Nosy Be.",
      imageUrl: "/img/home/circuit/zen-garden.jpg" },
];

// toutes les images à précharger avant d'afficher la page
const ALL_IMAGES = [
    ...heroImages,
    ...regions.map((r) => r.img),
    ...circuits.map((c) => c.imageUrl),
];

export default function Home() {
    const { progress, ready } = useAssetsLoader(ALL_IMAGES);
    const [current, setCurrent] = useState(0);

    // le voile reste monté le temps de son animation de sortie
    const [voileVisible, setVoileVisible] = useState(true);

    const { triggerRef, circuitContainerRef, etapesContainerRef, active, setCircuitRef } = useCircuitReveal(circuits.length);
    const heroScope = useHeroIntro(ready, () => setVoileVisible(false));
    const prev = () => setCurrent((i) => (i === 0 ? heroImages.length - 1 : i - 1));
    const next = () => setCurrent((i) => (i === heroImages.length - 1 ? 0 : i + 1));

    // recalcule les positions des animations une fois tout chargé
    useEffect(() => {
        if (!ready) return;
        const t = setTimeout(() => ScrollTrigger.refresh(), 100);
        return () => clearTimeout(t);
    }, [ready]);

    // carousel auto du hero — ne démarre qu'une fois prêt
    useEffect(() => {
        if (!ready) return;
        const interval = setInterval(() => {
            setCurrent((i) => (i === heroImages.length - 1 ? 0 : i + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [ready]);

    return (
        <>
            {/* ===== ÉCRAN DE CHARGEMENT ===== */}
            {voileVisible && (
                <div
                    data-loader
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
                    style={{ backgroundColor: "var(--bg)" }}
                >
                    <span data-loader-item className="font-body-strong text-xs uppercase tracking-[0.45em] mb-10" style={{ color: "var(--brand-ocre)" }}>
                        Haodygasikara
                    </span>

                    <div data-loader-item className="w-64 h-[2px] mb-5" style={{ backgroundColor: "var(--border)" }}>
                        <div
                            className="h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%`, backgroundColor: "var(--brand-terre)" }}
                        />
                    </div>

                    <span data-loader-item className="font-title" style={{ color: "var(--text-primary)", fontSize: "clamp(3rem, 6vw, 5rem)" }}>
                        {progress}%
                    </span>
                </div>
            )}

            {/* ===== HERO ===== */}
            <section ref={heroScope} className="h-screen relative" data-header-text="var(--text-inverse)">
                <div className="relative w-full h-full overflow-hidden bg-black">
                    {heroImages.map((src, i) => (
                        <img
                            key={src}
                            data-hero-img={i === 0 ? "" : undefined}
                            src={src}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
                            style={{ opacity: i === current ? 0.75 : 0 }}
                        />
                    ))}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute bottom-20 left-0 right-0 z-10 flex items-end justify-between px-16">
                        <div>
                            <p data-hero-kicker className="font-body text-sm uppercase tracking-widest text-[var(--brand-ocre)]">Créateur de circuit sur mesure</p>
                            <h1 data-hero-title className="text-8xl font-abhaya-bold text-white leading-none">
                                <span className="block overflow-hidden"><span className="line block">Composez votre</span></span>
                                <span className="block overflow-hidden"><span className="line block">Madagascar.</span></span>
                            </h1>
                        </div>
                        <div data-hero-cta className="shrink-0 pb-6">
                            <Button variant="primaryBorder" value="Créer mon circuit" className="py-4 px-12 font-body-strong rounded-none" />
                        </div>
                    </div>

                    <div data-hero-bar className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-16 py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <span className="font-body text-xs uppercase tracking-widest text-[var(--text-inverse-muted)]">Découvrez la suite</span>
                            <FaArrowDown className="text-[var(--text-inverse-muted)] text-xs animate-bounce" />
                        </div>
                        <div className="flex items-center gap-4">
                            <FaArrowLeft onClick={prev} className="text-white text-xs cursor-pointer" />
                            <FaArrowRight onClick={next} className="text-white text-xs cursor-pointer" />
                        </div>
                    </div>
                </div>
            </section>

            <div ref={triggerRef}>
                <section className="sticky top-0 h-screen w-full overflow-hidden bg-black">

                    <div className="absolute inset-0 z-0 overflow-hidden" style={{ backgroundColor: "var(--bg-territoires)" }}>

                        {/* Colonne gauche — texte fixe, le nom change */}
                        <div className="absolute left-0 top-0 bottom-0 z-20 flex flex-col justify-between py-32 pl-16 pr-8" style={{ width: "38vw" }}>
                            <div>
                                <span className="block font-body text-[10px] uppercase tracking-[0.45em] mb-6" style={{ color: "var(--text-muted)" }}>
                                    Territoires
                                </span>
                                <h2 className="font-title leading-[0.9]" style={{ color: "var(--text-primary)", fontSize: "clamp(2.5rem, 4.5vw, 5rem)" }}>
                                    Six mondes,<br />une seule île.
                                </h2>
                            </div>

                            <div className="relative" style={{ height: "9rem" }}>
                                {regions.map((region) => (
                                    <div key={region.n} data-region-label className="absolute inset-0 flex flex-col justify-end">
                                        <span className="block font-body text-[10px] uppercase tracking-[0.4em] mb-4" style={{ color: "var(--brand-ocre)" }}>
                                            {region.n} / {String(regions.length).padStart(2, "0")}
                                        </span>
                                        <h3 className="font-title leading-none mb-3" style={{ color: "var(--text-primary)", fontSize: "clamp(1.8rem, 2.8vw, 3rem)" }}>
                                            {region.nom}
                                        </h3>
                                        <p className="font-body text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-secondary)" }}>
                                            {region.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Colonne droite — les images empilées, plein cadre */}
                        <div className="absolute top-0 bottom-0 right-0 overflow-hidden" style={{ left: "38vw" }}>
                            {regions.map((region) => (
                                <div key={region.n} data-region-frame className="absolute inset-0 overflow-hidden">
                                    <img data-region-img src={region.img} alt={region.nom} className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                    </div>

                    <div
                        className="absolute inset-0 z-0 flex flex-col justify-center px-16 pb-20"
                        style={{ backgroundColor: "var(--bg)" }}
                        ref={etapesContainerRef}
                    >
                        <div className="mb-10" data-reveal>
                            <p className="font-body-strong text-xs uppercase tracking-[0.3em]" style={{ color: "var(--brand-ocre)" }}>Simple &amp; sur mesure</p>
                            <h2 className="mt-3 text-6xl font-title leading-none" style={{ color: "var(--text-primary)" }}>Votre voyage<br />en trois gestes</h2>
                        </div>
                        <div className="flex flex-col">
                            {etapes.map((etape) => (
                                <div key={etape.n} data-reveal className="group grid grid-cols-12 gap-8 items-baseline py-8" style={{ borderTop: "1px solid var(--border)" }}>
                                    <div className="col-span-2"><span className="font-title text-5xl" style={{ color: "var(--border-strong)" }}>{etape.n}</span></div>
                                    <div className="col-span-4"><h3 className="font-title text-3xl leading-tight transition-transform duration-500 ease-out group-hover:translate-x-2" style={{ color: "var(--text-primary)" }}>{etape.titre}</h3></div>
                                    <div className="col-span-6"><p className="font-body text-base leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>{etape.desc}</p></div>
                                </div>
                            ))}
                            <div style={{ borderTop: "1px solid var(--border)" }} />
                        </div>
                    </div>

                    {/* Circuits — z-10 */}
                    <div className="absolute inset-0 z-10 overflow-hidden" ref={circuitContainerRef}>
                        {circuits.map((c, i) => {
                            const depart = c.depart;
                            const arrivee = c.arrivee;
                            const totalJours = c.jours;

                            return (
                                <div key={c.id} ref={(el) => setCircuitRef(el, i)} className="absolute inset-0" data-circuit={i}>
                                    <img src={c.imageUrl} alt={c.nom} className="absolute inset-0 w-full h-full object-cover" />
                                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent 55%)" }} />
                                    <div className="absolute inset-0 flex flex-col justify-end px-16 pb-15">

                                        <h3 data-circuit-title className="font-title text-8xl leading-[0.9]" style={{ color: "#fff" }}>{c.nom}</h3>

                                        <div data-circuit-line style={{ borderTop: "1px solid var(--border-strong)", transformOrigin: "left center" }} className="my-6"></div>

                                        <div className="flex items-start justify-between gap-8">
                                            <div data-circuit-meta className="flex items-center gap-4 font-body text-sm uppercase tracking-[0.15em] text-[var(--text-inverse-secondary)]">
                                                {depart && arrivee && <span>{depart} → {arrivee}</span>}
                                                {depart && arrivee && totalJours > 0 && (
                                                    <span style={{ width: "1px", height: "14px", backgroundColor: "rgba(255,255,255,0.45)" }} />
                                                )}
                                                {totalJours > 0 && <span>{totalJours} jours</span>}
                                            </div>
                                            <div data-circuit-meta className="flex flex-wrap justify-end gap-x-12 gap-y-2 text-right font-body text-sm leading-relaxed text-[var(--text-inverse-secondary)]">
                                                {c.desc.split("|").map((part, j) => (
                                                    <span key={j}>{part.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
                            {circuits.map((_, i) => (
                                <span key={i} className="transition-all duration-500 ease-out" style={{ width: "2px", height: i === active ? "36px" : "16px", backgroundColor: i === active ? "#fff" : "rgba(255,255,255,0.35)" }} />
                            ))}
                        </div>
                    </div>

                    {/* Rideau — z-20 */}
                    <div className="absolute inset-0 z-20 flex">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} data-panel className="flex-1 h-full" style={{ backgroundColor: "var(--bg-secondary)" }} />
                        ))}
                    </div>

                    {/* Texte — z-30 */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center px-16">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <div className="mb-14">
                                    <span data-phrase className="font-body-strong text-xs uppercase tracking-[0.35em] inline-block" style={{ color: "var(--brand-ocre)" }}>
                                        La méthode Haodygasikara
                                    </span>
                                </div>
                                {phrase.map((ligne, i) => (
                                    <div key={i} className="flex justify-center flex-wrap">
                                        {ligne.split(" ").map((mot, j) => (
                                            <span key={j} data-phrase className="font-body text-5xl leading-[1.25] inline-block mr-[0.25em]" style={{ color: "var(--text-primary)" }}>
                                                {mot}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div>
                                    {"Découvrez.".split("").map((char, i) => (
                                        <span key={i} data-final-char className="font-title text-8xl leading-none inline-block">
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
            </div>
        </>
    );
}