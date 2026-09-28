import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// Ouverture du créateur, dans la grammaire de l'accueil et de /circuit :
//   1. le rideau de sable se lève, panneau par panneau ;
//   2. les sur-titres et le nom du voyage montent de sous leur cadre, comme
//      les lignes du titre de l'accueil ;
//   3. les réglages, puis les étapes, se posent l'un après l'autre.
// Les photographies du catalogue ont leur propre révélation (useGalerieVivante),
// calée sur le même tempo.
//
// La timeline ne part qu'une fois le circuit ET le catalogue chargés : lancée
// plus tôt, elle se jouerait derrière le rideau et personne ne la verrait.
// Elle ne se rejoue pas ensuite — un enregistrement qui fait passer de
// /composer à /composer/12 garde le même écran.
export function useComposerIntro(pret) {
    const scopeRef = useRef(null);
    const jouee = useRef(false);

    useGSAP(() => {
        const scope = scopeRef.current;
        if (!pret || jouee.current || !scope) return;
        jouee.current = true;

        const rideau = scope.querySelector("[data-cp-rideau]");
        if (SOBRE()) {
            if (rideau) rideau.style.display = "none";
            return;
        }

        // Viser un sélecteur vide ferait crier GSAP dans la console.
        const cibles = (selecteur) => {
            const trouves = scope.querySelectorAll(selecteur);
            return trouves.length ? trouves : null;
        };

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // Comme le voile de l'accueil : le mot d'attente s'efface vers le
        // haut, puis les panneaux se lèvent l'un après l'autre.
        if (rideau) {
            const attente = rideau.querySelector("[data-cp-attente]");
            if (attente) tl.to(attente, { y: -22, opacity: 0, duration: 0.45, ease: "power2.in" }, 0);
            tl.to(rideau.querySelectorAll("[data-cp-panneau]"), { yPercent: -101, duration: 1, stagger: 0.06, ease: "power4.inOut" }, 0.2)
                .set(rideau, { display: "none" });
        }

        const surtitres = cibles("[data-cp-kicker]");
        const titre = cibles("[data-cp-titre]");
        const vues = cibles("[data-cp-vue]");
        const reglages = cibles("[data-cp-apparait]");
        const etapes = cibles("[data-cp-etape]");

        if (surtitres) tl.from(surtitres, { yPercent: 110, duration: 1, stagger: 0.06, clearProps: "transform" }, 0.7);
        if (titre) tl.from(titre, { yPercent: 105, duration: 1.3, clearProps: "transform" }, 0.78);
        if (vues) tl.from(vues, { yPercent: 110, duration: 1.2, stagger: 0.08, clearProps: "transform" }, 0.82);
        if (reglages) {
            tl.from(reglages, { y: 24, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", clearProps: "transform,opacity" }, 1.05);
        }
        if (etapes) {
            tl.from(etapes, { y: 28, opacity: 0, duration: 0.9, stagger: 0.06, ease: "power3.out", clearProps: "transform,opacity" }, 1.15);
        }
    }, { scope: scopeRef, dependencies: [pret] });

    return scopeRef;
}
