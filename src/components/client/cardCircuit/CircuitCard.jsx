import { FaArrowRight } from "react-icons/fa6";
import { useCardEnter } from "../../../hooks/design/useCardEnter";
import { circuitDays, circuitRoute, circuitSteps } from "../../../utils/circuit";
import { imageCloudinary, srcSetCloudinary } from "../../../utils/image";
import { Link } from "react-router-dom";

// Toutes les cartes ont exactement le même cadre : 620 px, 480 sur téléphone.

// La carte prend la moitié de la largeur au-delà de 1024 px, tout l'écran en
// dessous : c'est ce que `sizes` dit au navigateur pour qu'il choisisse la
// bonne version. Sans cette indication il suppose 100vw et prend la plus
// grande — soit exactement ce qu'on cherche à éviter.
const LARGEURS = [640, 900, 1280, 1600];
const CADRE = "(min-width: 1024px) 50vw, 100vw";

export default function CircuitCard({ circuit: c, index, delay = 0 }) {
    const cardRef = useCardEnter(delay);

    const steps = circuitSteps(c);
    const route = circuitRoute(c);
    const jours = circuitDays(c);

    return (
        <article ref={cardRef} data-card className="group">
            <Link to={`/circuit/${c.id}`} className="block" aria-label={`Découvrir le circuit ${c.nom}`}>
            <div
                data-card-media
                data-curseur="Voir"
                className="relative overflow-hidden h-[480px] sm:h-[620px]"
                style={{ backgroundColor: "var(--bg-dark)" }}
            >
                {c.imageUrl ? (
                    <img
                        data-card-img
                        src={imageCloudinary(c.imageUrl, 1280)}
                        srcSet={srcSetCloudinary(c.imageUrl, LARGEURS)}
                        sizes={CADRE}
                        alt={c.nom}
                        // La première carte est sous le héros, jamais à l'écran
                        // au chargement : aucune n'a besoin d'être chargée tôt.
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
                    />
                ) : (
                    <div data-card-img className="absolute inset-0 flex items-center justify-center">
                        <span className="font-body text-[11px] uppercase tracking-[0.1em]" style={{ color: "rgba(245,240,230,0.4)" }}>
                            Visuel à venir
                        </span>
                    </div>
                )}

                {/* Le texte vit sur l'image : c'est là que se joue le contraste */}
                <div
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ background: "linear-gradient(to top, rgba(37,26,18,0.92) 0%, rgba(37,26,18,0.22) 46%, rgba(37,26,18,0.55) 100%)" }}
                />

                <span
                    className="absolute top-6 left-6 sm:top-8 sm:left-8 font-body text-[11px] tracking-[0.1em] tabular-nums"
                    style={{ color: "rgba(245,240,230,0.75)" }}
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                {jours > 0 && (
                    <span
                        className="absolute top-6 right-6 sm:top-8 sm:right-8 font-body text-[11px] uppercase tracking-[0.1em]"
                        style={{ color: "rgba(245,240,230,0.75)" }}
                    >
                        {jours} jours
                    </span>
                )}

                <div data-card-text className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                    <h3
                        className="font-title leading-[0.95] transition-transform duration-700 ease-out group-hover:-translate-y-1"
                        style={{ color: "var(--text-inverse)", fontSize: "clamp(2rem, 2.7vw, 3.25rem)" }}
                    >
                        {c.nom}
                    </h3>

                    <div className="mt-5 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 font-body text-[11px] uppercase tracking-[0.1em] min-w-0" style={{ color: "rgba(245,240,230,0.7)" }}>
                            {route && <span className="truncate">{route.depart} → {route.arrivee}</span>}
                            {route && steps.length > 0 && <span>·</span>}
                            {steps.length > 0 && <span className="shrink-0">{steps.length} étapes</span>}
                        </div>

                        <span
                            className="flex items-center gap-2 shrink-0 font-body-strong text-[11px] uppercase tracking-[0.1em] opacity-70 transition-opacity duration-500 ease-out group-hover:opacity-100"
                            style={{ color: "var(--brand-ocre)" }}
                        >
                            Découvrir
                            <FaArrowRight className="text-[10px]" />
                        </span>
                    </div>
                </div>
            </div>
            </Link>
        </article>
    );
}
