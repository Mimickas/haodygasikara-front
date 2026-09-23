import { formatDateCourte, formatPrice } from "../../../../utils/format";

/**
 * Le récapitulatif, toujours sous les yeux.
 *
 * ── Pourquoi il existe ───────────────────────────────────────────────────
 * Consigne du client : « sans que le client perde de vue ». Dans la version
 * précédente, le total était une ligne au milieu du formulaire : dès qu'on
 * descendait saisir ses coordonnées, on ne savait plus combien de personnes
 * on avait comptées ni ce que ça faisait. Ici la colonne est collante à
 * droite, et remplacée par une barre collante en bas sur téléphone.
 *
 * ── Ce qu'il montre, et dans quel ordre ─────────────────────────────────
 * QUEL voyage (la photo et le nom), QUELLE date, COMBIEN de personnes,
 * COMBIEN ça fait. C'est l'ordre des questions qu'on se pose.
 *
 * ── Tant que personne n'est compté ──────────────────────────────────────
 * On l'écrit, au lieu d'afficher « 0 MGA » — un zéro suivi d'une devise
 * ressemble à un prix, et un prix à zéro n'a aucun sens sur un voyage.
 */
export default function RecapitulatifResa({ circuit, depart, lignes, voyageurs, total, devise }) {
    const image = couverture(circuit);

    return (
        <aside className="cx-recap">
            {image && (
                <div className="cx-recap__media">
                    <img src={image} alt="" loading="lazy" decoding="async" />
                </div>
            )}

            <h2 className="cx-recap__titre font-body-strong">{circuit?.nom}</h2>
            <span className="cx-recap__quand font-body">
                D&eacute;part le {formatDateCourte(depart?.dateDebut)}
                {depart?.dureeJours > 0 && <> &middot; {depart.dureeJours} jours</>}
            </span>

            {voyageurs === 0 ? (
                <p className="cx-recap__vide font-body">
                    Indiquez d&rsquo;abord combien de personnes voyagent&nbsp;: le prix
                    s&rsquo;affichera ici.
                </p>
            ) : (
                <>
                    <div className="cx-recap__lignes">
                        {lignes.map((l) => (
                            <span key={l.id} className="cx-recap__ligne font-body">
                                <span>
                                    <strong className="tabular-nums">{l.quantite}</strong> &times;{" "}
                                    {l.libelle}
                                </span>
                                <span className="tabular-nums">
                                    {formatPrice(l.sousTotal)} {devise}
                                </span>
                            </span>
                        ))}
                    </div>

                    <div className="cx-recap__total">
                        <span className="cx-recap__total-legende font-body-strong">
                            {voyageurs} voyageur{voyageurs > 1 ? "s" : ""} &mdash; total
                        </span>
                        {/* Le total MESURE : Barlow, et tabular pour que les
                            chiffres ne dansent pas quand le montant change. */}
                        <span className="cx-recap__total-valeur font-body-strong tabular-nums">
                            {formatPrice(total)} {devise}
                        </span>
                    </div>
                </>
            )}
        </aside>
    );
}

function couverture(circuit) {
    if (!circuit) return null;
    const images = circuit.images ?? [];
    const cover = images.find((i) => i?.isCover) ?? images[0];
    return cover?.url ?? circuit.imageUrl ?? null;
}
