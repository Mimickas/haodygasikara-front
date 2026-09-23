import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { formatDateCourte } from "../../../../utils/format";

/**
 * Le hero de la page de réservation.
 *
 * ── Pourquoi une photographie sur un formulaire ──────────────────────────
 * Pour que le voyageur VOIE ce qu'il réserve. La version précédente ouvrait
 * sur un titre noir sur fond sable : rien ne rattachait la page au voyage
 * qu'on était en train de demander, et il fallait se fier au seul nom écrit
 * en haut. Sur un écran de décision, une image vaut une confirmation.
 *
 * Il est plus court que celui d'une fiche circuit — on vient ici pour FAIRE,
 * pas pour rêver — mais assez grand pour poser le nom et la date.
 *
 * ── Le départ est écrit en grand, tout de suite ─────────────────────────
 * C'est la première chose qu'on vérifie en arrivant sur une page de
 * réservation, et la seule qu'on ne peut plus corriger ensuite sans
 * recommencer. Elle ne se cache pas dans une ligne de méta.
 */
export default function HeroReservation({ circuit, depart, retourVers }) {
    const image = couverture(circuit);

    return (
        <section className="cx-resa-hero" data-header-text="var(--text-inverse)">
            <div className="relative w-full h-full overflow-hidden bg-black">
                {image && (
                    <img
                        data-resa-media
                        src={image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: 0.75 }}
                    />
                )}

                {/* Le voile monte jusqu'aux deux tiers : le bloc de texte est
                    haut, et une photographie de plein jour laisse l'accroche
                    ocre illisible si le dégradé s'arrête à mi-hauteur. */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(16,14,11,0.92) 0%, rgba(16,14,11,0.8) 30%, rgba(16,14,11,0.5) 58%, rgba(16,14,11,0.12) 85%, rgba(16,14,11,0) 100%)",
                    }}
                />

                <div className="cx-resa-hero__contenu">
                    <Link
                        to={retourVers}
                        data-resa-item
                        className="cx-resa-hero__retour font-body-strong"
                    >
                        <FaArrowLeft className="text-[10px]" />
                        Revenir au circuit
                    </Link>

                    <span data-resa-item className="cx-resa-hero__accroche font-body-strong">
                        Demande de r&eacute;servation
                    </span>

                    <h1 data-resa-item className="cx-resa-hero__titre font-title">
                        {circuit?.nom ?? "Circuit introuvable"}
                    </h1>

                    {depart && (
                        <div data-resa-item className="cx-resa-hero__quand">
                            <div>
                                <span className="cx-resa-hero__legende font-body-strong">
                                    Vous partez le
                                </span>
                                <span className="cx-resa-hero__valeur font-body">
                                    {formatDateCourte(depart.dateDebut)}
                                </span>
                            </div>
                            {depart.dateFin && (
                                <div>
                                    <span className="cx-resa-hero__legende font-body-strong">
                                        Vous rentrez le
                                    </span>
                                    <span className="cx-resa-hero__valeur font-body">
                                        {formatDateCourte(depart.dateFin)}
                                    </span>
                                </div>
                            )}
                            {depart.dureeJours > 0 && (
                                <div>
                                    <span className="cx-resa-hero__legende font-body-strong">
                                        Dur&eacute;e
                                    </span>
                                    <span className="cx-resa-hero__valeur font-body">
                                        {depart.dureeJours} jour{depart.dureeJours > 1 ? "s" : ""}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/** L'image marquée couverture, sinon la première. Même règle que partout. */
function couverture(circuit) {
    if (!circuit) return null;
    const images = circuit.images ?? [];
    const cover = images.find((i) => i?.isCover) ?? images[0];
    return cover?.url ?? circuit.imageUrl ?? null;
}
