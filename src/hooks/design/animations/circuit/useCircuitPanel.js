import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Choreographie du panneau circuit — tout est pilote ici, plus aucune
// @keyframes CSS. Le gain n'est pas que visuel : une timeline GSAP se met en
// pause, se joue a l'envers et se nettoie, ce qu'une animation CSS ne sait pas
// faire. C'est ce qui rend la fermeture animee possible.
//
// Trois regles tenues dans tout le fichier :
//   1. on n'anime que `transform` et `opacity` — les seules proprietes que le
//      compositeur traite sans repasser par la mise en page ;
//   2. aucun `backdrop-filter`. Un flou plein ecran oblige le navigateur a
//      refiltrer ~1,8 million de pixels des que quoi que ce soit bouge
//      derriere, et l'application compte un curseur sur mesure en
//      `mix-blend-mode: difference` qui bouge a chaque mouvement de souris.
//      Les deux ensemble faisaient tomber l'onglet entier, pas seulement le
//      panneau. Un voile opaque donne la meme lecture pour un cout nul ;
//   3. rien ne passe par un state React — la barre condensee et les reveals
//      sont des ScrollTrigger, donc zero rendu pendant le defilement.

const EASE_ENTREE = "expo.out";      // arrivee franche puis pose tres douce
const EASE_SORTIE = "power3.inOut";  // depart symetrique, sans rebond
const EASE_TEXTE = "power4.out";

const DUREE_ENTREE = 0.92;
const DUREE_SORTIE = 0.58;

// Position de defilement a partir de laquelle la barre condensee apparait,
// quand la hauteur du hero n'est pas mesurable.
const SEUIL_BARRE = 320;

// Sinon, elle se declenche sur une fraction du hero. Le titre du circuit est
// pose EN BAS du hero, qui fait toute la hauteur du panneau : avec un seuil
// fixe de 320 px, la barre affichait le meme nom une seconde fois pendant que
// le titre etait encore a l'ecran. Le seuil doit donc suivre le hero, pas une
// distance en pixels — sinon il se decale a chaque hauteur de fenetre.
const PART_HERO_AVANT_BARRE = 0.86;

// Rafraichit les seuls declencheurs attaches a un conteneur donne.
// ScrollTrigger.refresh() n'a pas de portee : il recalcule tout ce qui existe
// dans la page, y compris les animations d'une autre vue. Ici on veut le
// contraire — le panneau se recale sans jamais toucher au catalogue.
const rafraichirScroller = (conteneur) => {
    if (!conteneur) return;
    ScrollTrigger.getAll().forEach((st) => {
        if (st.scroller === conteneur) st.refresh();
    });
};

const sansAnimation = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * @param {object}   options
 * @param {Function} options.onClose    appele une fois la sortie terminee
 * @param {number}   options.stepsCount recree la choreographie si le deroule change
 */
export function useCircuitPanel({ onClose, stepsCount = 0 }) {
    const scopeRef = useRef(null);
    const fermetureRef = useRef(null);   // timeline de sortie, creee a l'ouverture
    const enFermetureRef = useRef(false);

    // Le callback change d'identite a chaque rendu du parent : on le lit via
    // une ref pour ne pas rejouer toute la choreographie pour autant.
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useGSAP(() => {
        const racine = scopeRef.current;
        if (!racine) return;

        const q = gsap.utils.selector(racine);
        const [voile] = q("[data-panel-backdrop]");
        const [surface] = q("[data-panel-surface]");
        const [scroller] = q("[data-panel-scroller]");
        const [barre] = q("[data-panel-bar]");
        const [hero] = q("[data-panel-hero]");
        const reduit = sansAnimation();

        // ── Etat de depart ────────────────────────────────────────────────
        // Pose en une passe avant la premiere frame peinte : sans ce set, le
        // panneau apparait une frame a sa place finale avant de partir a droite.
        gsap.set(surface, { xPercent: 100, willChange: "transform" });
        gsap.set(voile, { opacity: 0 });
        gsap.set(barre, { yPercent: -100, opacity: 0, pointerEvents: "none" });

        // Appele quand la surface est posee — pas a la fin de la timeline, qui
        // court encore deux secondes avec le zoom arriere de l'image.
        const surfacePosee = () => {
            // On efface le transform, pas seulement le will-change. Tant qu'un
            // transform reste pose, le panneau est un contexte de composition
            // que le navigateur doit reevaluer, et surtout le `position:
            // sticky` des ordinaux du deroule se cale sur lui au lieu du
            // scroller. Une fois immobile, le panneau tient par son `right: 0`.
            gsap.set(surface, { clearProps: "transform,willChange" });
            // Les images du hero ont pu changer la hauteur du contenu : il faut
            // recalculer les bornes. Mais surtout PAS avec ScrollTrigger.refresh(),
            // qui est global.
            //
            // Pourquoi c'est un piege : la page du catalogue est toujours la
            // derriere le voile, avec ses propres declencheurs — l'entree des
            // cartes. Un refresh global les reevalue tous, or au meme instant
            // `document.body` est en `overflow: hidden` (ViewCircuit bloque le
            // defilement de fond) : les cartes deja revelees sont alors relues
            // comme « pas encore atteintes » et leur timeline est rembobinee a
            // l'origine, c'est-a-dire `clip-path: inset(100% 0 0 0)`. Elles
            // disparaissent, et comme leur declencheur est en `once`, rien ne
            // les rejoue jamais. Le panneau reglait ses propres bornes en
            // effacant le catalogue derriere lui.
            //
            // On ne rafraichit donc que les declencheurs de ce panneau.
            rafraichirScroller(scroller);
        };

        // ── Ouverture ─────────────────────────────────────────────────────
        const entree = gsap.timeline({ defaults: { ease: EASE_ENTREE } });

        if (reduit) {
            entree.set(surface, { xPercent: 0 }).set(voile, { opacity: 1 }).call(surfacePosee);
        } else {
            entree
                .to(voile, { opacity: 1, duration: 0.55, ease: "power2.out" }, 0)
                .to(surface, { xPercent: 0, duration: DUREE_ENTREE, ease: EASE_ENTREE, onComplete: surfacePosee }, 0.04)
                // L'image se pose en zoom arriere pendant que le panneau glisse :
                // deux mouvements a des vitesses differentes, c'est ce decalage
                // qui donne la profondeur.
                .fromTo("[data-panel-hero-media]",
                    { scale: 1.14 },
                    { scale: 1, duration: 2.1, ease: "power2.out" }, 0.1)
                .from("[data-panel-hero-line]",
                    { yPercent: 105, opacity: 0, duration: 1.05, stagger: 0.08, ease: EASE_TEXTE }, 0.42)
                .from("[data-panel-cta] > *",
                    { yPercent: 130, opacity: 0, duration: 0.85, stagger: 0.06, ease: EASE_TEXTE }, 0.58);
        }

        // ── Sortie, preparee a l'avance et laissee en pause ────────────────
        // onStart tue l'ouverture : sans ca, une fermeture declenchee avant la
        // fin de l'entree laisserait deux tweens se disputer le meme xPercent,
        // et le panneau repartirait vers la gauche en pleine sortie.
        fermetureRef.current = gsap.timeline({
            paused: true,
            onStart: () => entree.kill(),
            onComplete: () => onCloseRef.current?.(),
        })
            .set(surface, { willChange: "transform" })
            .to(surface, { xPercent: 100, duration: reduit ? 0 : DUREE_SORTIE, ease: EASE_SORTIE }, 0)
            .to(voile, { opacity: 0, duration: reduit ? 0 : 0.44, ease: "power2.in" }, 0.05);

        if (!scroller) return;

        // ── Barre condensee ───────────────────────────────────────────────
        // Remplace le onScroll + setState de l'ancienne version : le defilement
        // ne declenche plus aucun rendu React.
        const barreTl = gsap.timeline({ paused: true })
            .to(barre, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
            .set(barre, { pointerEvents: "auto" });

        // Bornes donnees en position de defilement, pas en mots-cles : avec un
        // `trigger` et un `end` implicite, ScrollTrigger retient "bottom top",
        // donc la barre ne serait active qu'entre le seuil et le bas du hero,
        // puis repartirait. On veut au contraire : visible de 320 px jusqu'en
        // bas, exactement l'ancien `scrollTop > CONDENSED_AT`.
        ScrollTrigger.create({
            scroller,
            start: () => (hero ? hero.offsetHeight * PART_HERO_AVANT_BARRE : SEUIL_BARRE),
            end: () => ScrollTrigger.maxScroll(scroller),
            invalidateOnRefresh: true,
            onToggle: (self) => (self.isActive ? barreTl.play() : barreTl.reverse()),
        });

        // ── Reveals au defilement ─────────────────────────────────────────
        if (!reduit) {
            q("[data-panel-reveal]").forEach((bloc) => {
                gsap.from(bloc, {
                    y: 46,
                    opacity: 0,
                    duration: 1,
                    ease: EASE_TEXTE,
                    scrollTrigger: { scroller, trigger: bloc, start: "top bottom-=90", once: true },
                });
            });

            // Le fil conducteur se trace au defilement. Il porte l'ordre du
            // parcours : le voir avancer d'une etape a l'autre dit la
            // progression mieux qu'un trait deja complet. `scrub` reste bon
            // marche — un seul element, une seule propriete, et scaleY est un
            // transform, donc rien ne repasse par la mise en page.
            const [fil] = q("[data-step-rail]");
            const [liste] = q("[data-step-list]");
            if (fil && liste) {
                gsap.fromTo(fil,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        ease: "none",
                        scrollTrigger: {
                            scroller,
                            trigger: liste,
                            start: "top bottom-=140",
                            end: "bottom bottom-=160",
                            scrub: 0.55,
                            invalidateOnRefresh: true,
                        },
                    });
            }

            // Les haltes se decouvrent par paquets. La file est compacte : une
            // dizaine de lignes entrent souvent dans le meme ecran, et un
            // ScrollTrigger par ligne les ferait toutes apparaitre ensemble.
            // `batch` regroupe celles qui franchissent le seuil dans la meme
            // passe et les echelonne — la liste se remplit au lieu de surgir.
            //
            // clearProps : la ligne saisie recoit un `transform` pendant le
            // glisser-deposer, aucun residu d'animation ne doit trainer dessus.
            ScrollTrigger.batch(q("[data-step-card]"), {
                scroller,
                start: "top bottom-=90",
                once: true,
                onEnter: (lot) =>
                    gsap.from(lot, {
                        y: 24,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.07,
                        ease: EASE_TEXTE,
                        clearProps: "transform",
                    }),
            });

            // ── Affordance du glisser-deposer ─────────────────────────────
            // La poignee de l'invite bat en continu : un mouvement, meme d'un
            // pixel, dit "ceci se saisit" plus vite qu'une phrase.
            const [indice] = q("[data-drag-hint-icon]");
            if (indice) {
                gsap.to(indice, { y: -3, duration: 0.72, repeat: -1, yoyo: true, ease: "sine.inOut" });
            }

            // Et quand la file arrive a l'ecran, la premiere poignee se montre
            // une fois pour toutes : pleine opacite, trois allers-retours, puis
            // elle rend la main au survol — sans le clearProps, l'opacite
            // inline resterait posee et gagnerait sur les classes de survol.
            const premierePoignee = liste?.querySelector("[data-reorder-handle]");
            if (premierePoignee) {
                ScrollTrigger.create({
                    scroller,
                    trigger: liste,
                    start: "top bottom-=200",
                    once: true,
                    onEnter: () => {
                        gsap.timeline({
                            onComplete: () => gsap.set(premierePoignee, { clearProps: "opacity,transform" }),
                        })
                            .to(premierePoignee, { opacity: 1, duration: 0.28, ease: "power2.out" })
                            .to(premierePoignee, { y: -5, duration: 0.24, repeat: 3, yoyo: true, ease: "sine.inOut" })
                            .to(premierePoignee, { y: 0, duration: 0.22, ease: "power2.out" });
                    },
                });
            }
        }

        // ── Survols ───────────────────────────────────────────────────────
        // `overwrite: "auto"` fait le travail : une entree de souris pendant la
        // sortie precedente tue l'ancien tween au lieu de s'y superposer, donc
        // un aller-retour rapide ne saccade pas. On evite quickTo ici : il ne
        // sait pas remettre a zero la propriete composite `scale` et GSAP le
        // signale en console.
        const nettoyages = [];

        q("[data-step-card]").forEach((carte) => {
            const media = carte.querySelector("[data-step-media]");
            if (!media) return;
            const vers = (echelle) =>
                gsap.to(media, { scale: echelle, duration: 0.95, ease: "power3.out", overwrite: "auto" });
            const entre = () => vers(1.06);
            const sort = () => vers(1);
            carte.addEventListener("pointerenter", entre);
            carte.addEventListener("pointerleave", sort);
            nettoyages.push(() => {
                carte.removeEventListener("pointerenter", entre);
                carte.removeEventListener("pointerleave", sort);
            });
        });

        // GSAP interpole des couleurs, pas des `var(--x)` : on resout les jetons
        // une fois pour toutes ici, ce qui laisse les couleurs dans le JSX.
        const racineStyles = getComputedStyle(document.documentElement);
        const couleur = (valeur) => {
            const brut = (valeur ?? "").trim();
            const jeton = brut.match(/^var\((--[\w-]+)\)$/);
            return jeton ? racineStyles.getPropertyValue(jeton[1]).trim() : brut;
        };

        q("[data-hover-swap]").forEach((cible) => {
            const depart = couleur(cible.dataset.hoverFrom);
            const arrivee = couleur(cible.dataset.hoverTo);
            const texteDepart = couleur(cible.dataset.hoverTextFrom);
            const texteArrivee = couleur(cible.dataset.hoverTextTo);

            const anime = (fond, texte) =>
                gsap.to(cible, {
                    backgroundColor: fond,
                    ...(texte ? { color: texte } : null),
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: "auto",
                });

            const entre = () => anime(arrivee, texteArrivee);
            const sort = () => anime(depart, texteDepart);
            cible.addEventListener("pointerenter", entre);
            cible.addEventListener("pointerleave", sort);
            nettoyages.push(() => {
                cible.removeEventListener("pointerenter", entre);
                cible.removeEventListener("pointerleave", sort);
            });
        });

        return () => nettoyages.forEach((f) => f());
    }, { scope: scopeRef, dependencies: [stepsCount] });

    // Joue la sortie puis previent le parent. Verrouille : un double clic sur
    // la croix ne doit pas relancer la timeline depuis le debut.
    const fermer = useCallback(() => {
        if (enFermetureRef.current) return;
        enFermetureRef.current = true;
        const tl = fermetureRef.current;
        if (tl) tl.play();
        else onCloseRef.current?.();
    }, []);

    // Echap ferme, avec la meme sortie animee que la croix.
    useEffect(() => {
        const surTouche = (e) => {
            if (e.key === "Escape") fermer();
        };
        window.addEventListener("keydown", surTouche);
        return () => window.removeEventListener("keydown", surTouche);
    }, [fermer]);

    return { scopeRef, fermer };
}
