import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// ── Le voile d'attente d'une page ──────────────────────────────────────────
//
// Le nom de la maison, un filet qui se remplit, le compte en très grand corps.
// C'est l'écran d'ouverture de l'accueil, extrait de Home.jsx : il était écrit
// une fois, en dur, dans la seule page qui l'avait — et toutes les autres
// s'ouvraient donc sur des cadres vides que les photographies venaient remplir
// sous les yeux du visiteur.
//
// Il se lève tout seul dès que la page est prête : le compte s'efface vers le
// haut, puis le voile remonte d'un bloc et découvre l'écran. `pilote` le laisse
// à la page qui a sa propre chorégraphie d'ouverture — l'accueil, dont le voile
// et la photographie du héros partent ensemble (cf. animations/home/firstHero).
//
// Les marques `data-loader` et `data-loader-item` sont l'accroche de ces
// animations-là : elles ne sont pas décoratives.

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export default function VoilePage({ progression = 0, pret = false, pilote = false, onParti }) {
    const voile = useRef(null);
    const [monte, setMonte] = useState(true);

    // Le rappel de sortie change d'identité à chaque rendu de la page : par une
    // référence, il ne relance pas l'animation.
    const parti = useRef(onParti);
    parti.current = onParti;

    useEffect(() => {
        if (pilote || !pret) return undefined;
        const el = voile.current;
        if (!el) return undefined;

        const finir = () => { setMonte(false); parti.current?.(); };
        if (SOBRE()) { finir(); return undefined; }

        const tl = gsap.timeline({ onComplete: finir })
            .to(el.querySelectorAll("[data-loader-item]"), {
                y: -26, opacity: 0, duration: 0.45, stagger: 0.06, ease: "power2.in",
            }, 0)
            .to(el, { yPercent: -100, duration: 1.05, ease: "power4.inOut" }, 0.28);
        return () => tl.kill();
    }, [pret, pilote]);

    if (!monte) return null;

    return (
        <div
            ref={voile}
            data-loader
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ backgroundColor: "var(--bg)" }}
            role="status"
            aria-live="polite"
            aria-busy={!pret}
        >
            <span data-loader-item className="font-body-strong text-[11px] uppercase tracking-[0.1em] mb-10" style={{ color: "var(--brand-ocre)" }}>
                Haodygasikara
            </span>

            <div data-loader-item className="w-64 h-[2px] mb-5" style={{ backgroundColor: "var(--border)" }}>
                <div
                    className="h-full transition-all duration-300 ease-out"
                    style={{ width: `${progression}%`, backgroundColor: "var(--brand-terre)" }}
                />
            </div>

            <span data-loader-item className="font-body-strong" style={{ color: "var(--text-primary)", fontSize: "clamp(3rem, 6vw, 5rem)" }}>
                {progression}%
            </span>
        </div>
    );
}
