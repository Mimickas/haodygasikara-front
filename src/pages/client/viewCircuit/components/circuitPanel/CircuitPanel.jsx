import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { FaXmark, FaArrowRight, FaGripVertical } from "react-icons/fa6";
import { ChevronDown, Star } from "lucide-react";
import { circuitSteps } from "../../../../../utils/circuit";
import { useCircuitPanel } from "../../../../../hooks/design/animations/circuit/useCircuitPanel";
import { useReorderDrag } from "../../../../../hooks/useReorderDrag";

// Le panneau ne se contente pas d'afficher : il s'ouvre, se ferme et se
// parcourt sous GSAP (cf. useCircuitPanel). Ce fichier ne garde donc que la
// structure et les reperes `data-*` que la choreographie vient chercher.
//
// ── Le parti pris ────────────────────────────────────────────────────────
// Trois versions fausses avant celle-ci, et les nommer evite d'y revenir.
//
//   1. Une scene sombre sur #12100D. Jeton invente sur place, hors charte.
//   2. Une planche ivoire. Juste sur la couleur, fausse sur le vocabulaire :
//      grain de papier, capitales a 0.42em, filets qui s'eteignent aux
//      extremites, losanges, texte vertical. Un cartel de musee.
//   3. Une version dite « moderne » qui etait du vocabulaire SaaS : pilules,
//      cartes a 16 px de rayon, ombres portees. C'est l'exact contraire du
//      luxe — une maison premium n'arrondit pas ses angles et ne pose pas
//      d'ombre sous ses blocs.
//
// ── LA REGLE ─────────────────────────────────────────────────────────────
// ANGLE VIF PARTOUT. Aucun `border-radius` dans ce fichier, sauf les deux
// boutons ronds de fermeture ou le cercle est une forme voulue, pas un angle
// adouci. Le rayon de complaisance — 8, 12, 16 px sur une carte — est le
// marqueur le plus sur d'une interface de produit plutot que d'une marque.
//
// Ce qui porte le dessin a la place des ornements :
//
//   1. LE VIDE. Marges a 80 px, sections a 160 px de respiration. C'est le
//      vide qui separe, pas un trait ni une ombre. Une halte occupe 190 px
//      de haut : on perd la vue d'ensemble sur quinze etapes, on gagne le
//      rythme — et le rythme est ce qu'on achete.
//
//   2. L'ECHELLE ET LA CHASSE NEGATIVE. Le nom du circuit monte a 8 rem avec
//      -0.03em de chasse. Une grande typo resserree est chere ; une petite
//      typo espacee a 0.42em est un cartel. C'est le seul changement qui, a
//      lui seul, deplace la page d'une epoque a l'autre.
//
//   3. DES FILETS FRANCS. Un pixel, pleine largeur, sans degrade aux bouts.
//      Le filet qui s'eteint etait une coquetterie ; un trait honnete assume
//      sa fonction et se tait.
//
//   4. LA PHOTOGRAPHIE EN PLEIN CADRE. Le hero prend toute la hauteur, les
//      vignettes passent de 156 a 220 px. Sur ce fond, une image de paysage
//      gagne deux crans de contraste — autant lui donner la place.
//
// Toutes les couleurs sortent de la charte : --bg-dark pour le fond,
// --text-inverse* pour les encres, --brand-ocre pour l'accent, --cta-* pour
// l'appel a l'action. Plus aucune valeur inventee.
//
// La carte Mapbox a ete retiree : plus aucun contexte WebGL, plus aucune
// requete de tuiles, et le morceau `mapbox-gl` sort du build. L'itineraire
// prend sa place, et il se manipule — l'ordre des etapes est l'information
// principale d'un circuit, on le donne a composer plutot qu'a lire. Chaque
// halte se saisit par sa poignee (glisser-deposer ou fleches du clavier), les
// journees se reportent le long du trajet a chaque deplacement.
//
// Ce qui est tenu cote performance :
//   * le defilement ne declenche aucun rendu React — barre condensee et
//     reveals sont des ScrollTrigger ;
//   * le glisser-deposer non plus : il ecrit directement les transformations,
//     le state ne bouge qu'au debut et a la fin du geste ;
//   * les vignettes sont en chargement paresseux et decodees hors du fil
//     principal ;
//   * Lenis relache le panneau via data-lenis-prevent, ce qui supprime le
//     handler onWheel appele a chaque cran de molette.

// Les jetons du panneau vivent dans .cx-panel (index.css). Ceux repris ici en
// dur le sont pour une raison precise : GSAP interpole des couleurs, pas des
// `var(--x)`, et le hook ne sait resoudre que les variables posees sur
// :root — pas celles d'une classe locale. Tout ce qui passe par
// `data-hover-swap` doit donc etre litteral.
const OCRE = "#F1B631";    // --brand-ocre, l'accent
const ENCRE = "#F7F5F0";   // --text-inverse
const FOND = "#100e0b";    // --bg-dark
const FILET = "rgba(247,245,240,0.10)";
const FILET_FORT = "rgba(247,245,240,0.20)";
const TRANSPARENT = "rgba(0,0,0,0)";

// Le hero ne s'arrete pas sur une arete : son bas se fond dans le fond de la
// page, de sorte qu'on ne voit jamais ou finit la photo et ou commence le
// panneau. C'est la difference entre une image collee et une image imprimee.
// Le haut recoit un voile plus leger, juste ce qu'il faut pour que la croix
// tienne sur une photographie claire.
const VOILE_HERO = `linear-gradient(to top, ${FOND} 0%, rgba(16,14,11,0.92) 22%, rgba(16,14,11,0.45) 46%, rgba(16,14,11,0.10) 74%, rgba(16,14,11,0.45) 100%)`;

// ── La grille d'une halte ────────────────────────────────────────────────
// La poignee, l'ordinal, la vignette, le nom, le sejour, la bascule. Six
// colonnes alignees, sans entete — l'ancien deroule en avait un (Nº, Etape,
// Appreciation, Sejour) et c'etait litteralement un tableau. Les colonnes se
// lisent seules parce qu'elles sont alignees.
const COL_POIGNEE = 24;
const COL_ORDINAL = 56;
const COL_MEDIA = 220;
const COL_BASCULE = 44;
const GAP_LIGNE = 40;

const GRILLE_HALTE = `${COL_POIGNEE}px ${COL_ORDINAL}px ${COL_MEDIA}px minmax(0, 1fr) auto ${COL_BASCULE}px`;

// Le depli s'aligne sur le nom du lieu, pas sur le bord du panneau : le grand
// visuel et le texte tombent exactement sous le titre qu'ils developpent.
// Deduit des memes constantes que la ligne, sinon les deux derivent au premier
// reglage d'espacement.
const RETRAIT_DEPLI = COL_POIGNEE + COL_ORDINAL + COL_MEDIA + GAP_LIGNE * 3;

// Le back renvoie plusieurs visuels par lieu, ranges par `position`, dont un
// eventuel `isCover`. La couverture prime, sinon le premier de la file.
const imagePrincipale = (place) => {
    const images = place?.images ?? [];
    if (!images.length) return null;
    const couverture = images.find((img) => img.isCover);
    if (couverture?.url) return couverture.url;
    return [...images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url ?? null;
};

export default function CircuitPanel({ circuit, onClose }) {
    // Ordre d'origine : celui range dans `position` cote administration.
    const origine = useMemo(() => circuitSteps(circuit), [circuit]);

    // `null` tant que le visiteur n'a rien deplace — on garde ainsi la
    // reference d'origine, donc la possibilite de la retablir et de savoir si
    // le parcours a ete retouche.
    const [ordre, setOrdre] = useState(null);
    const [ouvert, setOuvert] = useState(null);
    const [annonce, setAnnonce] = useState("");

    useEffect(() => {
        setOrdre(null);
        setOuvert(null);
    }, [origine]);

    const steps = ordre ?? origine;

    const reordonner = useCallback((depuis, vers) => {
        if (depuis == null || vers == null || depuis === vers) return;

        const suite = [...(ordre ?? origine)];
        const [deplacee] = suite.splice(depuis, 1);
        suite.splice(vers, 0, deplacee);

        setOrdre(suite);
        // Une ligne depliee pendant un deplacement brouille la lecture du
        // nouvel ordre : on referme.
        setOuvert(null);
        setAnnonce(`${deplacee?.place?.nom ?? "Étape"} déplacée en position ${vers + 1} sur ${suite.length}`);
    }, [ordre, origine]);

    const { listRef, dragIndex, poigneeProps } = useReorderDrag({
        count: steps.length,
        onReorder: reordonner,
    });

    const modifie = ordre !== null && ordre.some((step, i) => step !== origine[i]);

    const retablir = useCallback(() => {
        setOrdre(null);
        setOuvert(null);
        setAnnonce("Ordre d'origine rétabli");
    }, []);

    const basculer = useCallback((index) => {
        setOuvert((actuel) => (actuel === index ? null : index));
    }, []);

    // Les jours se cumulent le long du parcours : la troisieme etape ne
    // commence pas au jour 3 mais apres la duree des deux precedentes. C'est ce
    // report qui rend l'ordre lisible autrement que par le numero — et qui se
    // recalcule des qu'on deplace une halte.
    const etapes = useMemo(() => {
        let curseur = 1;
        return steps.map((step, index) => {
            const duree = Math.max(step.durationDays ?? 0, 0);
            const debut = duree > 0 ? curseur : null;
            const fin = duree > 0 ? curseur + duree - 1 : null;
            if (duree > 0) curseur += duree;
            return { step, index, duree, debut, fin };
        });
    }, [steps]);

    const jours = useMemo(
        () => steps.reduce((total, step) => total + (step.durationDays ?? 0), 0),
        [steps]
    );

    // Depart et arrivee suivent l'ordre courant, pas celui du back.
    const route = useMemo(() => {
        const depart = steps[0]?.place?.nom;
        const arrivee = steps[steps.length - 1]?.place?.nom;
        return depart && arrivee ? { depart, arrivee } : null;
    }, [steps]);

    const { scopeRef, fermer } = useCircuitPanel({ onClose, stepsCount: steps.length });

    if (!circuit) return null;

    return (
        <div ref={scopeRef} className="fixed inset-0 z-[90]">
            {/* Voile opaque, sans backdrop-filter : voir la regle 2 du hook.
                Un voile dense occulte la page derriere, que le navigateur peut
                alors garder en couche figee au lieu de la refiltrer. */}
            <div
                data-panel-backdrop
                onClick={fermer}
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(8,7,5,0.88)" }}
            />

            {/* Aucun rayon sur la surface : le panneau est une arete franche,
                pas une feuille aux coins adoucis. */}
            <div
                data-panel-surface
                className="cx-panel absolute top-0 right-0 h-full overflow-hidden"
                style={{ width: "74%", backgroundColor: "var(--cx-stage)" }}
            >
                {/* ===== BARRE CONDENSÉE — glisse dès qu'on quitte le héro ===== */}
                <div className="absolute top-0 left-0 right-0 z-20 overflow-hidden">
                    <div
                        data-panel-bar
                        className="relative flex items-center justify-between gap-10 px-20 py-6"
                        style={{
                            backgroundColor: "var(--cx-stage)",
                            borderBottom: `1px solid ${FILET}`,
                        }}
                    >
                        <div className="flex items-baseline gap-8 min-w-0">
                            <h3
                                className="font-title text-[28px] leading-none truncate tracking-[-0.02em]"
                                style={{ color: "var(--cx-ink)" }}
                            >
                                {circuit.nom}
                            </h3>
                            {jours > 0 && (
                                <span
                                    className="font-body-strong text-[11px] uppercase tracking-[0.1em] shrink-0"
                                    style={{ color: "var(--cx-accent)" }}
                                >
                                    {jours} jours
                                </span>
                            )}
                        </div>

                        <Croix onClick={fermer} taille={40} />
                    </div>
                </div>

                {/* data-lenis-prevent : Lenis rend la molette au panneau au lieu
                    de continuer à piloter la page derrière. Remplace l'ancien
                    onWheel + stopPropagation, appelé à chaque événement.
                    scroll-lux : le pouce clair de ce fond — `scroll-fine` est
                    réglé pour le papier, ici il ressortirait comme une rayure. */}
                <div
                    data-panel-scroller
                    data-lenis-prevent
                    className="h-full overflow-y-auto scroll-lux"
                    style={{ overscrollBehavior: "contain" }}
                >
                    {/* ===== HÉRO =====
                        Plein cadre, pleine hauteur. Sur ce fond le titre peut
                        rester sur la photographie sans qu'on ait a l'assombrir
                        outre mesure : le panneau EST sombre, le voile n'est
                        plus une rustine mais la continuite du fond. */}
                    <div data-panel-hero className="relative overflow-hidden" style={{ height: "100vh" }}>
                        {circuit.imageUrl ? (
                            <img
                                data-panel-hero-media
                                src={circuit.imageUrl}
                                alt={circuit.nom}
                                fetchPriority="high"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div data-panel-hero-media className="w-full h-full" style={{ backgroundColor: "var(--cx-hollow)" }} />
                        )}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: VOILE_HERO }} />

                        <div className="absolute top-10 right-10">
                            <Croix onClick={fermer} taille={52} />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 px-20 pb-20">
                            {circuit.isTemplate && (
                                <div className="overflow-hidden mb-8">
                                    <span
                                        data-panel-hero-line
                                        className="inline-block px-4 py-2 font-body-strong text-[10px] uppercase tracking-[0.1em]"
                                        style={{ border: "1px solid rgba(73,184,232,0.45)", color: "#7FCDEE" }}
                                    >
                                        Modèle
                                    </span>
                                </div>
                            )}

                            <div className="overflow-hidden mb-7">
                                <span data-panel-hero-line className="cx-label font-body-strong" style={{ color: OCRE }}>
                                    Itinéraire signature
                                </span>
                            </div>

                            {/* La chasse negative est le coeur du dessin. Une
                                grande typo resserree est chere ; la meme en
                                petit et espacee est une plaque de musee. */}
                            <div className="overflow-hidden">
                                <h2
                                    data-panel-hero-line
                                    className="font-title leading-[0.88] tracking-[-0.03em]"
                                    style={{ color: "var(--cx-ink)", fontSize: "clamp(3.5rem, 7vw, 8rem)" }}
                                >
                                    {circuit.nom}
                                </h2>
                            </div>

                            {/* Le trace, la duree et le nombre de haltes.
                                Separes par du vide et poses sur un filet franc,
                                sans un seul trait vertical entre eux. */}
                            <div className="overflow-hidden mt-14">
                                <div
                                    data-panel-hero-line
                                    className="flex flex-wrap gap-x-24 gap-y-10 pt-10"
                                    style={{ borderTop: `1px solid ${FILET}` }}
                                >
                                    {route && <Mention valeur={`${route.depart} → ${route.arrivee}`} legende="Tracé" />}
                                    {jours > 0 && <Mention valeur={`${jours} jours`} legende="Durée" />}
                                    <Mention valeur={`${steps.length} haltes`} legende="Étapes" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== ITINÉRAIRE ===== */}
                    <div className="px-20 pt-40">
                        <div data-panel-reveal className="max-w-3xl">
                            <span className="cx-label font-body-strong" style={{ color: OCRE }}>
                                Étape par étape
                            </span>
                            <h3
                                className="mt-8 font-title leading-[0.9] tracking-[-0.025em]"
                                style={{ color: "var(--cx-ink)", fontSize: "clamp(2.5rem, 4.4vw, 4.25rem)" }}
                            >
                                L&rsquo;itinéraire, dans votre ordre
                            </h3>
                            <p className="mt-8 font-body text-[16px] leading-[1.75] max-w-2xl" style={{ color: "var(--cx-ink-2)" }}>
                                Le parcours se lit de haut en bas, halte après halte. Saisissez une étape par sa
                                poignée pour la remonter ou la descendre&nbsp;: les journées se recalculent
                                aussitôt le long du trajet.
                            </p>
                        </div>

                        {/* ── L'invite ────────────────────────────────────────
                            Une ligne de texte, rien de plus. Elle n'a besoin ni
                            d'un cadre, ni d'une pastille, ni d'un filet qui file
                            jusqu'au bord : le geste se nomme, il ne se decore
                            pas. La poignee bat en continu (cf. useCircuitPanel),
                            et c'est ce mouvement qui dit « ceci se saisit ». */}
                        <div data-panel-reveal className="mt-16 flex flex-wrap items-center justify-between gap-8">
                            <div className="flex items-center gap-4 shrink-0">
                                <span data-drag-hint-icon className="flex" style={{ color: OCRE }}>
                                    <FaGripVertical className="text-[12px]" />
                                </span>
                                <span className="font-body text-[13px]" style={{ color: "var(--cx-ink-2)" }}>
                                    Glissez une étape pour composer votre itinéraire
                                </span>
                            </div>

                            {modifie && (
                                <button
                                    onClick={retablir}
                                    className="font-body-strong text-[11px] uppercase tracking-[0.1em] cursor-pointer shrink-0 transition-opacity duration-300 hover:opacity-60"
                                    style={{ color: OCRE }}
                                >
                                    Ordre personnalisé — rétablir
                                </button>
                            )}
                        </div>

                        {/* ── Le déroulé ──────────────────────────────────────
                            Des lignes pleine largeur separees par un filet
                            franc. Le fil conducteur et ses noeuds en losange ont
                            disparu : c'etait l'element le plus « frise
                            chronologique de musee » de la page, et l'ordinal
                            porte deja la sequence. */}
                        <div data-step-list className="relative mt-16" style={{ borderTop: `1px solid ${FILET}` }}>
                            <ul ref={listRef} className="relative">
                                {etapes.map((etape) => (
                                    <StepRow
                                        key={etape.step.id ?? `${etape.step.place?.id}-${etape.index}`}
                                        step={etape.step}
                                        index={etape.index}
                                        total={steps.length}
                                        duree={etape.duree}
                                        debut={etape.debut}
                                        fin={etape.fin}
                                        poigneeProps={poigneeProps}
                                        saisie={dragIndex === etape.index}
                                        ouvert={ouvert === etape.index}
                                        onBasculer={basculer}
                                    />
                                ))}
                            </ul>
                        </div>

                        {/* Les déplacements au clavier n'ont pas d'écho visuel
                            propre : on les dit aux lecteurs d'écran. */}
                        <p className="sr-only" aria-live="polite">{annonce}</p>
                    </div>

                    {/* ===== À PROPOS ===== */}
                    {circuit.notes && (
                        <div className="px-20 pt-40 pb-48">
                            <div data-panel-reveal className="max-w-3xl">
                                <span className="cx-label font-body-strong" style={{ color: OCRE }}>
                                    À propos
                                </span>
                                <h3
                                    className="mt-8 font-title leading-[0.9] tracking-[-0.025em]"
                                    style={{ color: "var(--cx-ink)", fontSize: "clamp(2.25rem, 3.6vw, 3.5rem)" }}
                                >
                                    L&rsquo;esprit du voyage
                                </h3>
                                <p className="mt-10 font-body text-[17px] leading-[1.8]" style={{ color: "var(--cx-ink-2)" }}>
                                    {circuit.notes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Le contenu ne doit pas finir sous le bandeau d'appel a
                        l'action, qui est en position absolue. */}
                    <div style={{ height: "120px" }} />
                </div>

                {/* ===== CTA PERMANENT ===== */}
                {/* overflow-hidden : les deux enfants montent depuis sous la
                    barre a l'ouverture, ils ne doivent pas deborder du panneau. */}
                <div
                    data-panel-cta
                    className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-10 px-20 py-6 overflow-hidden"
                    style={{ backgroundColor: "var(--cx-stage)", borderTop: `1px solid ${FILET}` }}
                >
                    <span className="font-body text-[13px] min-w-0" style={{ color: "var(--cx-ink-3)" }}>
                        Devis sur mesure sous 48&nbsp;h
                    </span>

                    {/* Rectangulaire, sans rayon ni lueur qui balaie : la seule
                        chose qui bouge est la couleur de fond. */}
                    <button
                        data-hover-swap
                        data-hover-from="var(--cta-bg)"
                        data-hover-to="var(--cta-bg-hover)"
                        className="flex items-center gap-5 px-14 py-[18px] font-body-strong text-[11px] uppercase tracking-[0.12em] cursor-pointer shrink-0"
                        style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                    >
                        Demander un devis
                        <FaArrowRight className="text-[11px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// La croix : un anneau d'un pixel, pas un aplat. Il se remplit d'ocre au
// survol et l'icone passe au fond — la seule inversion du panneau.
//
// C'est la seule forme ronde du fichier, et c'est assume : un cercle est ici
// une forme, pas un angle qu'on adoucit.
function Croix({ onClick, taille }) {
    return (
        <button
            onClick={onClick}
            data-hover-swap
            data-hover-from={TRANSPARENT}
            data-hover-to={OCRE}
            data-hover-text-from={ENCRE}
            data-hover-text-to={FOND}
            className="flex items-center justify-center rounded-full cursor-pointer shrink-0"
            style={{
                width: `${taille}px`,
                height: `${taille}px`,
                border: `1px solid ${FILET_FORT}`,
                backgroundColor: TRANSPARENT,
                color: ENCRE,
            }}
            aria-label="Fermer"
        >
            <FaXmark className="text-[14px]" />
        </button>
    );
}

// Une mention du hero : la valeur en grand, la legende en petites capitales
// dessous. Deux lignes valent mieux qu'une enfilade separee par des points.
function Mention({ valeur, legende }) {
    return (
        <div className="flex flex-col gap-3">
            <span
                className="font-title leading-none tracking-[-0.015em]"
                style={{ color: "var(--cx-ink)", fontSize: "clamp(1.25rem, 1.7vw, 1.6rem)" }}
            >
                {valeur}
            </span>
            <span
                className="font-body-strong text-[10px] uppercase tracking-[0.1em]"
                style={{ color: "var(--cx-ink-3)" }}
            >
                {legende}
            </span>
        </div>
    );
}

// Une halte de la file. Memoisee : un circuit peut en aligner une quinzaine et
// rien dans une ligne ne depend de l'etat des autres. `poigneeProps` et
// `onBasculer` sont stables (useCallback), la memoisation tient donc pendant
// tout le geste — seules la ligne saisie et l'ancienne ligne depliee rendent.
//
// Le survol n'ecrit rien : il allume deux reperes deja poses par .cx-step
// (cf. index.css) — un voile tres dilue et l'ordinal qui prend l'accent.
const StepRow = memo(function StepRow({
    step, index, total, duree, debut, fin,
    poigneeProps, saisie, ouvert, onBasculer,
}) {
    const image = imagePrincipale(step.place);
    const etoiles = Math.round(step.place?.stars ?? 0);
    const tags = step.place?.tags ?? [];
    const texte = step.notes || step.place?.description;

    const borne = index === 0 ? "Départ" : index === total - 1 ? "Arrivée" : null;
    const jours = debut == null ? null : debut === fin ? `Jour ${debut}` : `Jours ${debut} — ${fin}`;
    const depliable = Boolean(texte || image);

    return (
        <li
            data-reorder-row
            className="relative"
            style={{
                zIndex: saisie ? 30 : 1,
                backgroundColor: saisie ? "var(--cx-stage)" : "transparent",
                borderBottom: `1px solid ${FILET}`,
            }}
        >
            <article
                data-step-card
                className="cx-step relative"
                style={{
                    // La ligne saisie se souleve : une ombre portee profonde et
                    // un souffle d'echelle disent « elle est dans ma main ».
                    // C'est la seule ombre du fichier, et elle n'existe que
                    // pendant le geste.
                    transform: saisie ? "scale(1.004)" : undefined,
                    boxShadow: saisie ? "0 30px 70px rgba(0,0,0,0.6)" : undefined,
                    transition: "box-shadow 260ms ease, transform 260ms ease",
                }}
            >
                {/* Le voile de survol passe par une opacite plutot que par le
                    fond de la ligne : c'est le compositeur qui le pose. */}
                <span
                    aria-hidden
                    className="cx-step__wash absolute inset-0 pointer-events-none"
                    style={{
                        background: "linear-gradient(90deg, rgba(241,182,49,0.05), rgba(241,182,49,0))",
                        opacity: saisie ? 1 : undefined,
                    }}
                />

                <div
                    className="relative grid items-center py-9"
                    style={{ gridTemplateColumns: GRILLE_HALTE, columnGap: `${GAP_LIGNE}px` }}
                >
                    {/* ── La poignee ──
                        Effacee au repos, pleine des que la halte est approchee.
                        C'est la CSS qui gere ces deux etats. */}
                    <button
                        {...poigneeProps(index)}
                        type="button"
                        aria-label={`Déplacer ${step.place?.nom ?? `l'étape ${index + 1}`} — flèches haut et bas`}
                        title="Glisser pour réordonner"
                        className="cx-step__grip w-6 h-10 flex items-center justify-center outline-none"
                        style={{
                            color: saisie ? OCRE : "var(--cx-ink-3)",
                            cursor: saisie ? "grabbing" : "grab",
                            touchAction: "none",
                            opacity: saisie ? 1 : undefined,
                        }}
                    >
                        <FaGripVertical className="text-[12px]" />
                    </button>

                    {/* ── L'ordinal ──
                        Il porte seul la sequence depuis que le fil a disparu,
                        et passe a l'accent a l'approche : la ligne se designe
                        par son numero, pas par un fond colore. */}
                    <span
                        className={`cx-step__num font-title leading-none tabular-nums tracking-[-0.02em] ${saisie || ouvert ? "cx-step__num--on" : ""}`}
                        style={{ fontSize: "clamp(1.75rem, 2.4vw, 2.5rem)" }}
                    >
                        {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* ── La vignette ──
                        220 px au lieu de 156, angles francs, aucun cadre
                        decale autour : la photographie se suffit. */}
                    <div
                        className="relative overflow-hidden"
                        style={{ width: `${COL_MEDIA}px`, height: "138px", backgroundColor: "var(--cx-hollow)" }}
                    >
                        {image && (
                            <img
                                data-step-media
                                src={image}
                                alt={step.place?.nom}
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* ── Le nom et sa meta ── */}
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-5">
                            <h4
                                className="font-title leading-[1.05] truncate tracking-[-0.02em]"
                                style={{ color: "var(--cx-ink)", fontSize: "clamp(1.5rem, 2.1vw, 2.1rem)" }}
                            >
                                {step.place?.nom}
                            </h4>
                            {borne && (
                                <span
                                    className="shrink-0 font-body-strong text-[9px] uppercase tracking-[0.1em] px-3 py-[6px]"
                                    style={{ border: `1px solid ${FILET_FORT}`, color: "var(--cx-ink-3)" }}
                                >
                                    {borne}
                                </span>
                            )}
                        </div>

                        {/* Appreciation et tags sur une meme ligne basse. Les
                            etoiles vides ont disparu : on ne dessine que ce qui
                            est acquis, cinq gabarits gris ne disent rien. */}
                        {(etoiles > 0 || tags.length > 0) && (
                            <div className="mt-4 flex items-center gap-5 min-w-0">
                                {etoiles > 0 && (
                                    <span className="flex items-center gap-1 shrink-0" aria-label={`${etoiles} sur 5`}>
                                        {Array.from({ length: etoiles }, (_, i) => (
                                            <Star key={i} size={12} fill={OCRE} stroke={OCRE} strokeWidth={1} />
                                        ))}
                                    </span>
                                )}
                                {tags.length > 0 && (
                                    <p className="font-body text-[12px] truncate" style={{ color: "var(--cx-ink-3)" }}>
                                        {tags.map((tag) => tag.nom).join("   ·   ")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Le sejour ── */}
                    <div className="text-right shrink-0">
                        {jours && (
                            <span
                                className="block font-title leading-none tabular-nums tracking-[-0.015em] text-[20px]"
                                style={{ color: "var(--cx-ink)" }}
                            >
                                {jours}
                            </span>
                        )}
                        {duree > 0 && (
                            <span className="block mt-3 font-body text-[12px]" style={{ color: "var(--cx-ink-3)" }}>
                                {duree} nuit{duree > 1 ? "s" : ""} sur place
                            </span>
                        )}
                    </div>

                    {/* ── La bascule ──
                        Un carre d'un pixel, pas un anneau : c'est la forme du
                        panneau. Il prend l'accent quand le depli est ouvert. */}
                    {depliable ? (
                        <button
                            type="button"
                            onClick={() => onBasculer(index)}
                            aria-expanded={ouvert}
                            aria-label={ouvert ? "Replier l'étape" : "Déplier l'étape"}
                            className="w-11 h-11 flex items-center justify-center justify-self-end cursor-pointer transition-colors duration-300"
                            style={{
                                border: `1px solid ${ouvert ? OCRE : FILET_FORT}`,
                                color: ouvert ? OCRE : "var(--cx-ink-2)",
                            }}
                        >
                            <ChevronDown
                                size={16}
                                className="transition-transform duration-500"
                                style={{ transform: ouvert ? "rotate(180deg)" : "none" }}
                            />
                        </button>
                    ) : <span />}
                </div>

                {/* Depli : le grand visuel et le texte que la ligne resume.
                    `grid-template-rows` de 0fr a 1fr — la seule facon d'animer
                    une hauteur inconnue sans la mesurer en JavaScript. */}
                <div
                    className="relative grid transition-[grid-template-rows] duration-500 ease-out"
                    style={{ gridTemplateRows: ouvert ? "1fr" : "0fr" }}
                >
                    <div className="overflow-hidden">
                        <div className="pb-14" style={{ paddingLeft: `${RETRAIT_DEPLI}px`, paddingTop: ouvert ? "4px" : 0 }}>
                            {image && (
                                <div
                                    className="relative overflow-hidden mb-10"
                                    style={{ height: "clamp(260px, 28vw, 420px)", backgroundColor: "var(--cx-hollow)" }}
                                >
                                    <img
                                        src={image}
                                        alt={step.place?.nom}
                                        loading="lazy"
                                        decoding="async"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Les tags ne sont ni des pastilles encadrees ni des
                                pilules : des capitales posees dans le vide. */}
                            {tags.length > 0 && (
                                <ul className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-10">
                                    {tags.map((tag) => (
                                        <li key={tag.id ?? tag.nom}>
                                            <span
                                                className="font-body-strong text-[10px] uppercase tracking-[0.1em]"
                                                style={{ color: OCRE }}
                                            >
                                                {tag.nom}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {texte && (
                                <p className="max-w-2xl font-body text-[16px] leading-[1.8]" style={{ color: "var(--cx-ink-2)" }}>
                                    {texte}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </article>
        </li>
    );
});
