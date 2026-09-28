import { imageCloudinary } from "../../../../../utils/image";
// ── La planche photo d'un lieu ────────────────────────────────────────────
// Un grand cadre et deux vignettes qui se partagent exactement sa hauteur.
// Angles vifs, gouttiere de 10 px, aucun rayon : la photographie se suffit.
//
// Le compte des visuels restants se pose EN LEGENDE sur la derniere vignette
// plutot qu'en faux bouton : tant qu'aucune visionneuse n'existe, autant le
// dire honnetement.
//
// `medias` arrive tout fait de mediasPoi() — couverture, film, reste.
export default function PlanchePhoto({ medias = [], legende }) {
    const [grand, ...suite] = medias;
    if (!grand) return null;

    const vignettes = suite.slice(0, 2);
    const reste = suite.length - vignettes.length;

    return (
        <div className={`cx-jour__galerie${vignettes.length ? "" : " cx-jour__galerie--seule"}`}>
            <Cadre media={grand} legende={legende} grand />

            {vignettes.length > 0 && (
                <div className={`cx-jour__colonne${vignettes.length === 1 ? " cx-jour__colonne--une" : ""}`}>
                    {vignettes.map((media, i) => (
                        <Cadre
                            key={media.cle}
                            media={media}
                            legende={legende}
                            reste={i === vignettes.length - 1 ? reste : 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Un cadre de la planche. Le fond tient la place tant que l'image n'est pas
// la, sans quoi la grille sauterait au chargement.
function Cadre({ media, legende, grand = false, reste = 0 }) {
    return (
        <figure className={`cx-jour__media${grand ? " cx-jour__media--grand" : ""}`}>
            {media.type === "video" ? (
                <video
                    src={imageCloudinary(media.src, 1200)}
                    poster={media.poster ?? undefined}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                />
            ) : (
                <img
                    src={media.src}
                    alt={legende ?? ""}
                    loading="lazy"
                    decoding="async"
                />
            )}

            {reste > 0 && (
                <figcaption className="cx-jour__reste font-body-strong">
                    +{reste} photo{reste > 1 ? "s" : ""}
                </figcaption>
            )}
        </figure>
    );
}
