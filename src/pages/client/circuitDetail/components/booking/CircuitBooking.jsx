import { Link } from "react-router-dom";
import { formatDateCourte, formatPrice } from "../../../../../utils/format";

// ── Réserver, ou faire chiffrer ───────────────────────────────────────────
// La section ferme la page : on a lu ce que le voyage est, ce qu'il comprend
// et comment il se déroule — reste à passer à l'acte.
//
// ── Deux propositions, jamais les deux à la fois ─────────────────────────
// C'est LA règle métier de l'écran, et elle sort du modèle :
//
//   * UN MODÈLE DE L'AGENCE (isTemplate) porte déjà ses départs et leurs
//     tarifs — CircuitDateTarif, CircuitTarif. Tout ce qu'il faut pour
//     engager est là : on RÉSERVE une date.
//
//   * UN CIRCUIT COMPOSÉ PAR LE VISITEUR n'a ni date ni prix. Il n'y a rien
//     à réserver, il y a un voyage à chiffrer : on DEMANDE UN DEVIS.
//
// Un modèle dont aucun départ n'est encore programmé retombe sur le devis : il
// n'a pas de quoi engager. D'où `reservable`, qui croise les deux conditions —
// et non le seul drapeau isTemplate, qui laisserait proposer une réservation
// sur une liste vide.
//
// ── Sur le titre ─────────────────────────────────────────────────────────
// Il est en Abhaya (font-title), pas en Barlow Light. Sur tout le site, le
// grand titre est en Abhaya : dix-huit fichiers, de l'accueil au panneau
// circuit. Barlow Light en GRAND titre n'existe qu'une fois — « Itinéraire » —
// et c'est une dérogation assumée, demandée pour ce bloc précis. Une
// dérogation qui se répète cesse d'être une dérogation.
//
// ── Sur les marges ───────────────────────────────────────────────────────
// La section ne règle QUE son padding-haut (.cx-booking) : chaque section
// porte sa respiration en haut, rien en bas, et .cx-detail ferme une seule
// fois. Sans cette règle, deux sections voisines additionnent leurs marges.
export default function CircuitBooking({ circuitId, dates = [], duree, reservable = false }) {
    return (
        <section id="departs" className="cx-booking" data-header-text="var(--text-primary)">
            <div className="">
                <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">
                    {reservable ? "Réserver" : "Sur mesure"}
                </span>

                <h2 className="cx-tete__titre font-title">
                    {reservable ? "Date et disponibilité" : "Organiser ce voyage"}
                </h2>
            </div>

            {reservable ? (
                <ol className="cx-departs">
                    {dates.map((date, i) => (
                        <Depart
                            key={date?.id ?? i}
                            circuitId={circuitId}
                            date={date}
                            dureeCircuit={duree}
                        />
                    ))}
                </ol>
            ) : (
                // La section ne disparaît pas : quelqu'un qui cherche une date
                // doit savoir où il en est. Elle change de proposition.
                <div className="cx-booking__sur-mesure">
                    <p className="cx-booking__vide font-body">
                        Ce voyage se construit à vos dates&nbsp;: dites-nous quand vous
                        partez et à combien, notre équipe locale vous adresse une
                        proposition chiffrée sous quarante-huit heures.
                    </p>

                    {/* Même attente que les autres boutons de la page : l'API
                        devis n'existe pas encore (cf. AccountPanel). */}
                    <button type="button" className="cx-devis__bouton font-body-strong">
                        Demander un devis
                    </button>
                </div>
            )}
        </section>
    );
}

function Depart({ circuitId, date, dureeCircuit }) {
    // La durée du départ peut différer de celle du programme : c'est celle du
    // départ qui engage, elle prime.
    const jours = date?.dureeJours || dureeCircuit || 0;
    const tarifs = date?.prices ?? [];

    return (
        <li className="cx-depart">
            <div className="min-w-0">
                <span className="cx-depart__date font-body-strong">
                    {formatDateCourte(date?.dateDebut)}
                </span>
                {date?.dateFin && (
                    <span className="cx-depart__retour font-body-strong">
                        Retour le {formatDateCourte(date.dateFin)}
                    </span>
                )}
            </div>

            <span className="cx-depart__duree font-body-strong tabular-nums">
                {jours > 0 && <>{jours} jour{jours > 1 ? "s" : ""}</>}
            </span>

            {tarifs.length > 0 ? (
                <div className="cx-depart__tarifs">
                    {tarifs.map((tarif, i) => (
                        <div key={tarif?.id ?? i} className="min-w-0">
                            {/* La devise vient du back : un montant dont on
                                ignore l'unité n'est pas une information. */}
                            <span className="cx-tarif__montant font-body-strong tabular-nums">
                                {formatPrice(tarif?.price)}
                                {tarif?.devise && <> {tarif.devise}</>}
                            </span>
                            <span className="cx-tarif__categorie font-body-strong">
                                {tarif?.libelleCategory ?? tarif?.codeCategory}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                // Colonne vide, le visiteur lirait « gratuit ».
                <span className="cx-depart__sans-tarif font-body-strong">
                    Tarif sur demande
                </span>
            )}

            {/* Sans tarif connu, ce départ ne s'engage pas : il se demande. On
                ne propose pas de réserver à un prix qu'on n'a pas.

                Un <Link> SEUL, pas un <button> à l'intérieur : un élément
                interactif dans un <a> est invalide, et le clavier ne sait plus
                lequel des deux il active. Le lien porte donc la classe du
                bouton.

                L'URL ne transporte que des IDENTIFIANTS. Ni prix, ni date, ni
                nom : la page d'après les relit auprès du serveur. Un montant
                qui voyage par le client est un montant qui se retouche. */}
            {tarifs.length > 0 ? (
                <Link
                    to={`/circuit/${circuitId}/reservation/${date?.id}`}
                    className="cx-depart__action font-body-strong"
                >
                    Réserver ce départ
                </Link>
            ) : (
                <button type="button" className="cx-depart__action font-body-strong">
                    Demander ce départ
                </button>
            )}
        </li>
    );
}
