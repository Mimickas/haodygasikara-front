import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { findMesReservationsApi } from "../../../api/client/cricuitApi";
import { formatDate, formatDateCourte, formatPrice } from "../../../utils/format";
import { useAuth } from "../../../hooks/useAuth";
import { useRevelation } from "../../../hooks/design/useRevelation";
import Mention from "../circuitDetail/components/shared/Mention";

// ── Mes réservations ──────────────────────────────────────────────────────
// La liste du voyageur, dans le vocabulaire de la fiche circuit : filets d'un
// pixel, angles vifs, Abhaya pour ce qui compte, petites capitales à 0,1em
// pour le reste. Une page de compte n'est pas un autre site — c'est la même
// feuille, vue depuis chez soi.
//
// Une réservation se lit comme une halte d'itinéraire : une ligne pleine
// largeur, un filet franc, et le détail qui se déplie dessous. Le geste est
// déjà connu du visiteur, il ne l'apprend pas une seconde fois.
export default function MesReservations() {
    const { isAuthenticated } = useAuth();

    const [reservations, setReservations] = useState([]);
    const [etat, setEtat] = useState("chargement");   // chargement | pret | erreur
    const [ouverte, setOuverte] = useState(null);

    const charger = useCallback(async () => {
        if (!isAuthenticated) {
            setEtat("pret");
            return;
        }
        setEtat("chargement");
        try {
            const reponse = await findMesReservationsApi();
            setReservations(reponse?.data ?? []);
            setEtat("pret");
        } catch (error) {
            console.error("Chargement des réservations impossible", error);
            setEtat("erreur");
        }
    }, [isAuthenticated]);

    useEffect(() => { charger(); }, [charger]);

    // L'en-tête se pose, puis les réservations montent une à une. Le hook ne
    // touche à aucun dessin : opacité et transform, retirés une fois joués.
    useRevelation(
        [
            { cible: ".cx-mesresa .cx-tete > *", y: 34, stagger: 0.09 },
            { cible: ".cx-resaligne", y: 36, stagger: 0.09, depart: "top 92%" },
            { cible: ".cx-mesresa__vide", y: 28 },
        ],
        etat === "pret"
    );

    const basculer = (id) => setOuverte((actuelle) => (actuelle === id ? null : id));

    return (
        <div className="cx-detail cx-sous-entete">
            <section className="cx-mesresa" data-header-text="var(--text-primary)">

                <div className="cx-tete cx-tete--seule">
                    <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">
                        Espace voyageur
                    </span>
                    <h1 className="cx-tete__titre font-title flex items-start gap-4">
                        Vos r&eacute;servations
                        {reservations.length > 0 && (
                            <span className="cx-mesresa__compte font-body-strong tabular-nums">
                                {String(reservations.length).padStart(2, "0")}
                            </span>
                        )}
                    </h1>
                </div>

                {!isAuthenticated ? (
                    <Vide
                        texte="Connectez-vous pour retrouver vos demandes, leur état et les dates de départ que vous avez réservées."
                        lien="/login"
                        action="Se connecter"
                    />
                ) : etat === "chargement" ? (
                    <p className="cx-mesresa__vide cx-label cx-label--legende font-body-strong">
                        Chargement&hellip;
                    </p>
                ) : etat === "erreur" ? (
                    <Vide
                        texte="Vos réservations n'ont pas pu être chargées. Réessayez dans un instant."
                        lien="/circuit"
                        action="Voir les circuits"
                    />
                ) : reservations.length === 0 ? (
                    // Une page vide dit ce qu'il faut faire ensuite. « Aucune
                    // réservation » tout seul est un cul-de-sac.
                    <Vide
                        texte="Vous n'avez pas encore de réservation. Ouvrez un circuit, choisissez une date de départ, et votre demande apparaîtra ici."
                        lien="/circuit"
                        action="Découvrir les circuits"
                    />
                ) : (
                    <ol className="cx-mesresa__liste">
                        {reservations.map((r) => (
                            <LigneReservation
                                key={r.id}
                                reservation={r}
                                ouverte={ouverte === r.id}
                                onBasculer={() => basculer(r.id)}
                            />
                        ))}
                    </ol>
                )}

            </section>
        </div>
    );
}

function LigneReservation({ reservation, ouverte, onBasculer }) {
    const voyageurs = (reservation.lignes ?? [])
        .reduce((total, l) => total + (l.quantite ?? 0), 0);

    const historique = reservation.historique ?? [];

    return (
        <li className={`cx-resaligne${ouverte ? " cx-resaligne--ouverte" : ""}`}>

            {/* L'aplat de survol : il sort de la gouttière et file d'un bord
                de l'écran à l'autre, comme sur une halte d'itinéraire. */}
            <span aria-hidden className="cx-resaligne__aplat" />

            <button
                type="button"
                className="cx-resaligne__rangee"
                onClick={onBasculer}
                aria-expanded={ouverte}
            >
                {/* La photographie du circuit. C'est elle qui manquait : une
                    liste de voyages sans image est un registre. */}
                <span className="cx-resaligne__media">
                    {reservation.circuitImageUrl && (
                        <img
                            src={reservation.circuitImageUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                </span>

                <span className="cx-resaligne__titre-bloc min-w-0">
                    <span className="cx-resaligne__date font-body-strong">
                        {formatDateCourte(reservation.dateDebut)}
                    </span>
                    <span className="cx-resaligne__circuit font-body">
                        {reservation.circuitNom}
                    </span>
                    {reservation.dateFin && (
                        <span className="cx-resaligne__retour font-body-strong">
                            Retour le {formatDateCourte(reservation.dateFin)}
                        </span>
                    )}
                </span>

                <span className="min-w-0">
                    <span className="cx-resaligne__detail font-body">
                        {voyageurs} voyageur{voyageurs > 1 ? "s" : ""}
                        {reservation.total != null && (
                            <> &nbsp;·&nbsp; {formatPrice(reservation.total)} {reservation.devise}</>
                        )}
                    </span>
                    <span className={`cx-etat font-body-strong ${encreEtat(reservation.statut)}`}>
                        {reservation.statutLibelle ?? reservation.statut}
                    </span>
                </span>

                <span className="cx-resaligne__bascule font-body-strong">
                    {ouverte ? "Replier" : "Détail"}
                    <ChevronDown size={14} className="cx-resaligne__chevron" />
                </span>
            </button>

            {/* grid-template-rows de 0fr à 1fr : la seule façon d'ouvrir une
                hauteur inconnue sans aller la mesurer en JavaScript. Le geste
                est celui de l'itinéraire et des volets « ce qui est compris ». */}
            <div className="cx-resaligne__corps">
                <div>
                    <div className="cx-resaligne__dedans">

                        <div className="min-w-0">
                            <span className="cx-label cx-label--legende font-body-strong">
                                Le d&eacute;tail
                            </span>
                            <ul className="cx-resaligne__lignes" style={{ marginTop: "clamp(14px,1.6vw,20px)" }}>
                                {(reservation.lignes ?? []).map((l, i) => (
                                    <li key={i} className="cx-ligne">
                                        <span className="cx-ligne__libelle font-body">
                                            {l.quantite} &times; {l.categorie}
                                        </span>
                                        <span className="cx-ligne__poste font-body-strong">
                                            {formatPrice(l.sousTotal)} {reservation.devise}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <dl className="cx-jour__fiche">
                                <Mention
                                    legende="Total"
                                    valeur={`${formatPrice(reservation.total)} ${reservation.devise ?? ""}`}
                                />
                                <Mention
                                    legende="Demandée le"
                                    valeur={formatDateCourte(reservation.createdAt)}
                                />
                            </dl>
                        </div>

                        <div className="min-w-0">
                            <span className="cx-label cx-label--legende font-body-strong">
                                O&ugrave; en est votre demande
                            </span>

                            {/* Chaque étape porte sa date : c'est ce qui répond
                                à « quand a-t-elle été confirmée ? », la question
                                qui se pose le jour où ça coince. */}
                            <ol className="cx-etapes">
                                {historique.map((e, i) => (
                                    <li
                                        key={i}
                                        className={`cx-etape${i === historique.length - 1 ? " cx-etape--derniere" : ""}`}
                                    >
                                        <span className="cx-etape__libelle font-body">
                                            {e.libelle ?? e.statut}
                                        </span>
                                        <span className="cx-etape__quand font-body-strong">
                                            {formatDate(e.atteintLe)}
                                        </span>
                                        {e.note && (
                                            <span className="cx-etape__note font-body">{e.note}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>

                            {reservation.message && (
                                <>
                                    <span
                                        className="cx-label cx-label--legende font-body-strong block"
                                        style={{ marginTop: "clamp(24px,2.6vw,34px)" }}
                                    >
                                        Votre message
                                    </span>
                                    <p
                                        className="cx-etape__note font-body"
                                        style={{ marginTop: "12px", marginLeft: 0 }}
                                    >
                                        {reservation.message}
                                    </p>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </li>
    );
}

/**
 * L'encre de l'état.
 *
 * Elle route sur le NOM du statut, jamais sur son libellé : le libellé se
 * reformule en base, le nom ne bouge pas — c'est exactement pour ça qu'il y a
 * deux colonnes dans `statut_reservation`.
 *
 * Trois encres, pas quatre : ce qui attend est gris, ce qui appelle une action
 * est Terre, ce qui est acquis est vert. Une couleur par statut aurait fait un
 * tableau de bord d'application, pas un carnet de voyage.
 */
function encreEtat(statut) {
    switch (statut) {
        case "CONFIRMEE": return "cx-etat--action";   // les places sont là : à régler
        case "PAYEE":     return "cx-etat--acquis";
        default:          return "cx-etat--attente";  // ENVOYEE, ANNULEE
    }
}

function Vide({ texte, lien, action }) {
    return (
        <div className="cx-mesresa__vide">
            <p className="cx-mesresa__vide-texte font-body">{texte}</p>
            <Link
                to={lien}
                className="cx-devis__bouton font-body-strong"
                style={{ marginTop: "clamp(22px,2.4vw,30px)" }}
            >
                {action}
            </Link>
        </div>
    );
}
