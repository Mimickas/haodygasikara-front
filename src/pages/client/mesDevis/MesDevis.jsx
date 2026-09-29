import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaChevronDown } from "react-icons/fa6";
import {
    accepterDevisApi, annulerDemandeDevisApi, findMesDevisApi, refuserDevisApi, telechargerPdfMonDevisApi,
} from "../../../api/client/devisApi";
import { enregistrerFichier, relireErreurBlob } from "../../../utils/telecharger";
import { useAuth } from "../../../hooks/useAuth";
import { useRevelation } from "../../../hooks/design/useRevelation";
import { formatDateCourte } from "../../../utils/format";
import { libelleNuits } from "../../../functions/devis/hebergements";
import { messageErreurApi } from "../../../utils/auth";
import { imageCloudinary } from "../../../utils/image";
import VoilePage from "../../../components/client/layout/VoilePage";
import { useChargementPage } from "../../../hooks/design/useChargementPage";
import {
    ETAPES_FRISE, joursAvant, libelleStatutDevis, montantDevis, tonStatutDevis,
} from "../../../constants/client/devis";

// ── Mes devis — /mes-devis ────────────────────────────────────────────────
//
// Une demande de devis est une attente. Ce qui la rend supportable, c'est de
// savoir OÙ elle en est et CE QUI VIENT ENSUITE : chaque demande porte donc
// une frise à quatre temps — envoyée, à l'étude, devis reçu, accepté — datée
// à chaque étape franchie, et les étapes à venir restent visibles en creux.
//
// Quand l'agence a chiffré, la demande passe devant et le montant s'affiche
// en grand, avec le temps qu'il reste pour répondre. Accepter n'encaisse rien :
// c'est l'accord qui déclenche l'appel du conseiller.
//
// Pas de ProtectedRoute : la page se charge sans compte et invite à se
// connecter, comme /mon-compte.
export default function MesDevis() {
    const { isAuthenticated } = useAuth();
    const [devis, setDevis] = useState([]);
    const [etat, setEtat] = useState("chargement");

    const charger = useCallback(async () => {
        if (!isAuthenticated) { setEtat("pret"); return; }
        setEtat("chargement");
        try {
            const reponse = await findMesDevisApi();
            setDevis(reponse?.data ?? []);
            setEtat("pret");
        } catch (error) {
            console.error("Chargement des devis impossible", error);
            setEtat("erreur");
        }
    }, [isAuthenticated]);

    useEffect(() => { charger(); }, [charger]);

    // Les couvertures des circuits arrivent avec les demandes : la page les
    // attend avant de s'ouvrir.
    const { progression, pret } = useChargementPage({
        donneesPretes: etat !== "chargement",
        images: etat === "chargement"
            ? null
            : devis.map((d) => imageCloudinary(d.circuit?.couverture, 800)).filter(Boolean),
    });

    useRevelation(
        [
            { cible: ".cx-md .cx-tete > *", y: 34, stagger: 0.09 },
            { cible: ".cx-md-carte", y: 34, stagger: 0.1, depart: "top 92%" },
        ],
        etat === "pret",
        devis.length,   // ← une demande retirée refait la liste : les déclencheurs suivent
    );

    // Une réponse du serveur remplace la demande à l'écran : on n'invente
    // jamais l'état d'après, on affiche celui qu'il renvoie.
    const remplacer = (majour) => setDevis((liste) => liste.map((d) => (d.id === majour.id ? majour : d)));

    // Ce qui attend le voyageur passe devant ; le reste garde l'ordre chronologique.
    const tries = [...devis].sort((a, b) =>
        Number(b.statutAffiche === "PROPOSE") - Number(a.statutAffiche === "PROPOSE"));
    const aRepondre = devis.filter((d) => d.statutAffiche === "PROPOSE").length;

    return (
        <div className="cx-detail cx-sous-entete">
            <VoilePage progression={progression} pret={pret} />
            <section className="cx-md" data-header-text="var(--text-primary)">
                <div className="cx-tete">
                    <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">Votre carnet</span>
                    <h1 className="cx-tete__titre font-title">Vos devis</h1>
                    <p className="cx-tete__chapo font-body">
                        {!isAuthenticated
                            ? "Connectez-vous pour suivre vos demandes de devis."
                            : aRepondre > 0
                                ? `${aRepondre} devis ${aRepondre > 1 ? "attendent" : "attend"} votre réponse.`
                                : "Chaque demande, de l'envoi à la réponse de votre conseiller."}
                    </p>
                </div>

                {!isAuthenticated ? (
                    <Vide texte="Vos demandes de devis vous attendent dans votre espace voyageur."
                        lien="/login" etatLien={{ from: "/mes-devis" }} action="Se connecter" />
                ) : etat === "chargement" ? (
                    <p className="cx-md__attente cx-label cx-label--legende font-body-strong">Chargement&hellip;</p>
                ) : etat === "erreur" ? (
                    <Vide texte="Vos devis n'ont pas pu être chargés. Réessayez dans un instant." lien="/circuit" action="Voir les circuits" />
                ) : devis.length === 0 ? (
                    <Vide texte="Aucune demande pour l'instant. Ouvrez un itinéraire et demandez son devis : la réponse arrive sous 48 heures."
                        lien="/circuit" action="Parcourir les circuits" />
                ) : (
                    <ul className="cx-md__liste">
                        {tries.map((d) => <CarteDevis key={d.id} devis={d} onMaj={remplacer} />)}
                    </ul>
                )}
            </section>
        </div>
    );
}

function CarteDevis({ devis: d, onMaj }) {
    const [ouvert, setOuvert] = useState(d.statutAffiche === "PROPOSE");
    const [action, setAction] = useState(null);          // null | "refuser" | "annuler"
    const [motif, setMotif] = useState("");
    const [envoi, setEnvoi] = useState({ enCours: false, erreur: null });

    const agir = async (appel) => {
        setEnvoi({ enCours: true, erreur: null });
        try {
            const reponse = await appel();
            onMaj(reponse?.data);
            setAction(null);
            setMotif("");
            setEnvoi({ enCours: false, erreur: null });
        } catch (error) {
            setEnvoi({ enCours: false, erreur: messageErreurApi(error, "L'opération n'a pas abouti. Réessayez.") });
        }
    };

    const [pdf, setPdf] = useState({ enCours: false, erreur: null });
    const telecharger = async () => {
        setPdf({ enCours: true, erreur: null });
        try {
            enregistrerFichier(await telechargerPdfMonDevisApi(d.id), `Haodygasikara-${d.reference}.pdf`);
            setPdf({ enCours: false, erreur: null });
        } catch (error) {
            setPdf({ enCours: false, erreur: messageErreurApi(await relireErreurBlob(error), "Le récapitulatif n'a pas pu être téléchargé.") });
        }
    };

    // Un voyage composé se relit dans le créateur ; un circuit de l'agence, sur sa fiche
    const lienCircuit = d.circuit?.modele ? `/circuit/${d.circuit?.id}` : `/composer/${d.circuit?.id}`;

    const statut = d.statutAffiche;
    const joursRestants = joursAvant(d.validiteJusquau);
    const enAttente = statut === "ENVOYE" || statut === "EN_COURS";

    return (
        <li className={`cx-md-carte cx-md-carte--${tonStatutDevis(statut)}`}>
            <div className="cx-md-carte__rangee">
                <div className="cx-md-carte__media">
                    {d.circuit?.couverture && <img src={imageCloudinary(d.circuit.couverture, 800)} alt="" loading="lazy" decoding="async" />}
                </div>

                <div className="cx-md-carte__titre-bloc">
                    <span className="cx-label cx-label--legende font-body-strong">
                        {d.reference} · envoyée le {formatDateCourte(d.createdAt)}
                    </span>
                    <Link to={lienCircuit} className="cx-md-carte__circuit font-title">
                        {d.circuit?.nom}
                    </Link>
                    <span className="cx-md-carte__quand font-body">
                        {d.datesAConvenir ? "Dates à convenir" : `Départ le ${formatDateCourte(d.dateDebut)}`}
                        {d.nombreVoyageurs > 0 && ` · ${d.nombreVoyageurs} voyageur${d.nombreVoyageurs > 1 ? "s" : ""}`}
                    </span>
                </div>

                <span className={`cx-md-pastille cx-md-pastille--${tonStatutDevis(statut)} font-body-strong`}>
                    {libelleStatutDevis(statut)}
                </span>
            </div>

            <Frise devis={d} />

            {/* ── Le devis de l'agence ─────────────────────────────────── */}
            {d.montantPropose != null && (statut === "PROPOSE" || statut === "ACCEPTE" || statut === "EXPIRE" || statut === "REFUSE") && (
                <div className="cx-md-offre">
                    <div>
                        <span className="cx-label cx-label--accent font-body-strong">Le devis de votre conseiller</span>
                        <p className="cx-md-offre__montant font-title">{montantDevis(d.montantPropose, d.deviseProposee)}</p>
                        <p className="cx-md-offre__validite font-body">
                            {statut === "PROPOSE"
                                ? joursRestants > 0
                                    ? `Valable encore ${joursRestants} jour${joursRestants > 1 ? "s" : ""}, jusqu'au ${formatDateCourte(d.validiteJusquau)}`
                                    : "Dernier jour pour répondre"
                                : statut === "EXPIRE"
                                    ? `Expiré le ${formatDateCourte(d.validiteJusquau)} — écrivez-nous, nous le mettrons à jour.`
                                    : `Proposé jusqu'au ${formatDateCourte(d.validiteJusquau)}`}
                        </p>
                        {d.messageAgence && <p className="cx-md-offre__mot font-body">« {d.messageAgence} »</p>}

                        {/* Le détail, poste par poste, tel que le conseiller l'a rédigé. */}
                        {d.postes?.length > 0 && (
                            <dl className="cx-md-postes">
                                {d.postes.map((p, i) => (
                                    <div key={i} className="cx-md-postes__ligne">
                                        <dt className="font-body">
                                            {p.libelle}
                                            {p.quantite > 1 && (
                                                <span className="cx-md-postes__qte"> · {p.quantite} × {montantDevis(p.prixUnitaire, d.deviseProposee)}</span>
                                            )}
                                        </dt>
                                        <dd className="font-body-strong">{montantDevis(p.sousTotal, d.deviseProposee)}</dd>
                                    </div>
                                ))}
                                <div className="cx-md-postes__ligne cx-md-postes__ligne--total">
                                    <dt className="font-body-strong">Total</dt>
                                    <dd className="font-body-strong">{montantDevis(d.montantPropose, d.deviseProposee)}</dd>
                                </div>
                            </dl>
                        )}
                    </div>

                    {statut === "PROPOSE" && action === null && (
                        <div className="cx-md-offre__actions">
                            <button type="button" className="cx-md-bouton cx-md-bouton--plein font-body-strong"
                                disabled={envoi.enCours} onClick={() => agir(() => accepterDevisApi(d.id))}>
                                {envoi.enCours ? "Envoi…" : "Accepter le devis"}
                            </button>
                            <button type="button" className="cx-md-bouton font-body-strong"
                                disabled={envoi.enCours} onClick={() => setAction("refuser")}>
                                Refuser
                            </button>
                            <span className="cx-md-offre__note font-body">
                                Aucun paiement en ligne : accepter, c'est demander à votre conseiller de vous appeler pour finaliser.
                            </span>
                        </div>
                    )}

                    {statut === "ACCEPTE" && (
                        <p className="cx-md-offre__suite font-body">
                            Merci ! Votre conseiller vous appelle très vite pour finaliser votre voyage.
                        </p>
                    )}
                </div>
            )}

            {/* ── Refuser, retirer : on demande pourquoi, sans l'exiger ── */}
            {action && (
                <div className="cx-md-motif">
                    <label htmlFor={`motif-${d.id}`} className="cx-label cx-label--legende font-body-strong">
                        {action === "refuser" ? "Ce qui ne vous convient pas" : "Pourquoi retirer la demande"}
                        <span className="cx-dv-champ__option"> — facultatif</span>
                    </label>
                    <textarea id={`motif-${d.id}`} rows={3} maxLength={1000} value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        placeholder={action === "refuser" ? "Le budget, les dates, une étape…" : "Projet reporté, autre destination…"}
                        className="field-line cx-dv-champ__saisie cx-dv-champ__texte font-body" />
                    <div className="cx-md-motif__actions">
                        <button type="button" className="cx-md-bouton cx-md-bouton--plein font-body-strong" disabled={envoi.enCours}
                            onClick={() => agir(() => action === "refuser"
                                ? refuserDevisApi(d.id, motif.trim() || null)
                                : annulerDemandeDevisApi(d.id, motif.trim() || null))}>
                            {envoi.enCours ? "Envoi…" : action === "refuser" ? "Confirmer le refus" : "Retirer la demande"}
                        </button>
                        <button type="button" className="cx-md-bouton font-body-strong" disabled={envoi.enCours}
                            onClick={() => { setAction(null); setMotif(""); }}>
                            Garder
                        </button>
                    </div>
                </div>
            )}

            {envoi.erreur && <p className="cx-dv-recap__erreur font-body" role="alert">{envoi.erreur}</p>}

            {/* ── Le détail, replié par défaut ─────────────────────────── */}
            <button type="button" className="cx-md-carte__bascule font-body-strong" aria-expanded={ouvert}
                onClick={() => setOuvert((o) => !o)}>
                Détail de la demande
                <FaChevronDown size={10} className={`cx-md-carte__chevron${ouvert ? " cx-md-carte__chevron--ouvert" : ""}`} />
            </button>

            <div className={`cx-md-carte__corps${ouvert ? " cx-md-carte__corps--ouvert" : ""}`}>
                <div>
                    <div className="cx-md-detail">
                        <dl className="cx-dv-recap__lignes">
                            <div className="cx-dv-recap__ligne">
                                <dt className="font-body">Départ</dt>
                                <dd className="font-body-strong">
                                    {d.datesAConvenir ? "À convenir" : formatDateCourte(d.dateDebut)}
                                </dd>
                            </div>
                            <div className="cx-dv-recap__ligne">
                                <dt className="font-body">Voyageurs</dt>
                                <dd className="font-body-strong">{d.nombreVoyageurs ?? "—"}</dd>
                            </div>
                        </dl>
                        {d.hebergements?.length > 0 && (
                            <div>
                                <span className="cx-label cx-label--legende font-body-strong">Vos hébergements</span>
                                <dl className="cx-dv-recap__lignes">
                                    {d.hebergements.map((h) => (
                                        <div key={h.premierJour} className="cx-dv-recap__ligne">
                                            <dt className="font-body">{h.etape} · {libelleNuits(h)}</dt>
                                            <dd className="font-body-strong">{h.hotel ?? "Au choix du conseiller"}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                        {d.visites?.length > 0 && (
                            <div>
                                <span className="cx-label cx-label--legende font-body-strong">Vos visites</span>
                                <dl className="cx-dv-recap__lignes">
                                    {d.visites.map((v) => (
                                        <div key={`${v.premierJour}-${v.poiId}`} className="cx-dv-recap__ligne">
                                            <dt className="font-body">{v.etape} · {v.nom}</dt>
                                            {/* Comprise ou en option : le voyageur doit savoir ce qui est
                                                déjà dans le circuit et ce qu'il a ajouté lui-même. */}
                                            <dd className="font-body-strong">{v.inclus ? "Comprise" : "En option"}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                        {d.message && (
                            <div>
                                <span className="cx-label cx-label--legende font-body-strong">Votre message</span>
                                <p className="cx-md-detail__message font-body">{d.message}</p>
                            </div>
                        )}
                        {d.circuit?.etapes?.length > 0 && (
                            <div>
                                <span className="cx-label cx-label--legende font-body-strong">Votre itinéraire</span>
                                <dl className="cx-dv-recap__lignes">
                                    {d.circuit.etapes.map((e) => (
                                        <div key={e.position} className="cx-dv-recap__ligne">
                                            <dt className="font-body">Jours {e.premierJour} à {e.dernierJour}</dt>
                                            <dd className="font-body-strong">
                                                {e.destination} · {d.circuit.modele
                                                    ? `${e.duree} j`
                                                    : `${e.duree} nuit${e.duree > 1 ? "s" : ""}`}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                        <div className="cx-md-detail__actions">
                            <button type="button" className="cx-md-lien font-body-strong" onClick={telecharger} disabled={pdf.enCours}>
                                {pdf.enCours ? "Préparation du PDF…" : "Télécharger le récapitulatif (PDF)"}
                            </button>
                            {enAttente && action === null && (
                                <button type="button" className="cx-md-lien font-body-strong" onClick={() => setAction("annuler")}>
                                    Retirer ma demande
                                </button>
                            )}
                        </div>
                        {pdf.erreur && <p className="cx-dv-recap__erreur font-body" role="alert">{pdf.erreur}</p>}
                    </div>
                </div>
            </div>
        </li>
    );
}

// La frise : les quatre temps d'une demande qui aboutit. Une demande close
// autrement (refusée, déclinée, retirée, expirée) s'arrête là où elle est, et
// son dernier point dit pourquoi.
function Frise({ devis: d }) {
    const dateDe = (statut) => d.historique.filter((e) => e.statut === statut).at(-1)?.date ?? null;
    const statut = d.statutAffiche;
    const clos = ["REFUSE", "DECLINE", "ANNULE", "EXPIRE"].includes(statut);
    const rang = { ENVOYE: 0, EN_COURS: 1, PROPOSE: 2, ACCEPTE: 3, REFUSE: 2, EXPIRE: 2 };
    const atteint = rang[statut] ?? (d.historique.some((e) => e.statut === "EN_COURS") ? 1 : 0);

    const etapes = clos
        ? [...ETAPES_FRISE.slice(0, atteint + 1).filter((e) => e.statut !== statut),
            { statut, libelle: libelleStatutDevis(statut), fin: true }]
        : ETAPES_FRISE;

    return (
        <ol className="cx-md-frise" aria-label="Avancement de la demande">
            {etapes.map((e, i) => {
                const franchie = clos ? true : i <= atteint;
                const date = e.statut === "EXPIRE" ? d.validiteJusquau : dateDe(e.statut);
                return (
                    <li key={e.statut}
                        className={`cx-md-frise__etape${franchie ? " cx-md-frise__etape--franchie" : ""}${e.fin ? " cx-md-frise__etape--fin" : ""}${!clos && i === atteint ? " cx-md-frise__etape--courante" : ""}`}>
                        <span className="cx-md-frise__point" />
                        <span className="cx-md-frise__libelle font-body-strong">{e.libelle}</span>
                        <span className="cx-md-frise__date font-body">{franchie && date ? formatDateCourte(date) : " "}</span>
                    </li>
                );
            })}
        </ol>
    );
}

function Vide({ texte, lien, etatLien, action }) {
    return (
        <div className="cx-md__vide">
            <p className="cx-md__vide-texte font-body">{texte}</p>
            <Link to={lien} state={etatLien} className="cx-dv-recap__envoyer cx-md__vide-action font-body-strong">
                {action} <FaArrowRight size={11} />
            </Link>
        </div>
    );
}
