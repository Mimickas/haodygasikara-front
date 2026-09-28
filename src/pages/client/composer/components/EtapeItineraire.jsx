import { useState } from "react";
import { FaMinus, FaPlus, FaXmark } from "react-icons/fa6";
import { NUITS_MAX_ETAPE, NUITS_MIN_ETAPE } from "../../../../constants/client/composer";

// Une étape, au format des « trois gestes » de l'accueil : un grand numéro
// pâle, le nom en serif, une ligne en capitales. Le numéro est la poignée
// (glisser, ou flèches du clavier) ; les nuits se règlent à droite ; retirer
// et « + Note » n'apparaissent qu'au survol — au doigt, toujours.

const court = (date) => date?.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const deux = (n) => String(n).padStart(2, "0");

export default function EtapeItineraire({
    etape, index, plage, poigneeProps, saisie, enEvidence,
    onNuits, onRetirer, onNotes, onSurvol, verrouille,
}) {
    const [noteOuverte, setNoteOuverte] = useState(Boolean(etape.notes));
    const d = etape.destination;

    return (
        <li
            data-reorder-row
            data-cp-etape
            data-cle={etape.cle}
            className={`cx-cp-etape${saisie ? " cx-cp-etape--saisie" : ""}${enEvidence ? " cx-cp-etape--evidence" : ""}`}
            onMouseEnter={() => onSurvol(index)}
            onMouseLeave={() => onSurvol(null)}
        >
            <div className="cx-cp-etape__rangee">
                <button type="button" data-cp-numero className="cx-cp-etape__numero"
                    aria-label={`Déplacer ${d.nom} (flèches haut et bas)`} {...poigneeProps}>
                    {deux(index + 1)}
                </button>

                <div className="cx-cp-etape__texte">
                    <span className="cx-cp-etape__nom">{d.nom}</span>
                    <span className="cx-cp-etape__quand">
                        <span>J{plage.jourDebut} → J{plage.jourFin}</span>
                        {plage.dateDebut && <span>{court(plage.dateDebut)} – {court(plage.dateFin)}</span>}
                        {!noteOuverte && !verrouille && (
                            <button type="button" className="cx-cp-etape__note-lien" onClick={() => setNoteOuverte(true)}>
                                + Note
                            </button>
                        )}
                    </span>
                </div>

                <div className="cx-cp-etape__nuits" role="group" aria-label={`Nuits à ${d.nom}`}>
                    <button type="button" className="cx-cp-etape__pas" disabled={verrouille || etape.nuits <= NUITS_MIN_ETAPE}
                        onClick={() => onNuits(etape.cle, etape.nuits - 1)} aria-label="Une nuit de moins">
                        <FaMinus size={9} />
                    </button>
                    <span className="cx-cp-etape__valeur" aria-live="polite">
                        <span className="cx-cp-roule-cadre">
                            <span key={etape.nuits} className="cx-cp-roule cx-cp-etape__chiffre">{etape.nuits}</span>
                        </span>
                        <span className="cx-cp-etape__unite">nuit{etape.nuits > 1 ? "s" : ""}</span>
                    </span>
                    <button type="button" className="cx-cp-etape__pas" disabled={verrouille || etape.nuits >= NUITS_MAX_ETAPE}
                        onClick={() => onNuits(etape.cle, etape.nuits + 1)} aria-label="Une nuit de plus">
                        <FaPlus size={9} />
                    </button>
                </div>

                {verrouille ? <span /> : (
                    <button type="button" className="cx-cp-etape__retirer" onClick={() => onRetirer(etape)} aria-label={`Retirer ${d.nom}`}>
                        <FaXmark size={12} />
                    </button>
                )}
            </div>

            {noteOuverte && (
                <div className="cx-cp-etape__note">
                    <input
                        className="cx-cp-etape__note-champ"
                        readOnly={verrouille}
                        value={etape.notes}
                        onChange={(e) => onNotes(etape.cle, e.target.value)}
                        onBlur={() => { if (!etape.notes.trim()) setNoteOuverte(false); }}
                        maxLength={500}
                        placeholder="Une envie pour cette étape : lodge avec vue, sortie de nuit…"
                        autoFocus={!etape.notes}
                    />
                </div>
            )}
        </li>
    );
}
