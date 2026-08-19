import { FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import Button from "../../../components/ui/button/Button";
import { useEffect, useState } from "react";
import { findAllTagsGroupsApiClient } from "../../../api/client/tagGroupApi";
import { findAllCircuitClientApi } from "../../../api/client/cricuitApi";
import { useScrollReveal } from "../../../hooks/design/useScrollReveal";
import { useTextColorReveal } from "../../../hooks/design/useTextColorReveal";
import { useHorizontalScroll } from "../../../hooks/design/useHorizontalScroll";

const heroImages = [
    "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg",
    "/img/lemur.webp",

];

export default function Home() {
    const [current, setCurrent] = useState(0);
    const revealScope = useScrollReveal();
    const colorRevealScope = useTextColorReveal();

    const { sectionRef: horizontalSection, trackRef: horizontalTrack } = useHorizontalScroll();
    const prev = () => setCurrent((i) => (i === 0 ? heroImages.length - 1 : i - 1));
    const next = () => setCurrent((i) => (i === heroImages.length - 1 ? 0 : i + 1));
    const[tags, setTags] = useState([]);
    const[circuits, setCircuits] = useState([]);
    const loadTags = async () =>{
        try {
            const res = await findAllTagsGroupsApiClient();
            setTags(res?.data);
        } catch (error) {
            alert(error);
        }
    }
    const loadCircuits = async () =>{
        try {
            const res = await findAllCircuitClientApi();
            setCircuits(res?.data);
            console.log(res);
        } catch (error) {
            alert(error);
        }
    }

    useEffect(() =>{
        loadTags();
        loadCircuits();
    },[])

    return (
        <>
            <section className="h-screen relative">
                <div className="relative w-full h-full overflow-hidden bg-black">

                    <img
                        key={current}
                        src={heroImages[current]}
                        className="absolute inset-0 w-full h-full object-cover opacity-75 transition-opacity duration-700"
                        alt="hero"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <div className="absolute bottom-20 left-0 right-0 z-10 flex items-end justify-between px-16">
                            <div>
                                <p className="font-body text-sm uppercase tracking-widest text-[var(--brand-ocre)]">
                                    Créateur de circuit sur mesure
                                </p>
                                <h1 className="text-8xl font-abhaya-bold text-white leading-none">
                                    Composez votre <br /> Madagascar.
                                </h1>
                            </div>
                            <div className="shrink-0 pb-6 ">
                                <Button
                                    variant="primaryBorder"
                                    value="Créer mon circuit"
                                    className="py-4 px-12 font-body-strong rounded-none"
                                />
                            </div>
                        </div>

                    <div
                        className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-16 py-6"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
                    >
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <span className="font-body text-xs uppercase tracking-widest text-[var(--text-inverse-muted)]">
                                Découvrez la suite
                            </span>
                            <FaArrowDown className="text-[var(--text-inverse-muted)] text-xs animate-bounce" />
                        </div>

                        <div className="flex items-center gap-4">
                            <FaArrowLeft onClick={prev} className="text-white text-xs" />
                            <FaArrowRight onClick={next} className="text-white text-xs" />
                        </div>
                    </div>

                </div>
            </section>

            <section
                className="py-56 px-16"
                style={{ backgroundColor: "var(--bg-secondary)" }}
            >
                <div ref={colorRevealScope} className="max-w-5xl mx-auto">
                    <p className="font-body-strong text-xs uppercase tracking-[0.3em] mb-12 text-center" style={{ color: "var(--brand-ocre)" }}>
                        La méthode Haodygasikara
                    </p>

                    <p className="font-reg text-5xl leading-snug text-center" style={{ color: "var(--text-primary)" }}>
                        {(
                            "Un voyage ne se réserve pas. Il se compose, geste après geste. Nous dessinons avec vous le Madagascar dont vous rêvez."
                        )
                            .split(" ")
                            .map((mot, i) => (
                                <span key={i} data-word className="inline-block mr-[0.25em]">
                                    {mot}
                                </span>
                            ))}
                    </p>
                </div>
            </section>

            <section className="my-40 px-16">
                <div className="flex items-center justify-between ">

                </div>
                
                <div className="border-b-[0.5px] border-[var(--border)] uppercase flex justify-between items-end mt-10 mb-5">

                    <div>
                        <h2 className="text-7xl font-reg">
                            Nos circuits signatures
                        </h2>
                    </div>
                    <div className="mb-4">
                        <button className="flex items-center text-[var(--text-secondary)] rounded-full gap-4 uppercase">
                            <span className="font-body text-sm">Voir plus</span>
                            <div className=" rounded-full  flex items-center justify-center">
                                <FaArrowRight className="text-[var(--text-secondary)] text-sm" />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-5 my-8">
                    <div className="flex justify-between">
                        {tags.map((t) => (
                            <div key={t.id} className="font-body-strong text-sm">
                                <span className="text-sm">{t?.name || t?.nom}</span>
                            </div>
                        ))}

                    </div>
                    {circuits.map((c) => {
                        const steps = c.steps ?? [];
                        const depart = steps[0]?.place?.nom;
                        const arrivee = steps[steps.length - 1]?.place?.nom;
                        const totalJours = steps.reduce((sum, s) => sum + (s.durationDays ?? 0), 0);

                        return (
                            <div key={c.id} className="group relative flex flex-col cursor-pointer">

                                <div className="relative overflow-hidden">
                                    {c.imageUrl ? (
                                        <img
                                            src={c.imageUrl}
                                            alt={c.nom}
                                            className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            style={{ height: "600px" }}
                                        />
                                    ) : (
                                        <div className="w-full flex items-center justify-center" style={{ height: "600px", backgroundColor: "var(--bg-sunken)" }}>
                                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>Pas d'image</span>
                                        </div>
                                    )}

                                    <div
                                        className="absolute inset-0 transition-opacity duration-700 ease-out opacity-0 group-hover:opacity-100"
                                        style={{ background: "linear-gradient(to top, rgba(17,17,17,0.35), transparent 60%)" }}
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div
                                            className="flex items-center justify-center rounded-full transition-all duration-500 ease-out opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
                                            style={{
                                                width: "110px",
                                                height: "110px",
                                                border: "1px solid rgba(255,255,255,0.7)",
                                                backdropFilter: "blur(2px)",
                                            }}
                                        >
                                            <span className="font-body-strong text-sm uppercase tracking-widest" style={{ color: "#fff" }}>
                                                Voir
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-t-[1.5px] border-[var(--border)] mt-8 mb-6" />

                                <div className="flex items-end justify-between gap-4">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-3xl leading-none" style={{ fontFamily: "var(--font-title)", color: "var(--text-primary)" }}>
                                            {c.nom}
                                        </h3>
                                        <div className="flex items-center gap-3 font-body text-sm" style={{ color: "var(--text-muted)" }}>
                                            {depart && arrivee && <span>{depart} → {arrivee}</span>}
                                            {depart && arrivee && totalJours > 0 && (
                                                <span style={{ width: "1px", height: "14px", backgroundColor: "var(--border-strong)" }} />
                                            )}
                                            {totalJours > 0 && <span>{totalJours} jours</span>}
                                        </div>
                                    </div>

                                    <button className="flex items-center gap-2 shrink-0 pb-1" style={{ color: "var(--text-primary)" }}>
                                        <span className="font-body-strong text-sm">Découvrir</span>
                                        <FaArrowRight className="text-sm transition-transform duration-300 ease-out group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section ref={revealScope} className="my-56 px-16">

                {/* En-tête de section */}
                <div className="mb-20" data-reveal>
                    <p className="font-body-strong text-xs uppercase tracking-[0.3em]" style={{ color: "var(--brand-ocre)" }}>
                        Simple & sur mesure
                    </p>
                    <h2 className="mt-4 text-7xl font-title leading-none" style={{ color: "var(--text-primary)" }}>
                        Votre voyage
                        <br />
                        en trois gestes
                    </h2>
                </div>

                {/* Étapes — pas de boîtes, juste des filets */}
                <div className="flex flex-col">
                    {[
                        { n: "01", titre: "Épinglez vos étapes", desc: "Sur une carte interactive de Madagascar, vous désignez les lieux qui vous appellent. Chaque point posé dessine peu à peu la ligne de votre voyage." },
                        { n: "02", titre: "Ajustez votre style", desc: "Durée, niveau de confort, rythme, nombre de voyageurs. Le circuit épouse votre manière de voyager, pas l'inverse." },
                        { n: "03", titre: "Recevez votre devis", desc: "Notre équipe locale orchestre la logistique et vous adresse une proposition sur mesure sous quarante-huit heures." },
                    ].map((etape, i) => (
                        <div
                            key={etape.n}
                            data-reveal
                            className="group grid grid-cols-12 gap-8 items-baseline py-14"
                            style={{ borderTop: "1px solid var(--border)" }}
                        >
                            {/* Numéro */}
                            <div className="col-span-2">
                                <span
                                    className="font-title text-6xl transition-colors duration-500"
                                    style={{ color: "var(--border-strong)" }}
                                >
                                    {etape.n}
                                </span>
                            </div>

                            {/* Titre */}
                            <div className="col-span-4">
                                <h3
                                    className="font-title text-4xl leading-tight transition-transform duration-500 ease-out group-hover:translate-x-2"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {etape.titre}
                                </h3>
                            </div>

                            {/* Description */}
                            <div className="col-span-6">
                                <p className="font-body text-base leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
                                    {etape.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                    {/* Filet de clôture */}
                    <div style={{ borderTop: "1px solid var(--border)" }} />
                </div>
            </section>

            <section ref={horizontalSection} className="relative overflow-hidden" style={{ backgroundColor: "var(--bg-dark)" }}>
                <div ref={horizontalTrack} className="flex h-screen items-center will-change-transform">

                    {/* Panneau d'intro */}
                    <div className="shrink-0 h-screen flex flex-col justify-center px-24" style={{ width: "60vw" }}>
                        <p className="font-body-strong text-xs uppercase tracking-[0.3em] mb-8" style={{ color: "var(--brand-ocre)" }}>
                            Six territoires, une île
                        </p>
                        <h2 className="font-title text-8xl leading-[0.95]" style={{ color: "var(--text-inverse)" }}>
                            Madagascar
                            <br />
                            n'est pas
                            <br />
                            un pays.
                        </h2>
                        <p className="mt-10 font-body text-base leading-relaxed max-w-md" style={{ color: "var(--text-inverse-muted)" }}>
                            C'est un continent miniature. Chaque région y possède sa lumière, son climat, ses gestes. Faites glisser pour les parcourir.
                        </p>
                    </div>

                    {/* Régions */}
                    {[
                        { n: "01", nom: "Hautes Terres", desc: "Rizières en terrasses, maisons de brique rouge et brumes matinales.", img: "/img/lemur.webp" },
                        { n: "02", nom: "Côte Est", desc: "Forêt primaire, canal des Pangalanes et pluies chaudes.", img: "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg" },
                        { n: "03", nom: "Grand Sud", desc: "Épineux, baobabs et terre ocre jusqu'à l'horizon.", img: "/img/lemur.webp" },
                        { n: "04", nom: "Nord & Îles", desc: "Eaux turquoise, tsingy et villages de pêcheurs.", img: "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg" },
                    ].map((region) => (
                        <div key={region.n} className="shrink-0 h-screen flex items-center px-8" style={{ width: "42vw" }}>
                            <div className="w-full group cursor-pointer">

                                {/* Cadre image avec parallax interne */}
                                <div className="relative overflow-hidden" style={{ height: "62vh" }}>
                                    <img
                                        data-parallax-img
                                        src={region.img}
                                        alt={region.nom}
                                        className="absolute inset-0 w-[125%] h-full object-cover transition-[filter] duration-700 ease-out"
                                        style={{ filter: "grayscale(0.35) brightness(0.85)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0) brightness(1)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(0.35) brightness(0.85)")}
                                    />
                                    {/* Numéro en filigrane */}
                                    <span
                                        className="absolute top-6 left-6 font-title text-7xl leading-none pointer-events-none"
                                        style={{ color: "rgba(255,255,255,0.28)" }}
                                    >
                                        {region.n}
                                    </span>
                                </div>

                                <div className="mt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}>
                                    <h3
                                        className="font-title text-5xl mt-6 transition-transform duration-500 ease-out group-hover:translate-x-2"
                                        style={{ color: "var(--text-inverse)" }}
                                    >
                                        {region.nom}
                                    </h3>
                                    <p className="mt-3 font-body text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-inverse-muted)" }}>
                                        {region.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Panneau de clôture */}
                    <div className="shrink-0 h-screen flex flex-col justify-center px-24" style={{ width: "45vw" }}>
                        <h3 className="font-title text-6xl leading-tight" style={{ color: "var(--text-inverse)" }}>
                            Et la vôtre,
                            <br />
                            laquelle sera-t-elle&nbsp;?
                        </h3>
                        <button
                            className="mt-10 w-fit px-10 py-4 font-body-strong text-sm uppercase tracking-widest transition-all duration-300"
                            style={{ border: "1px solid rgba(255,255,255,0.4)", color: "var(--text-inverse)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--text-inverse)"; e.currentTarget.style.color = "var(--bg-dark)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-inverse)"; }}
                        >
                            Composer mon circuit
                        </button>
                    </div>
                </div>
            </section>


            <section className="mt-28 mb-16">
                <div
                    className="relative overflow-hidden flex flex-col items-center justify-center text-center gap-5 px-6 py-20"
                    style={{ backgroundColor: "var(--brand-foret)", borderRadius: "var(--radius-xl)" }}
                >
                    <img
                        src="/img/motif/motifs-1000 1.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-5">
                        <h2 className="text-6xl font-abhaya-bold" style={{ color: "var(--text-inverse)" }}>
                            Prêt à dessiner votre itinéraire&nbsp;?
                        </h2>
                        <p className="font-body text-sm max-w-xl" style={{ color: "var(--text-inverse-secondary)" }}>
                            Ouvrez la carte de Madagascar, épinglez vos étapes et recevez une proposition personnalisée sous 48h.
                        </p>
                        <button
                            className="mt-2 px-8 py-3 font-body-strong text-sm transition-all duration-200"
                            style={{
                                backgroundColor: "var(--cta-accent-bg)",
                                color: "var(--cta-accent-text)",
                                borderRadius: "var(--radius-md)",
                                boxShadow: "var(--shadow-card)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-accent-bg-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-accent-bg)")}
                        >
                            Créer mon circuit
                        </button>
                    </div>
                </div>
            </section>
        </>
        
    );
}