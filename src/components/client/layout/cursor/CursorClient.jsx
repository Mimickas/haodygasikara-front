import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

// ── Le curseur du site ─────────────────────────────────────────────────────
//
// Un seul élément, trois états — il dit ce que le geste va faire :
//
//   repos   un point de 8 px qui suit le pointeur avec un léger fondu ;
//   lien    au-dessus d'un lien ou d'un bouton, le point s'ouvre en un cercle
//           fin de 44 px : « ceci se clique », sans rien masquer ;
//   média   au-dessus d'une carte ou d'une photo marquée data-curseur, un
//           disque terre porte un mot — « Voir », « Ouvrir » — celui du geste.
//
// Sur un champ de saisie, la main revient au curseur natif (la barre de
// saisie porte du sens). Rien sur écran tactile, rien dans l'administration :
// c'est un outil de travail, le curseur du système y est le bon.
//
// La position passe par transform (quickTo, sur le ticker GSAP déjà en marche
// pour le défilement) ; la forme, par des transitions CSS sur l'élément seul.

const SUIVI = 0.16;   // un fondu, pas un retard : le point ne traîne jamais derrière la main
const CLIQUABLE = 'a, button, [role="button"], label, summary, select';
const SAISIE = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]';

export default function CursorClient() {
    const { pathname } = useLocation();
    const actif = !pathname.startsWith("/admin");
    const curseurRef = useRef(null);
    const libelleRef = useRef(null);

    useEffect(() => {
        if (!actif) return undefined;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

        const curseur = curseurRef.current;
        const libelle = libelleRef.current;
        if (!curseur || !libelle) return undefined;

        const sobre = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const racine = document.documentElement;
        racine.classList.add("has-custom-cursor");

        gsap.set(curseur, { xPercent: -50, yPercent: -50 });
        const posX = gsap.quickTo(curseur, "x", { duration: sobre ? 0 : SUIVI, ease: "power3" });
        const posY = gsap.quickTo(curseur, "y", { duration: sobre ? 0 : SUIVI, ease: "power3" });

        let etatCourant = "";
        const etat = (mode, mot = "") => {
            if (mode === etatCourant && libelle.textContent === mot) return;
            etatCourant = mode;
            curseur.dataset.etat = mode;
            libelle.textContent = mot;
        };

        const onMove = (e) => {
            posX(e.clientX);
            posY(e.clientY);
            curseur.classList.add("curseur--visible");
        };

        const onOver = (e) => {
            const cible = e.target;
            if (typeof cible?.closest !== "function") return;
            if (cible.closest(SAISIE)) return etat("saisie");
            const media = cible.closest("[data-curseur]");
            const clic = cible.closest(CLIQUABLE);
            // Un bouton posé DANS une carte (« + » du créateur) a son propre
            // geste : le cercle de lien, pas le mot de la carte.
            if (media && !(clic && clic !== media && media.contains(clic))) {
                return etat("media", media.getAttribute("data-curseur"));
            }
            etat(clic ? "lien" : "repos");
        };

        const onDown = () => curseur.classList.add("curseur--appui");
        const onUp = () => curseur.classList.remove("curseur--appui");
        const onLeave = () => curseur.classList.remove("curseur--visible");

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseover", onOver, { passive: true });
        window.addEventListener("mousedown", onDown, { passive: true });
        window.addEventListener("mouseup", onUp, { passive: true });
        document.documentElement.addEventListener("mouseleave", onLeave);

        return () => {
            racine.classList.remove("has-custom-cursor");
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseover", onOver);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.documentElement.removeEventListener("mouseleave", onLeave);
            curseur.classList.remove("curseur--visible", "curseur--appui");
            gsap.killTweensOf(curseur);
        };
    }, [actif]);

    if (!actif) return null;

    return (
        <div ref={curseurRef} className="curseur" data-etat="repos" aria-hidden="true">
            <span ref={libelleRef} className="curseur__libelle font-body-strong" />
        </div>
    );
}
