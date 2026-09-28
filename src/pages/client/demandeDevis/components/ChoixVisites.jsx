import { FaCheck, FaLock } from "react-icons/fa6";
import { libelleJours, visitePrise } from "../../../../functions/devis/visites";

import { imageCloudinary } from "../../../../utils/image";
// L'étape « Vos visites » : pour chaque étape du voyage, ce qu'on y fait.
//
// Deux natures, et il fallait que ça se voie sans rien lire : ce que l'agence
// COMPREND dans le circuit est acquis — carte sobre, cadenas, aucun geste
// possible — et ce qu'elle PROPOSE en plus se coche. Un voyage composé n'a
// rien de prévu : tout le catalogue du lieu y est en options.
//
// Mêmes cartes que les hébergements, mais en cases à cocher : on prend
// plusieurs visites pour une même étape, là où on ne dort qu'à un endroit.
// Aucun prix : le conseiller chiffre les options une fois les choix faits.

export default function ChoixVisites({ etapes, choix, onBasculer }) {
    return (
        <div className="cx-dv-sejours">
            {etapes.map((e) => (
                <section key={e.premierJour} className="cx-dv-sejour" aria-label={`${e.etape}, ${libelleJours(e)}`}>
                    <p className="cx-dv-sejour__entete">
                        <span className="cx-dv-sejour__etape font-title">{e.etape}</span>
                        <span className="cx-dv-sejour__nuits font-body-strong">{libelleJours(e)}</span>
                    </p>

                    {e.incluses.length > 0 && (
                        <>
                            <p className="cx-dv-visites__titre cx-label cx-label--legende font-body-strong">
                                Comprises dans le circuit
                            </p>
                            <div className="cx-dv-visites">
                                {e.incluses.map((v) => (
                                    <article key={v.id} className="cx-dv-visite cx-dv-visite--acquise">
                                        <Media visite={v} acquise />
                                        <Corps visite={v} />
                                    </article>
                                ))}
                            </div>
                        </>
                    )}

                    {e.options.length > 0 ? (
                        <>
                            <p className="cx-dv-visites__titre cx-label cx-label--legende font-body-strong">
                                {e.incluses.length > 0 ? "À ajouter si vous le souhaitez" : "Ce que vous pouvez y faire"}
                            </p>
                            <div className="cx-dv-visites" role="group" aria-label={`Visites à ${e.etape}`}>
                                {e.options.map((v) => {
                                    const prise = visitePrise(choix, e.premierJour, v.id);
                                    return (
                                        <button key={v.id} type="button" role="checkbox" aria-checked={prise}
                                            className={`cx-dv-visite${prise ? " cx-dv-visite--prise" : ""}`}
                                            onClick={() => onBasculer(e.premierJour, v.id)}>
                                            <Media visite={v} />
                                            <Corps visite={v} />
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : e.incluses.length === 0 && (
                        <p className="cx-dv-sejour__vide font-body">
                            Votre conseiller vous proposera des visites pour cette étape.
                        </p>
                    )}
                </section>
            ))}
        </div>
    );
}

function Media({ visite: v, acquise = false }) {
    return (
        <span className="cx-dv-visite__media">
            {v.image
                ? <img src={imageCloudinary(v.image, 600)} alt="" loading="lazy" decoding="async" />
                : <span className="cx-dv-visite__initiale font-title">{v.nom.charAt(0)}</span>}
            <span className={`cx-dv-visite__coche${acquise ? " cx-dv-visite__coche--acquise" : ""}`} aria-hidden="true">
                {acquise ? <FaLock size={9} /> : <FaCheck size={10} />}
            </span>
        </span>
    );
}

function Corps({ visite: v }) {
    return (
        <span className="cx-dv-visite__corps">
            <span className="cx-dv-visite__nom font-title">{v.nom}</span>
            {v.categorie && <span className="cx-dv-visite__categorie font-body-strong">{v.categorie}</span>}
            {(v.note || v.description) && (
                <span className="cx-dv-visite__texte font-body">{v.note ?? v.description}</span>
            )}
        </span>
    );
}
