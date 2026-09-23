import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Héro de la page détail : un média plein cadre, plusieurs à choisir, et le
// passage de l'un à l'autre. Comme pour le panneau (useCircuitPanel), toute la
// chorégraphie vit ici ; le composant ne pose que des repères `data-*`.
//
// Le balayage n'anime que des `transform`. Le calque entrant glisse depuis le
// bord pendant que son contenu glisse en sens inverse presque d'autant : les
// deux mouvements s'annulent, l'image paraît immobile et c'est le cadre qui
// s'ouvre sur elle. Un `clip-path` donnerait le même dessin mais repeindrait
// tout l'écran à chaque frame — et le curseur en `mix-blend-mode` repeint déjà.
//
// Le défilement automatique se suspend hors de l'écran et onglet masqué.
// useSmoothScroll coupe le lagSmoothing de GSAP : un minuteur laissé en marche
// dans un onglet caché sauterait d'un coup à sa fin au retour.

const DUREE_IMAGE = 7;          // secondes d'affichage d'une photographie
const ATTENTE_FILM = 4;         // secondes laissées à un film pour démarrer
const DUREE_BALAYAGE = 1.35;
const EASE_BALAYAGE = "expo.inOut";
const DERIVE = 14;              // % dont l'image entrante glisse encore dans son cadre
const RECUL = 24;               // % dont l'image sortante est repoussée

const ATTENTE_MAX_MEDIA = 2200; // ms : au-delà, l'ouverture part sans son image

// Résout quand le média peut s'afficher sans trou — image décodée, première
// frame d'un film. Une image en erreur résout aussi : l'ouverture ne doit
// jamais rester bloquée.
const mediaPret = (media) => {
    if (!media) return Promise.resolve();
    if (media.tagName === "VIDEO") {
        return media.readyState >= 2
            ? Promise.resolve()
            : new Promise((ok) => media.addEventListener("loadeddata", ok, { once: true }));
    }
    return media.decode ? media.decode().catch(() => {}) : Promise.resolve();
};

const sansAnimation = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * @param {object} options
 * @param {Array}  options.medias liste issue de circuitMedias()
 */
export function useCircuitShowcase({ medias = [] }) {
    const scopeRef = useRef(null);
    const total = medias.length;

    const [reduit] = useState(sansAnimation);
    const [index, setIndex] = useState(0);
    // Mouvement réduit : rien ne part tout seul, le bouton lecture reste là.
    const [enPause, setEnPause] = useState(reduit);
    const [dansLeCadre, setDansLeCadre] = useState(true);
    const [ongletVisible, setOngletVisible] = useState(true);

    const anime = !enPause && dansLeCadre && ongletVisible;

    const indexRef = useRef(0);
    const precedentRef = useRef(0);
    const sensRef = useRef(1);
    const animeRef = useRef(anime);
    const balayageRef = useRef(null);
    const pisteRef = useRef(null);

    const aller = useCallback((cible, sens) => {
        if (total < 2) return;
        const vers = ((cible % total) + total) % total;
        if (vers === indexRef.current) return;
        sensRef.current = sens ?? (vers > indexRef.current ? 1 : -1);
        precedentRef.current = indexRef.current;
        indexRef.current = vers;
        setIndex(vers);
    }, [total]);

    const suivant = useCallback(() => aller(indexRef.current + 1, 1), [aller]);
    const precedent = useCallback(() => aller(indexRef.current - 1, -1), [aller]);
    const basculerPause = useCallback(() => setEnPause((p) => !p), []);

    // Lus depuis des callbacks GSAP ou des promesses : on passe par des refs
    // pour ne pas recréer minuteurs et écouteurs à chaque rendu.
    const suivantRef = useRef(suivant);
    useEffect(() => { suivantRef.current = suivant; }, [suivant]);
    useEffect(() => { animeRef.current = anime; }, [anime]);

    // ── Ouverture et parallaxe ────────────────────────────────────────────
    useGSAP(() => {
        const racine = scopeRef.current;
        if (!racine) return;
        const q = gsap.utils.selector(racine);

        // Posé avant la première frame : seul le premier média est visible.
        const calques = q("[data-showcase-layer]");
        gsap.set(calques, { autoAlpha: 0, zIndex: 0 });
        if (calques[0]) gsap.set(calques[0], { autoAlpha: 1, zIndex: 1 });
        // Les barres de progression partent vides dès la première frame, pas
        // après le useEffect de la piste.
        gsap.set(q("[data-showcase-progress]"), { scaleX: 0, transformOrigin: "left center" });

        if (reduit) return;

        const premierMedia = calques[0]?.querySelector("[data-showcase-media]");

        // L'ouverture attend son image. Lancée sur un cadre encore vide, elle
        // se jouait dans le noir et le cliché tombait ensuite d'un bloc. La
        // timeline est donc créée en pause — les états de départ sont posés
        // tout de suite — puis lancée dès que le premier média est décodé, ou
        // au plus tard après ATTENTE_MAX_MEDIA.
        const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
            .fromTo(premierMedia ?? [], { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" }, 0)
            .fromTo(premierMedia ?? [], { scale: 1.16 }, { scale: 1, duration: 2.6, ease: "power2.out" }, 0)
            .from(q("[data-showcase-kicker]"), { yPercent: 115, duration: 1 }, 0.3)
            .from(q("[data-showcase-word]"), { yPercent: 115, duration: 1.3, stagger: 0.05 }, 0.38)
            .from(q("[data-showcase-fade]"), { y: 28, opacity: 0, duration: 1.1, stagger: 0.09, ease: "power3.out" }, 0.8)
            .from(q("[data-showcase-thumb]"), { y: 32, opacity: 0, duration: 0.9, stagger: 0.06, ease: "power3.out" }, 0.95);

        let demonte = false;
        Promise.race([mediaPret(premierMedia), new Promise((ok) => setTimeout(ok, ATTENTE_MAX_MEDIA))])
            .then(() => { if (!demonte) intro.play(); });

        // En quittant le héro, l'image traîne et le texte s'efface : deux
        // vitesses, comme l'accroche de la page des circuits.
        const derive = { trigger: racine, start: "top top", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true };
        gsap.to(q("[data-showcase-stage]"), { yPercent: 12, ease: "none", scrollTrigger: derive });
        gsap.to(q("[data-showcase-content]"), { y: -90, opacity: 0, ease: "none", scrollTrigger: { ...derive } });

        return () => { demonte = true; };
    }, { scope: scopeRef });

    // ── Balayage d'un média à l'autre ─────────────────────────────────────
    // Sans revertOnUpdate : le calque posé par le passage précédent doit
    // garder son état quand le suivant démarre.
    useGSAP(() => {
        const racine = scopeRef.current;
        const depuis = precedentRef.current;
        const vers = index;
        if (!racine || depuis === vers) return;

        // Un clic pendant un passage : on le termine net avant de lancer
        // l'autre, sinon deux timelines se disputent les mêmes calques.
        balayageRef.current?.progress(1).kill();

        const calques = gsap.utils.toArray("[data-showcase-layer]", racine);
        const entrant = calques[vers];
        const sortant = calques[depuis];
        if (!entrant || !sortant) return;

        const sens = sensRef.current;
        const fondEntrant = entrant.querySelector("[data-showcase-inner]");
        const mediaEntrant = entrant.querySelector("[data-showcase-media]");
        const fondSortant = sortant.querySelector("[data-showcase-inner]");

        calques.forEach((calque) => {
            if (calque !== entrant && calque !== sortant) gsap.set(calque, { autoAlpha: 0, zIndex: 0 });
        });
        gsap.set(sortant, { autoAlpha: 1, zIndex: 1 });
        gsap.set(entrant, { autoAlpha: 1, zIndex: 2 });

        const poser = () => {
            gsap.set(sortant, { autoAlpha: 0, zIndex: 0 });
            gsap.set(fondSortant, { xPercent: 0 });
            gsap.set(entrant, { zIndex: 1 });
        };

        gsap.from(gsap.utils.toArray("[data-showcase-caption]", racine), {
            yPercent: 100, opacity: 0, duration: 0.9, delay: reduit ? 0 : 0.25, ease: "power3.out",
        });

        if (reduit) {
            balayageRef.current = gsap.timeline({ onComplete: poser })
                .fromTo(entrant, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" });
            return;
        }

        balayageRef.current = gsap.timeline({
            defaults: { duration: DUREE_BALAYAGE, ease: EASE_BALAYAGE },
            onComplete: poser,
        })
            .fromTo(entrant, { xPercent: 100 * sens }, { xPercent: 0 }, 0)
            .fromTo(fondEntrant, { xPercent: -(100 - DERIVE) * sens }, { xPercent: 0 }, 0)
            .fromTo(mediaEntrant, { scale: 1.12 }, { scale: 1, duration: DUREE_BALAYAGE + 0.9, ease: "power2.out" }, 0)
            .to(fondSortant, { xPercent: -RECUL * sens }, 0);
    }, { scope: scopeRef, dependencies: [index] });

    // ── Piste du média actif : barre de progression et film ───────────────
    useEffect(() => {
        const racine = scopeRef.current;
        if (!racine || !total) return;

        const traits = racine.querySelectorAll("[data-showcase-progress]");
        const trait = traits[index] ?? null;
        if (traits.length) gsap.set(traits, { scaleX: 0 });

        const video = racine.querySelectorAll("[data-showcase-layer]")[index]?.querySelector("video") ?? null;
        let minuteur = null;
        let suivi = null;

        // Photographie, ou film qui refuse de démarrer : la barre se remplit à
        // son rythme puis passe la main au média suivant.
        const armerMinuteur = () => {
            if (total < 2 || !trait || minuteur) return;
            minuteur = gsap.fromTo(trait, { scaleX: 0 }, {
                scaleX: 1,
                duration: DUREE_IMAGE,
                ease: "none",
                paused: !animeRef.current,
                onComplete: () => suivantRef.current(),
            });
        };

        const piste = { lire: () => minuteur?.resume(), suspendre: () => minuteur?.pause() };
        const nettoyages = [() => minuteur?.kill()];

        if (!video) {
            armerMinuteur();
        } else {
            // Un film suit sa propre durée : la barre lit currentTime à chaque
            // frame, `timeupdate` n'arrivant que quatre fois par seconde. Une
            // durée inconnue ou infinie (flux, WebM sans en-tête) laisse la
            // barre vide plutôt que d'y écrire NaN.
            if (trait && total > 1) {
                const ecrire = gsap.quickSetter(trait, "scaleX");
                suivi = () => {
                    if (Number.isFinite(video.duration) && video.duration > 0) {
                        ecrire(Math.min(video.currentTime / video.duration, 1));
                    }
                };
                gsap.ticker.add(suivi);
            }

            let demarre = false;
            let gardeFinie = false;
            let garde = null;

            const panne = () => {
                gardeFinie = true;
                garde?.kill();
                if (suivi) gsap.ticker.remove(suivi);
                suivi = null;
                armerMinuteur();
            };
            const fin = () => suivantRef.current();
            const surLecture = () => {
                demarre = true;
                gardeFinie = true;
                garde?.kill();
            };

            // Un film qui tarde — réseau lent, fichier lourd — ne doit pas figer
            // le défilement sur son affiche : passé ATTENTE_FILM sans lecture
            // effective, la barre repasse au minuteur. Le film peut encore
            // partir ensuite ; c'est alors le minuteur qui décide du passage.
            garde = gsap.delayedCall(ATTENTE_FILM, () => { if (!demarre) panne(); }).pause();

            video.addEventListener("ended", fin);
            video.addEventListener("error", panne);
            video.addEventListener("playing", surLecture);
            nettoyages.push(() => {
                video.removeEventListener("ended", fin);
                video.removeEventListener("error", panne);
                video.removeEventListener("playing", surLecture);
                garde.kill();
                if (suivi) gsap.ticker.remove(suivi);
            });

            try { video.currentTime = 0; } catch { /* métadonnées pas encore chargées */ }

            piste.lire = () => {
                minuteur?.resume();
                if (!gardeFinie) garde.resume();
                video.play()?.catch((erreur) => {
                    // AbortError : une pause a simplement interrompu la
                    // lecture. Tout autre refus (lecture automatique bloquée,
                    // format illisible) bascule sur le minuteur.
                    if (erreur?.name === "AbortError") return;
                    panne();
                    if (animeRef.current) minuteur?.resume();
                });
            };
            piste.suspendre = () => {
                minuteur?.pause();
                garde.pause();
                video.pause();
            };
        }

        pisteRef.current = piste;

        return () => {
            nettoyages.forEach((f) => f());
            if (pisteRef.current === piste) pisteRef.current = null;
            // Le film sortant tourne encore sous le balayage, puis s'arrête —
            // sauf si l'on est revenu dessus entre-temps.
            if (video) {
                const quitte = index;
                gsap.delayedCall(DUREE_BALAYAGE, () => {
                    if (indexRef.current !== quitte) video.pause();
                });
            }
        };
    }, [index, total]);

    // Lecture et pause suivent l'état, pas l'inverse : un seul endroit décide.
    useEffect(() => {
        const piste = pisteRef.current;
        if (!piste) return;
        if (anime) piste.lire();
        else piste.suspendre();
    }, [anime, index]);

    // ── Hors champ, onglet masqué ─────────────────────────────────────────
    useEffect(() => {
        const racine = scopeRef.current;
        if (!racine) return;

        const observateur = new IntersectionObserver(
            ([entree]) => setDansLeCadre(entree.isIntersecting),
            { threshold: 0.2 }
        );
        observateur.observe(racine);

        const surVisibilite = () => setOngletVisible(!document.hidden);
        document.addEventListener("visibilitychange", surVisibilite);

        return () => {
            observateur.disconnect();
            document.removeEventListener("visibilitychange", surVisibilite);
        };
    }, []);

    // Flèches du clavier sur le sélecteur.
    const surTouche = useCallback((e) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            suivant();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            precedent();
        }
    }, [suivant, precedent]);

    return { scopeRef, index, aller, suivant, precedent, enPause, basculerPause, anime, surTouche };
}
