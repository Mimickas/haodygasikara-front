import { useEffect, useMemo, useRef } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play, Star } from "lucide-react";
import { circuitDays, circuitMedias, circuitRoute, circuitStars, circuitSteps } from "../../../../../utils/circuit";
import { useCircuitShowcase } from "../../../../../hooks/design/animations/circuit/useCircuitShowcase";

// Premier écran de la page détail : le média plein cadre, le nom du circuit en
// très grand par-dessus, et de quoi passer d'une vue à l'autre. La
// chorégraphie est dans useCircuitShowcase ; ce fichier ne pose que la
// structure et les repères `data-showcase-*`.
//
// Même grammaire que le reste des circuits : angles vifs, filets d'un pixel,
// grande typo resserrée. Seule différence, on est sur la photographie — les
// encres passent donc à l'inverse et l'accent à l'or, le Rouge Terre tombant
// sous le contraste lisible sur une image sombre.

const ENCRE = "var(--text-inverse)";
const ENCRE_2 = "var(--text-inverse-secondary)";
const ENCRE_3 = "var(--text-inverse-muted)";
const OR = "var(--text-yellow)";
// Les props d'icône ne résolvent pas les `var(--x)` : valeurs littérales.
const OR_LITTERAL = "#C79A52";    // --text-yellow
const ENCRE_LITTERALE = "#F5F0E6"; // --text-inverse
const FILET = "rgba(245,240,230,0.18)";
const FILET_FORT = "rgba(245,240,230,0.38)";

// Trois voiles superposés, chacun pour un lecteur : le bas porte le titre et
// la barre, le haut rend le header lisible sur un ciel clair, la gauche tient
// la colonne de texte sans assombrir le reste du cliché.
const VOILE = [
    "linear-gradient(to top, rgba(37,26,18,0.92) 0%, rgba(37,26,18,0.66) 22%, rgba(37,26,18,0.2) 48%, rgba(37,26,18,0) 64%)",
    "linear-gradient(to bottom, rgba(37,26,18,0.55) 0%, rgba(37,26,18,0) 24%)",
    "linear-gradient(to right, rgba(37,26,18,0.5) 0%, rgba(37,26,18,0) 55%)",
].join(", ");

const VOILE_MOBILE =
    "linear-gradient(to top, rgba(37,26,18,0.7) 0%, rgba(37,26,18,0.55) 50%, rgba(37,26,18,0.25) 75%, rgba(37,26,18,0) 90%)";

// Huit photographies et un film éventuel. Le sélecteur n'en montre que trois
// à la fois (VIGNETTES_VISIBLES) et fait défiler le reste : la contrainte n'est
// plus le nombre d'images mais la place de la bande.
const MAX_IMAGES = 8;

// Trois colonnes au plus, et elles se suivent. Au-delà, la bande mangeait la
// largeur du titre ; en-deçà, on ne comprend pas qu'il y en a d'autres — trois
// vignettes suffisent à dire « ça continue » sans le dire.
const VIGNETTES_VISIBLES = 3;

const compte = (n) => String(n).padStart(2, "0");

export default function CircuitShowcase({ circuit, onDecouvrir }) {
    // La section reste montée pendant le chargement. useHeaderTextColor relève
    // les repères `data-header-text` au changement de route, avant l'arrivée
    // des données : si le héro n'apparaissait qu'après le fetch, le header ne
    // le verrait jamais et resterait à l'encre sombre sur la photographie.
    return (
        <section
            data-header-text="var(--text-inverse)"
            aria-label={circuit?.nom}
            className="relative w-full overflow-hidden"
            style={{ height: "100svh", minHeight: "660px", backgroundColor: "var(--bg-dark)" }}
        >
            {/* Clé par circuit : passer d'un circuit à l'autre rejoue l'ouverture
                et repart du premier média, sans jamais remplacer la section. */}
            {circuit && <Scene key={circuit.id} circuit={circuit} onDecouvrir={onDecouvrir} />}
        </section>
    );
}

function Scene({ circuit, onDecouvrir }) {
    const medias = useMemo(() => circuitMedias(circuit, MAX_IMAGES), [circuit]);
    const { scopeRef, index, aller, suivant, precedent, enPause, basculerPause, anime, surTouche } =
        useCircuitShowcase({ medias });

    const jours = circuitDays(circuit);
    const route = circuitRoute(circuit);
    const etapes = circuitSteps(circuit).length;
    const note = circuitStars(circuit);

    const plusieurs = medias.length > 1;
    const actif = medias[index];
    const mots = (circuit.nom ?? "").split(/\s+/).filter(Boolean);

    // La bande ne montre que trois vignettes : celle qui devient active doit se
    // ramener d'elle-même dans la fenêtre, sinon le sélecteur désigne un visuel
    // qu'on ne voit pas. `inline: nearest` fait glisser du minimum nécessaire —
    // `center` recentrerait à chaque pas et donnerait un mouvement permanent.
    const pisteRef = useRef(null);
    useEffect(() => {
        const vignette = pisteRef.current?.children?.[index];
        vignette?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }, [index]);

    return (
        <div ref={scopeRef} className="absolute inset-0">
            {/* ===== SCÈNE =====
                Tous les médias sont montés, empilés. Un seul est visible au
                repos ; le hook ne découvre que les deux calques d'un passage. */}
            <div data-showcase-stage className="absolute inset-0">
                {medias.map((media, i) => (
                    <div
                        key={`${media.type}-${media.src}`}
                        data-showcase-layer
                        aria-hidden={i !== index}
                        className={`absolute inset-0 overflow-hidden ${i === 0 ? "" : "invisible"}`}
                    >
                        <div data-showcase-inner className="absolute inset-0">
                            {media.type === "video" ? (
                                <video
                                    data-showcase-media
                                    src={media.src}
                                    poster={media.poster ?? undefined}
                                    muted
                                    playsInline
                                    loop={!plusieurs}
                                    preload={i === 0 ? "auto" : "metadata"}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    data-showcase-media
                                    src={media.src}
                                    alt={media.titre ?? circuit.nom}
                                    decoding="async"
                                    fetchPriority={i === 0 ? "high" : "low"}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-none" style={{ background: VOILE }} />
            {/* Sous lg, le texte s'empile et monte jusqu'au milieu du cadre, là
                où les voiles du grand écran ne portent plus : un voile bas plus
                haut lui rend son contraste. */}
            <div className="absolute inset-0 pointer-events-none lg:hidden" style={{ background: VOILE_MOBILE }} />

            {/* ===== TEXTE ET SÉLECTEUR ===== */}
            <div data-showcase-content className="absolute inset-0 flex flex-col justify-end">
                {/* Deux colonnes en flex et non en grille : le sélecteur prend
                    la largeur de ses vignettes, le texte cède le reste. Une
                    grille figée à 7/5 laissait cinq vignettes déborder sur le
                    titre dès 1440 px. */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16 px-6 md:px-16 pb-10 md:pb-12">
                    <div className="flex-1 min-w-0 max-w-[60rem]">
                        <div className="overflow-hidden mb-6">
                            <span
                                data-showcase-kicker
                                className="inline-block font-body-strong text-[11px] uppercase tracking-[0.1em]"
                                style={{ color: OR }}
                            >
                                Itinéraire signature
                            </span>
                        </div>

                        {/* Un masque par mot : le nom monte mot après mot. Les
                            marges négatives rendent au masque la place des
                            accents et des jambages que l'interligne 0.86 rogne. */}
                        <h1
                            className="font-title leading-[0.86] tracking-[-0.03em]"
                            style={{ color: ENCRE, fontSize: "clamp(3rem, 7.4vw, 9.5rem)" }}
                        >
                            {mots.map((mot, i) => (
                                <span key={i}>
                                    <span className="inline-block overflow-hidden align-bottom pt-[0.14em] pb-[0.16em] -mt-[0.14em] -mb-[0.16em]">
                                        <span data-showcase-word className="inline-block">{mot}</span>
                                    </span>
                                    {i < mots.length - 1 && " "}
                                </span>
                            ))}
                        </h1>

                        {circuit.notes && (
                            <p
                                data-showcase-fade
                                className="mt-8 max-w-xl font-body-light text-[17px] leading-[1.7] line-clamp-3 [@media(max-height:800px)]:line-clamp-2"
                                style={{ color: ENCRE_2 }}
                            >
                                {circuit.notes}
                            </p>
                        )}

                        {/* Les détails sur un filet franc, séparés par du vide. */}
                        <div
                            data-showcase-fade
                            className="mt-10 pt-8 flex flex-wrap gap-x-14 gap-y-6"
                            style={{ borderTop: `1px solid ${FILET}` }}
                        >
                            {note != null && (
                                <Mention legende="Appréciation">
                                    <span className="flex items-center gap-3">
                                        <span className="tabular-nums">
                                            {note.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        </span>
                                        <Etoiles note={note} />
                                    </span>
                                </Mention>
                            )}
                            {jours > 0 && <Mention legende="Durée">{jours} jour{jours > 1 ? "s" : ""}</Mention>}
                            {etapes > 0 && <Mention legende="Étapes">{etapes} halte{etapes > 1 ? "s" : ""}</Mention>}
                            {route && <Mention legende="Tracé">{route.depart} → {route.arrivee}</Mention>}
                        </div>

                        {/* « Découvrir l'itinéraire » remonte ici : la barre
                            basse appartient désormais au sélecteur. */}
                        <button
                            data-showcase-fade
                            type="button"
                            onClick={onDecouvrir}
                            className="group mt-9 flex items-center gap-4 font-body-strong text-[11px] uppercase tracking-[0.1em] cursor-pointer"
                            style={{ color: ENCRE_2 }}
                        >
                            Découvrir l&rsquo;itinéraire
                            <ArrowDown size={14} strokeWidth={1.5} className="transition-transform duration-500 ease-out group-hover:translate-y-1" />
                        </button>
                    </div>
                </div>

                {/* ===== SOUS LE FILET =====
                    Les vignettes à gauche, les commandes à droite. C'est la
                    demande, et elle tombe juste : le sélecteur est ce qu'on
                    manipule, il se pose donc là où la main va — sous le titre,
                    séparé de lui par le filet, et non collé au nom du circuit. */}
                {plusieurs && (
                    <div
                        data-showcase-fade
                        className="flex items-end justify-between gap-10 px-6 md:px-16 py-6"
                        style={{ borderTop: `1px solid ${FILET}` }}
                    >
                        {/* ── À GAUCHE : la bande de vignettes ──
                            Trois colonnes au plus, et elles se suivent : la
                            bande défile au lieu de s'allonger. `scrollbar-none`
                            masque la barre — on fait défiler par les flèches et
                            par le clavier, pas en tirant un rail. */}
                        <ul
                            ref={pisteRef}
                            role="group"
                            aria-label="Choisir un visuel"
                            onKeyDown={surTouche}
                            className="cx-hero__piste scrollbar-none"
                            style={{ "--vignettes": VIGNETTES_VISIBLES }}
                        >
                            {medias.map((media, i) => (
                                <li key={`${media.type}-${media.src}`} data-showcase-thumb>
                                    <Vignette
                                        media={media}
                                        position={i + 1}
                                        total={medias.length}
                                        actif={i === index}
                                        onClick={() => aller(i)}
                                    />
                                </li>
                            ))}
                        </ul>

                        {/* ── À DROITE : la légende, le compte, les flèches ── */}
                        <div className="flex items-center gap-8 min-w-0 pb-1">
                            {actif && (
                                <>
                                    {/* Annoncé seulement à l'arrêt : un défilement
                                        automatique qui parle toutes les sept
                                        secondes couvrirait tout le reste pour un
                                        lecteur d'écran. */}
                                    <span className="hidden xl:block overflow-hidden min-w-0" aria-live={anime ? "off" : "polite"}>
                                        <span key={index} data-showcase-caption className="block truncate font-body text-[12px]" style={{ color: ENCRE_2 }}>
                                            <span style={{ color: ENCRE_3 }}>{actif.legende}</span>
                                            &nbsp;&nbsp;—&nbsp;&nbsp;{actif.titre}
                                        </span>
                                    </span>
                                    <span className="shrink-0 font-body-strong text-[11px] tabular-nums tracking-[0.1em]" style={{ color: ENCRE }}>
                                        {compte(index + 1)}
                                        <span style={{ color: ENCRE_3 }}> / {compte(medias.length)}</span>
                                    </span>
                                </>
                            )}

                            <div className="flex items-center gap-6 shrink-0">
                                <Fleche label="Visuel précédent" onClick={precedent}>
                                    <ArrowLeft size={20} strokeWidth={1.25} />
                                </Fleche>
                                <Fleche
                                    label={enPause ? "Reprendre le défilement" : "Mettre le défilement en pause"}
                                    onClick={basculerPause}
                                >
                                    {enPause
                                        ? <Play size={15} strokeWidth={1.25} fill="currentColor" />
                                        : <Pause size={15} strokeWidth={1.25} fill="currentColor" />}
                                </Fleche>
                                <Fleche label="Visuel suivant" onClick={suivant}>
                                    <ArrowRight size={20} strokeWidth={1.25} />
                                </Fleche>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Une vignette du sélecteur : l'image, puis son numéro sur un filet qui se
// remplit pendant qu'elle est à l'écran — la même barre dit « où j'en suis »
// et « combien de temps il reste ».
function Vignette({ media, position, total, actif, onClick }) {
    const apercu = media.type === "video" ? media.poster : media.src;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={actif}
            aria-label={`${media.type === "video" ? "Film" : "Visuel"} ${position} sur ${total} — ${media.titre ?? ""}`}
            className="group block text-left cursor-pointer"
        >
            <span
                className="relative block overflow-hidden w-[92px] h-[58px] md:w-[104px] md:h-[64px] 2xl:w-[120px] 2xl:h-[74px]"
                style={{
                    backgroundColor: "var(--bg-dark-2)",
                    outline: `1px solid ${actif ? ENCRE_LITTERALE : "transparent"}`,
                    outlineOffset: "3px",
                }}
            >
                {apercu && (
                    <img
                        src={apercu}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className={`absolute inset-0 w-full h-full object-cover transition-[opacity,scale] duration-700 ease-out group-hover:scale-[1.06] ${actif ? "opacity-100" : "opacity-50 group-hover:opacity-90"}`}
                    />
                )}
                {media.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        {/* Un cercle, et c'est une forme : le signe lecture. */}
                        <span
                            className="flex items-center justify-center w-7 h-7 rounded-full"
                            style={{ backgroundColor: "rgba(37,26,18,0.55)", border: `1px solid ${FILET_FORT}` }}
                        >
                            <Play size={10} fill={ENCRE_LITTERALE} stroke={ENCRE_LITTERALE} />
                        </span>
                    </span>
                )}
            </span>

            <span className="mt-3 flex items-center gap-3">
                <span className="font-body-strong text-[10px] tabular-nums tracking-[0.1em]" style={{ color: actif ? ENCRE : ENCRE_3 }}>
                    {compte(position)}
                </span>
                <span className="relative flex-1 h-px overflow-hidden" style={{ backgroundColor: FILET }}>
                    {/* Aucun transform posé ici : le hook tient seul l'échelle,
                        un style React le lui reprendrait au prochain rendu. */}
                    <span data-showcase-progress className="absolute inset-0" style={{ backgroundColor: ENCRE }} />
                </span>
            </span>
        </button>
    );
}

/**
 * L'icone, et rien d'autre.
 *
 * Elle avait un cadre d'un pixel et un fond au survol. Demande explicite du
 * client : « pas de bg ni de quoi que ce soit, l'icone fleche, pas de div ».
 *
 * Il reste un <button> — c'est ce qui rend la commande cliquable au clavier et
 * nommable pour un lecteur d'ecran ; un <span> cliquable ne l'est ni l'un ni
 * l'autre. Mais il ne PEINT plus rien : ni bordure, ni fond, ni rayon. Le seul
 * retour au survol est la fleche qui avance de 3 px dans son sens, et l'encre
 * qui passe au blanc franc.
 *
 * La zone de clic reste confortable grace au padding negatif en marge : on
 * touche 44 px, on ne voit que l'icone.
 */
function Fleche({ label, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="cx-hero__fleche"
        >
            {children}
        </button>
    );
}

// La valeur en grand, la légende en petites capitales dessous.
function Mention({ legende, children }) {
    return (
        <div className="flex flex-col gap-3">
            <span className="font-title leading-none tracking-[-0.015em]" style={{ color: ENCRE, fontSize: "clamp(1.25rem, 1.7vw, 1.65rem)" }}>
                {children}
            </span>
            <span className="font-body-strong text-[10px] uppercase tracking-[0.1em]" style={{ color: ENCRE_3 }}>
                {legende}
            </span>
        </div>
    );
}

// On ne dessine que les étoiles acquises : cinq gabarits vides ne disent rien.
function Etoiles({ note }) {
    const pleines = Math.round(note);
    return (
        <span role="img" aria-label={`${note} sur 5`} className="flex items-center gap-1">
            {Array.from({ length: pleines }, (_, i) => (
                <Star key={i} size={13} fill={OR_LITTERAL} stroke={OR_LITTERAL} strokeWidth={1} />
            ))}
        </span>
    );
}
