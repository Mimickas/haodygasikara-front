import { FaCheck } from "react-icons/fa6";
import { libelleNuits } from "../../../../functions/devis/hebergements";

import { imageCloudinary } from "../../../../utils/image";
// L'étape « Vos hébergements » : pour chaque séjour, les hébergements que
// l'agence propose et qui sont encore libres. Celui qu'elle conseille est
// déjà choisi — le voyageur qui lui fait confiance n'a rien à faire.
//
// Des cartes côte à côte et non une liste : on choisit un hôtel en le voyant.
// Aucun prix : le conseiller chiffre le devis une fois les choix faits.

export default function ChoixHebergements({ sejours, choix, onChoisir }) {
    return (
        <div className="cx-dv-sejours">
            {sejours.map((s) => (
                <section key={s.premierJour} className="cx-dv-sejour" aria-label={`${s.etape}, ${libelleNuits(s)}`}>
                    <p className="cx-dv-sejour__entete">
                        <span className="cx-dv-sejour__etape font-title">{s.etape}</span>
                        <span className="cx-dv-sejour__nuits font-body-strong">{libelleNuits(s)}</span>
                    </p>

                    {s.hotels.length === 0 ? (
                        <p className="cx-dv-sejour__vide font-body">
                            Votre conseiller vous proposera un hébergement pour ces nuits.
                        </p>
                    ) : (
                        <div className="cx-dv-hotels" role="radiogroup" aria-label={`Hébergement à ${s.etape}`}>
                            {s.hotels.map((h) => {
                                const pris = choix[s.premierJour] === h.id;
                                return (
                                    <button key={h.id} type="button" role="radio" aria-checked={pris}
                                        className={`cx-dv-hotel${pris ? " cx-dv-hotel--choisi" : ""}`}
                                        onClick={() => onChoisir(s.premierJour, h.id)}>
                                        <span className="cx-dv-hotel__media">
                                            {h.image
                                                ? <img src={imageCloudinary(h.image, 600)} alt="" loading="lazy" decoding="async" />
                                                : <span className="cx-dv-hotel__initiale font-title">{h.nom.charAt(0)}</span>}
                                            {h.id === s.conseille && (
                                                <span className="cx-dv-hotel__conseil font-body-strong">Conseillé</span>
                                            )}
                                            <span className="cx-dv-hotel__coche" aria-hidden="true"><FaCheck size={10} /></span>
                                        </span>
                                        <span className="cx-dv-hotel__corps">
                                            <span className="cx-dv-hotel__nom font-title">{h.nom}</span>
                                            {h.etoiles > 0 && (
                                                <span className="cx-dv-hotel__etoiles" aria-label={`${h.etoiles} étoiles`}>
                                                    {"★".repeat(h.etoiles)}
                                                </span>
                                            )}
                                            {h.description && <span className="cx-dv-hotel__texte font-body">{h.description}</span>}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}
