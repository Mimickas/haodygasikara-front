import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const CHEMINS = { login: "/login", register: "/register" };

export const modeDepuisUrl = (chemin) =>
    chemin?.startsWith(CHEMINS.register) ? "register" : "login";

// Bascule connexion ↔ inscription sans changer de page.
//
// Deux temps, jamais mélangés : le formulaire en place sort d'abord en
// cascade, puis seulement le nouveau entre — depuis le côté opposé. C'est ce
// croisement qui donne la sensation de deux volets qui glissent, plutôt qu'un
// simple fondu.
//
// Aller vers l'inscription : tout descend, le nouveau arrive par le haut.
// Retour vers la connexion : tout monte, le nouveau arrive par le bas.
const DISTANCE = 46;

export function useAuthTransition(modeInitial) {
    const scopeRef = useRef(null);

    const [mode, setMode] = useState(modeInitial);       // la cible, celle de l'URL
    const [contenu, setContenu] = useState(modeInitial); // ce qui est réellement rendu
    const [phase, setPhase] = useState("intro");         // intro | repos | sortie | entree

    const versLeBas = useRef(true);

    // ── Ouverture de la page ─────────────────────────────────────────────
    useGSAP(() => {
        const tl = gsap.timeline({
            defaults: { ease: "expo.out" },
            onComplete: () => setPhase("repos"),
        });

        tl.fromTo("[data-volet]",
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut" }, 0);

        tl.fromTo("[data-img]", { scale: 1.35 }, { scale: 1, duration: 2.6, ease: "power2.out" }, 0);

        tl.from("[data-retour]", { opacity: 0, x: -18, duration: 0.9 }, 0.9);

        tl.from("[data-photo-kicker]", { yPercent: 110, duration: 1 }, 0.85);
        tl.from("[data-photo-line]", { yPercent: 115, duration: 1.2, stagger: 0.11 }, 0.95);
        tl.fromTo("[data-photo-rule]", { scaleX: 0 },
            { scaleX: 1, duration: 1.2, transformOrigin: "left center", ease: "power3.inOut" }, 1.45);
        tl.from("[data-photo-foot]", { opacity: 0, duration: 0.9 }, 1.6);

        tl.from("[data-form-kicker]", { yPercent: 110, duration: 1 }, 0.75);
        tl.from("[data-form-line]", { yPercent: 115, duration: 1.2, stagger: 0.11 }, 0.85);
        tl.from("[data-text-item]", {
            y: 26, opacity: 0, duration: 0.85, stagger: 0.09,
            ease: "power3.out", clearProps: "transform",
        }, 1.2);
    }, { scope: scopeRef });

    // ── Temps 1 : le formulaire en place s'en va ─────────────────────────
    useEffect(() => {
        if (phase !== "sortie") return;

        const blocs = gsap.utils.toArray("[data-swap]", scopeRef.current);
        const bas = versLeBas.current;

        const tw = gsap.to(blocs, {
            y: bas ? DISTANCE : -DISTANCE,
            opacity: 0,
            duration: 0.42,
            ease: "power2.in",
            stagger: { each: 0.05, from: bas ? "start" : "end" },
            onComplete: () => { setContenu(mode); setPhase("entree"); },
        });

        return () => tw.kill();
    }, [phase, mode]);

    // ── Temps 2 : le nouveau arrive du côté opposé ───────────────────────
    useEffect(() => {
        if (phase !== "entree") return;

        const blocs = gsap.utils.toArray("[data-swap]", scopeRef.current);
        const bas = versLeBas.current;

        const tw = gsap.fromTo(blocs,
            { y: bas ? -DISTANCE : DISTANCE, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: "power3.out",
                stagger: { each: 0.06, from: bas ? "start" : "end" },
                clearProps: "transform",
                onComplete: () => setPhase("repos"),
            });

        return () => tw.kill();
    }, [phase, contenu]);

    const basculer = useCallback((cible) => {
        if (cible === mode || phase !== "repos") return;
        versLeBas.current = cible === "register";
        setMode(cible);
        setPhase("sortie");

        // L'URL suit sans passer par le routeur : une vraie navigation
        // remonterait le composant et casserait la transition.
        if (window.location.pathname !== CHEMINS[cible]) {
            window.history.pushState({ authMode: cible }, "", CHEMINS[cible]);
        }
    }, [mode, phase]);

    // Les boutons précédent / suivant du navigateur restent cohérents.
    // Si une transition est déjà en vol, on bascule sans animer : rejouer une
    // sortie par-dessus laisserait les blocs coincés à opacité 0.
    useEffect(() => {
        const onPop = () => {
            const cible = modeDepuisUrl(window.location.pathname);
            if (cible === mode) return;

            if (phase !== "repos") {
                setMode(cible);
                setContenu(cible);
                setPhase("repos");
                gsap.set(gsap.utils.toArray("[data-swap]", scopeRef.current), { clearProps: "all" });
                return;
            }

            versLeBas.current = cible === "register";
            setMode(cible);
            setPhase("sortie");
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [mode, phase]);

    return { scopeRef, mode, contenu, basculer, enTransition: phase !== "repos" };
}
