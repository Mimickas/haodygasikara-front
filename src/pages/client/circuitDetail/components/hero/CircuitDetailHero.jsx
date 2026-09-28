import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { circuitMedias } from "../../../../../utils/circuit";
import { imageCloudinary } from "../../../../../utils/image";

// Le hero de la page detail : la photo de couverture plein cadre, le nom du
// circuit et le trace poses dessus.
//
// `data-header-text` previent l'entete du site qu'elle passe sur du sombre et
// doit basculer son encre — c'est le seul lien entre ce bloc et le reste de
// l'application.
//
// ── Ce qui a ete AJOUTE, et rien d'autre ─────────────────────────────────
// Le dessin d'origine est intact : meme section plein ecran, meme photo en
// `opacity-75` sur du noir, meme titre en 8xl, meme ligne de meta a droite,
// meme filet. Pas une classe changee.
//
// Ce qui s'ajoute, sous le filet :
//   * la bande des visuels du circuit, A GAUCHE — trois colonnes au plus, qui
//     defilent au-dela ;
//   * les fleches A DROITE, en icone nue : ni cadre, ni fond, ni rayon.
//
// Et la photo du haut devient une pile : changer de visuel fait un fondu au
// lieu d'un remplacement sec. C'est du mouvement, pas un changement de dessin —
// au repos, l'ecran est exactement celui d'avant.

// Trois colonnes au plus, et elles se suivent. Au-dela, la bande mangeait la
// largeur du titre ; en-deca, on ne comprend pas qu'il y en a d'autres.
const VIGNETTES_VISIBLES = 3;

export default function CircuitDetailHero({ circuit, days, depart, arrivee }) {
    // circuitMedias ouvre sur la couverture — celle que le hero montrait deja
    // seule — puis le film s'il existe, puis les visuels des etapes.
    const medias = useMemo(() => circuitMedias(circuit, 8), [circuit]);
    const [index, setIndex] = useState(0);

    // Un autre circuit, une autre pile : on repart du premier visuel.
    useEffect(() => { setIndex(0); }, [circuit?.id]);

    const plusieurs = medias.length > 1;
    const aller = (i) => setIndex((i + medias.length) % medias.length);

    // La bande ne montre que trois vignettes : celle qui devient active doit se
    // ramener d'elle-meme dans la fenetre, sinon la selection designe un visuel
    // qu'on ne voit pas. `inline: nearest` fait glisser du minimum necessaire —
    // `center` recentrerait a chaque pas et donnerait un mouvement permanent.
    const pisteRef = useRef(null);
    useEffect(() => {
        pisteRef.current?.children?.[index]?.scrollIntoView({
            behavior: "smooth", block: "nearest", inline: "nearest",
        });
    }, [index]);

    return (
        <section className="h-screen relative" data-header-text="var(--text-inverse)">
            <div className="relative w-full h-full overflow-hidden bg-black">

                {/* La pile. Chaque calque porte EXACTEMENT les classes de
                    l'image d'origine ; seule l'opacite est pilotee, et celle du
                    calque actif vaut 0.75 — la valeur de `opacity-75`. Au repos,
                    rien ne distingue cet ecran du precedent. */}
                {medias.length > 0 ? (
                    medias.map((media, i) => (
                        <div
                            key={media.cle ?? media.src}
                            data-hero-calque
                            aria-hidden={i !== index}
                            className="absolute inset-0"
                            style={{
                                opacity: i === index ? 0.75 : 0,
                                transition: "opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                        >
                            {media.type === "video" ? (
                                <video
                                    data-hero-media
                                    src={media.src}
                                    poster={media.poster ?? undefined}
                                    muted
                                    loop
                                    playsInline
                                    preload={i === 0 ? "auto" : "metadata"}
                                    autoPlay={i === index}
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            ) : (
                                <img
                                    data-hero-media
                                    src={imageCloudinary(media.src, 1920)}
                                    alt=""
                                    decoding="async"
                                    fetchPriority={i === 0 ? "high" : "low"}
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <img
                        data-hero-media
                        src={imageCloudinary(circuit?.imageUrl, 1920)}
                        alt=""
                        decoding="async"
                        className="w-full h-full object-cover absolute inset-0 opacity-75"
                    />
                )}

                {circuit && (
                    <div className="z-10 absolute inset-x-5 sm:inset-x-16 bottom-12 lg:bottom-20">

                        <div className="flex flex-col items-start gap-1 lg:flex-row lg:justify-between lg:items-end lg:gap-0 w-full">
                            <h1 data-hero-titre className="my-2 text-5xl sm:text-7xl lg:text-8xl font-title text-[var(--text-inverse)]">
                                {circuit.nom}
                            </h1>
                            <div data-hero-meta className="flex flex-wrap items-center text-sm sm:text-lg mb-4 lg:mb-6">

                                <span className="font-body-strong text-[var(--text-inverse-secondary)]">{days} jours</span>

                                <span className="font-body-strong pl-6 text-[var(--text-inverse-secondary)]">
                                    {depart} <span className="text-neutral-400 mx-1">→</span> {arrivee}
                                </span>
                            </div>
                        </div>

                        <div data-hero-filet style={{ borderTop: "1px solid var(--border)" }} />

                        {/* ── SOUS LE FILET : la bande a gauche, les fleches a droite ── */}
                        {plusieurs && (
                            <div className="cx-hero__selecteur">
                                <ul
                                    ref={pisteRef}
                                    className="cx-hero__piste scrollbar-none"
                                    style={{ "--vignettes": VIGNETTES_VISIBLES }}
                                    aria-label="Choisir un visuel"
                                >
                                    {medias.map((media, i) => (
                                        <li key={media.cle ?? media.src} data-hero-vignette>
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

                                <div className="cx-hero__fleches">
                                    <Fleche label="Visuel précédent" onClick={() => aller(index - 1)}>
                                        <ArrowLeft size={20} strokeWidth={1.25} />
                                    </Fleche>
                                    <Fleche label="Visuel suivant" onClick={() => aller(index + 1)}>
                                        <ArrowRight size={20} strokeWidth={1.25} />
                                    </Fleche>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </section>
    );
}

// Une vignette : l'image, un filet blanc quand elle est a l'ecran. Angle vif,
// aucun rayon — la forme de tout le circuit.
function Vignette({ media, position, total, actif, onClick }) {
    const apercu = media.type === "video" ? media.poster : media.src;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={actif}
            aria-label={`${media.type === "video" ? "Film" : "Visuel"} ${position} sur ${total}`}
            className={`cx-hero__vignette${actif ? " cx-hero__vignette--active" : ""}`}
        >
            {apercu && <img src={imageCloudinary(apercu, 200)} alt="" loading="lazy" decoding="async" />}
            {media.type === "video" && (
                <span className="cx-hero__film" aria-hidden>
                    <Play size={11} fill="currentColor" stroke="currentColor" />
                </span>
            )}
        </button>
    );
}

/**
 * L'icone, et rien d'autre.
 *
 * Demande explicite : « pas de bg ni de quoi que ce soit, l'icone fleche, pas
 * de div ». Le bouton ne peint donc ni bordure, ni fond, ni rayon.
 *
 * Il reste un <button> et c'est delibere : c'est lui qui rend la commande
 * cliquable au clavier et nommable pour un lecteur d'ecran — un <span>
 * cliquable n'est ni l'un ni l'autre. Mais il ne DESSINE plus rien.
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
