import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaMinus, FaPlus } from "react-icons/fa6";
import { findCircuitClientById, findHebergementsCircuitApi, findVisitesCircuitApi } from "../../../api/client/cricuitApi";
import { creerDemandeDevisApi } from "../../../api/client/devisApi";
import { choixInitiaux, hotelChoisi, versChoixHebergements } from "../../../functions/devis/hebergements";
import { basculerVisite, resumeVisites, versChoixVisites, visitesInitiales } from "../../../functions/devis/visites";
import ChoixHebergements from "./components/ChoixHebergements";
import ChoixVisites from "./components/ChoixVisites";
import { useDemandeVivante } from "../../../hooks/client/devis/useDemandeVivante";
import { actionDemandeVivante, libelleStatutDevis } from "../../../constants/client/devis";
import { useAuth } from "../../../hooks/useAuth";
import { useRevelation } from "../../../hooks/design/useRevelation";
import { formatDateCourte } from "../../../utils/format";
import { messageErreurApi } from "../../../utils/auth";

import { imageCloudinary } from "../../../utils/image";
// ── Demander un devis — /circuit/:id/devis ────────────────────────────────
//
// Les questions, dans l'ordre où un voyageur se les pose : QUAND, COMBIEN,
// OÙ DORMIR (parmi les hébergements que l'agence propose et qui sont libres),
// et CE QU'IL VEUT EN PLUS. À droite, un récapitulatif qui suit chaque geste.
// Un voyage sans nuit à l'hôtel saute la question des hébergements.
//
// AUCUN PRIX sur cette page, et c'est voulu : le chiffrage est entièrement
// manuel. Le conseiller rédige le devis poste par poste et le voyageur le
// reçoit dans « Mes devis ». Un montant affiché ici promettrait un prix que
// personne n'a encore calculé.
//
// Le brouillon survit à la connexion : un visiteur sans compte remplit tout,
// part se connecter, et retrouve son formulaire intact au retour.

const CLE_BROUILLON = (id) => `haody:devis:${id}`;

// Des envies fréquentes, en un geste. Elles s'ajoutent au message au lieu de le
// remplacer : ce sont des amorces, pas un questionnaire.
const ENVIES = [
    "Enfants dans le groupe",
    "Chambres familiales",
    "Guide anglophone",
    "Vols intérieurs à prévoir",
    "Régime alimentaire particulier",
    "Voyage de noces",
    "Rythme tranquille",
];

const lireBrouillon = (id) => {
    try {
        return JSON.parse(sessionStorage.getItem(CLE_BROUILLON(id)) ?? "null");
    } catch {
        return null;
    }
};

const ecrireBrouillon = (id, valeur) => {
    try {
        if (valeur) sessionStorage.setItem(CLE_BROUILLON(id), JSON.stringify(valeur));
        else sessionStorage.removeItem(CLE_BROUILLON(id));
    } catch { /* stockage indisponible : on perd le brouillon, rien de plus */ }
};

const demain = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
};

export default function DemandeDevis() {
    const { id } = useParams();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const [circuit, setCircuit] = useState(null);
    const [etat, setEtat] = useState("chargement");     // chargement | pret | erreur

    const brouillon = useMemo(() => lireBrouillon(id), [id]);
    const [dateLibre, setDateLibre] = useState(brouillon?.dateLibre ?? "");
    const [voyageurs, setVoyageurs] = useState(brouillon?.voyageurs ?? 2);
    const [message, setMessage] = useState(brouillon?.message ?? "");

    // Les séjours et leurs hébergements au choix ; null tant qu'ils chargent
    const [sejours, setSejours] = useState(null);
    const [choixHotels, setChoixHotels] = useState({});

    // Les étapes et leurs visites : ce qu'on fait du voyage, pas seulement où
    // l'on dort. Rien n'est coché d'office — une option se prend.
    const [visites, setVisites] = useState(null);
    const [choixVisites, setChoixVisites] = useState({});

    const [envoi, setEnvoi] = useState({ enCours: false, erreur: null });
    const [envoye, setEnvoye] = useState(null);

    // Une demande vivante existe déjà pour ce circuit (à l'étude, devis reçu,
    // accepté) : on ne la double pas, on y mène.
    const dejaDemande = useDemandeVivante(id);

    // Les hébergements se rechargent seuls après un refus du serveur (un hôtel
    // retiré de la vente entre-temps) : les choix encore valables sont gardés.
    const chargerHebergements = useCallback(async (enregistres) => {
        try {
            const reponse = await findHebergementsCircuitApi(id);
            const liste = reponse?.data ?? [];
            setSejours(liste);
            setChoixHotels((actuels) => choixInitiaux(liste, enregistres ?? actuels));
        } catch (error) {
            console.error("Chargement des hébergements impossible", error);
            setSejours([]);      // ← sans liste, le conseiller choisira : la demande part quand même
        }
    }, [id]);

    // Mêmes règles que les hébergements : une visite retirée de la vente
    // disparaît, et les choix encore valables sont gardés.
    const chargerVisites = useCallback(async (enregistrees) => {
        try {
            const reponse = await findVisitesCircuitApi(id);
            const liste = reponse?.data ?? [];
            setVisites(liste);
            setChoixVisites((actuels) => visitesInitiales(liste, enregistrees ?? actuels));
        } catch (error) {
            console.error("Chargement des visites impossible", error);
            setVisites([]);      // ← sans liste, la demande part quand même
        }
    }, [id]);

    const charger = useCallback(async () => {
        setEtat("chargement");
        try {
            const [reponse] = await Promise.all([
                findCircuitClientById(id),
                chargerHebergements(brouillon?.hebergements),
                chargerVisites(brouillon?.visites),
            ]);
            setCircuit(reponse?.data ?? null);
            setEtat("pret");
        } catch (error) {
            console.error("Chargement de la demande de devis impossible", error);
            setEtat("erreur");
        }
    }, [id, chargerHebergements, chargerVisites, brouillon]);

    useEffect(() => { charger(); }, [charger]);

    const groupeMax = circuit?.fiche?.groupe?.max ?? null;
    const plafond = Math.min(50, groupeMax ?? 50);

    // Chaque geste met le brouillon à jour. Il est effacé à l'envoi.
    useEffect(() => {
        if (etat !== "pret" || envoye) return;
        ecrireBrouillon(id, { dateLibre, voyageurs, message, hebergements: choixHotels, visites: choixVisites });
    }, [id, etat, envoye, dateLibre, voyageurs, message, choixHotels, choixVisites]);

    useRevelation(
        [
            { cible: ".cx-dv-etape", y: 34, stagger: 0.1, depart: "top 92%" },
            { cible: ".cx-dv-recap", y: 24 },
        ],
        etat === "pret" && !envoye
    );

    const changerVoyageurs = (delta) => setVoyageurs((v) => Math.max(1, Math.min(plafond, v + delta)));

    const ajouterEnvie = (envie) =>
        setMessage((m) => (m.includes(envie) ? m : `${m}${m.trim() ? "\n" : ""}${envie} : `));

    const envoyer = async (e) => {
        e.preventDefault();
        if (envoi.enCours) return;
        setEnvoi({ enCours: true, erreur: null });
        try {
            const reponse = await creerDemandeDevisApi({
                circuitId: Number(id),
                dateSouhaitee: dateLibre || null,
                nombreVoyageurs: voyageurs,
                message: message.trim() || null,
                hebergements: versChoixHebergements(sejours ?? [], choixHotels),
                visites: versChoixVisites(visites ?? [], choixVisites),
            });
            ecrireBrouillon(id, null);
            setEnvoye(reponse?.data ?? {});
            window.scrollTo({ top: 0, behavior: "smooth" });
            setEnvoi({ enCours: false, erreur: null });
        } catch (error) {
            setEnvoi({ enCours: false, erreur: messageErreurApi(error, "La demande n'a pas pu partir. Réessayez.") });
            if (error?.response?.status === 400) { chargerHebergements(); chargerVisites(); }
        }
    };

    const avecHebergements = (sejours?.length ?? 0) > 0;
    const avecVisites = (visites?.length ?? 0) > 0;
    // Un voyage composé ne se chiffre qu'une fois finalisé : le créateur a
    // vérifié que dates et nuits tiennent. Le dire AVANT le formulaire.
    const compose = circuit?.isTemplate === false;
    const nonFinalise = compose && circuit?.statutComposition !== "FINALISE";
    const retour = compose ? `/composer/${id}` : `/circuit/${id}`;
    // Les numéros suivent ce qui est RÉELLEMENT affiché : un voyage sans nuit
    // à l'hôtel n'a pas de « 03 · Vos hébergements », et la question suivante
    // prend sa place. Une seule liste, donc jamais de 04 après un 02.
    const questions = ["quand", "combien",
        ...(avecHebergements ? ["hebergements"] : []),
        ...(avecVisites ? ["visites"] : []),
        "envies"];
    const numero = (cle) => String(questions.indexOf(cle) + 1).padStart(2, "0");

    // Sans hero sombre, la barre du haut s'encre en foncé (data-header-text)
    if (etat === "chargement") {
        return <p className="cx-sous-entete cx-dv-attente cx-label cx-label--legende font-body-strong"
            data-header-text="var(--text-primary)">Chargement&hellip;</p>;
    }
    if (etat === "erreur" || !circuit) {
        return (
            <div className="cx-sous-entete cx-dv-attente" data-header-text="var(--text-primary)">
                {isAuthenticated ? <>
                    <p className="font-body">Ce circuit n'a pas pu être chargé.</p>
                    <Link to="/circuit" className="cx-dv-lien font-body-strong">Voir les circuits</Link>
                </> : <>
                    {/* Un voyage composé est privé : sans compte, il reste introuvable */}
                    <p className="font-body">Ce voyage est peut-être le vôtre : connectez-vous pour le retrouver.</p>
                    <Link to="/login" state={{ from: location.pathname }} className="cx-dv-lien font-body-strong">Se connecter</Link>
                </>}
            </div>
        );
    }

    return (
        <>
            <header className="cx-dv-hero" data-header-text="var(--text-inverse)">
                {circuit.imageUrl && <img src={imageCloudinary(circuit.imageUrl, 1600)} alt="" decoding="async" className="cx-dv-hero__image" />}
                <div className="cx-dv-hero__voile" />
                <div className="cx-dv-hero__contenu">
                    <Link to={retour} className="cx-dv-hero__retour font-body-strong">
                        <FaArrowLeft size={10} /> {compose ? "Retour au voyage" : "Retour au circuit"}
                    </Link>
                    <span className="cx-label font-body-strong cx-dv-hero__accroche">
                        {envoye ? "Demande envoyée" : "Demande de devis"}
                    </span>
                    <h1 className="cx-dv-hero__titre font-title">{circuit.nom}</h1>
                    <p className="cx-dv-hero__pied font-body">
                        {circuit.dureeJours > 0 && <>
                            {circuit.dureeJours} {compose
                                ? `nuit${circuit.dureeJours > 1 ? "s" : ""}`
                                : `jour${circuit.dureeJours > 1 ? "s" : ""}`} ·{" "}
                        </>}
                        Dates à composer avec vous
                    </p>
                </div>
            </header>

            <div className="cx-detail" data-header-text="var(--text-primary)">
                {envoye ? (
                    <Confirmation devis={envoye} />
                ) : dejaDemande ? (
                    <section className="cx-dv-merci">
                        <span className="cx-label cx-label--accent font-body-strong">
                            {libelleStatutDevis(dejaDemande.statutAffiche)}
                        </span>
                        <h2 className="cx-dv-merci__titre font-title">Une demande<br />est déjà en cours.</h2>
                        <p className="cx-dv-merci__reference font-body">
                            Référence <strong className="font-body-strong">{dejaDemande.reference}</strong>
                        </p>
                        <p className="cx-dv-merci__texte font-body">
                            {dejaDemande.statutAffiche === "PROPOSE"
                                ? "Votre conseiller vous a envoyé son devis : acceptez-le ou refusez-le avant d'en demander un autre."
                                : dejaDemande.statutAffiche === "ACCEPTE"
                                    ? "Vous avez accepté le devis de ce circuit : votre conseiller finalise le voyage avec vous."
                                    : "Votre conseiller étudie déjà ce circuit. Vous suivrez chaque étape depuis votre espace."}
                        </p>
                        <div className="cx-dv-merci__actions">
                            <Link to="/mes-devis" className="cx-dv-recap__envoyer font-body-strong">
                                {actionDemandeVivante(dejaDemande.statutAffiche)} <FaArrowRight size={11} />
                            </Link>
                            <Link to="/circuit" className="cx-dv-lien font-body-strong">Voir les autres circuits</Link>
                        </div>
                    </section>
                ) : nonFinalise ? (
                    <section className="cx-dv-merci">
                        <span className="cx-label cx-label--accent font-body-strong">Brouillon</span>
                        <h2 className="cx-dv-merci__titre font-title">Ce voyage n'est<br />pas encore finalisé.</h2>
                        <p className="cx-dv-merci__texte font-body">
                            Avant de le transmettre à l'agence, le créateur vérifie que vos dates et vos nuits
                            tiennent ensemble. Finalisez-le : la demande de devis part ensuite en un geste.
                        </p>
                        <div className="cx-dv-merci__actions">
                            <Link to={`/composer/${id}`} className="cx-dv-recap__envoyer font-body-strong">
                                Finaliser dans le créateur <FaArrowRight size={11} />
                            </Link>
                            <Link to="/mes-circuits" className="cx-dv-lien font-body-strong">Mes circuits</Link>
                        </div>
                    </section>
                ) : (
                    <form className="cx-dv" onSubmit={envoyer} noValidate>
                        <ol className="cx-dv__etapes">

                            {/* ── 01 · Quand ───────────────────────────────── */}
                            <li className="cx-dv-etape">
                                <EnteteEtape numero={numero("quand")} titre="Quand partir"
                                    aide="Ce voyage part quand vous le voulez : donnez votre date, ou laissez-la ouverte." />

                                <div className="cx-dv-etape__corps">
                                    <div className="cx-dv-champ">
                                        <label htmlFor="date-libre" className="cx-label cx-label--legende font-body-strong">
                                            Date de départ souhaitée <span className="cx-dv-champ__option">— facultatif</span>
                                        </label>
                                        <input id="date-libre" type="date" min={demain()} value={dateLibre}
                                            onChange={(e) => setDateLibre(e.target.value)}
                                            className="field-line cx-dv-champ__saisie font-body" />
                                        <span className="cx-dv-champ__aide font-body">
                                            Sans date, votre conseiller vous proposera les meilleures périodes.
                                        </span>
                                    </div>
                                </div>
                            </li>

                            {/* ── 02 · Combien ─────────────────────────────── */}
                            <li className="cx-dv-etape">
                                <EnteteEtape numero={numero("combien")} titre="Combien de voyageurs"
                                    aide={groupeMax
                                        ? `Ce circuit se vit en petit groupe : ${groupeMax} voyageurs au plus.`
                                        : "Enfants, âges, chambres : précisez-le dans vos envies, votre conseiller en tiendra compte."} />

                                <div className="cx-dv-etape__corps">
                                    <div className="cx-dv-voyageur">
                                        <span className="cx-dv-voyageur__nom font-body-strong">Voyageurs</span>
                                        <span className="cx-dv-compteur">
                                            <button type="button" className="cx-dv-compteur__bouton"
                                                aria-label="Retirer un voyageur" disabled={voyageurs <= 1}
                                                onClick={() => changerVoyageurs(-1)}>
                                                <FaMinus size={10} />
                                            </button>
                                            <span className="cx-dv-compteur__valeur font-title" aria-live="polite">{voyageurs}</span>
                                            <button type="button" className="cx-dv-compteur__bouton"
                                                aria-label="Ajouter un voyageur" disabled={voyageurs >= plafond}
                                                onClick={() => changerVoyageurs(1)}>
                                                <FaPlus size={10} />
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </li>

                            {/* ── 03 · Où dormir ───────────────────────────── */}
                            {avecHebergements && (
                                <li className="cx-dv-etape">
                                    <EnteteEtape numero={numero("hebergements")} titre="Vos hébergements"
                                        aide="Pour chaque étape, choisissez parmi les hébergements que nous proposons. Celui que nous conseillons est déjà sélectionné." />
                                    <div className="cx-dv-etape__corps">
                                        <ChoixHebergements sejours={sejours} choix={choixHotels}
                                            onChoisir={(jour, hotelId) => setChoixHotels((c) => ({ ...c, [jour]: hotelId }))} />
                                    </div>
                                </li>
                            )}

                            {/* ── Vos visites ──────────────────────── */}
                            {avecVisites && (
                                <li className="cx-dv-etape">
                                    <EnteteEtape numero={numero("visites")} titre="Vos visites"
                                        aide="Ce que ce voyage vous fait voir. Ce qui est compris dans le circuit y figure déjà ; le reste s'ajoute si l'envie vous en dit." />
                                    <div className="cx-dv-etape__corps">
                                        <ChoixVisites etapes={visites} choix={choixVisites}
                                            onBasculer={(jour, poiId) => setChoixVisites((c) => basculerVisite(c, jour, poiId))} />
                                    </div>
                                </li>
                            )}

                            {/* ── Vos envies ───────────────────────────────── */}
                            <li className="cx-dv-etape">
                                <EnteteEtape numero={numero("envies")} titre="Vos envies"
                                    aide="Ce qui compte pour vous : c'est ce qui fait d'un circuit votre voyage." />

                                <div className="cx-dv-etape__corps">
                                    <div className="cx-dv-envies">
                                        {ENVIES.map((envie) => (
                                            <button key={envie} type="button"
                                                className={`cx-dv-envie font-body${message.includes(envie) ? " cx-dv-envie--prise" : ""}`}
                                                onClick={() => ajouterEnvie(envie)}>
                                                {envie}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="cx-dv-champ">
                                        <label htmlFor="message" className="cx-label cx-label--legende font-body-strong">
                                            Votre message <span className="cx-dv-champ__option">— facultatif</span>
                                        </label>
                                        <textarea id="message" rows={5} maxLength={2000} value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Un anniversaire à fêter, une étape à rallonger, l'âge des enfants…"
                                            className="field-line cx-dv-champ__saisie cx-dv-champ__texte font-body" />
                                        <span className="cx-dv-champ__aide font-body">{message.length} / 2000</span>
                                    </div>
                                </div>
                            </li>
                        </ol>

                        {/* ── Le récapitulatif ────────────────────────────── */}
                        <aside className="cx-dv-recap">
                            <span className="cx-label cx-label--accent font-body-strong">Votre demande</span>
                            <p className="cx-dv-recap__circuit font-title">{circuit.nom}</p>

                            <dl className="cx-dv-recap__lignes">
                                <div className="cx-dv-recap__ligne">
                                    <dt className="font-body">Départ</dt>
                                    <dd className="font-body-strong">
                                        {dateLibre ? formatDateCourte(dateLibre) : "À convenir"}
                                    </dd>
                                </div>
                                <div className="cx-dv-recap__ligne">
                                    <dt className="font-body">Voyageurs</dt>
                                    <dd className="font-body-strong">{voyageurs} {voyageurs > 1 ? "personnes" : "personne"}</dd>
                                </div>
                                {avecHebergements && sejours.map((s) => (
                                    <div key={s.premierJour} className="cx-dv-recap__ligne">
                                        <dt className="font-body">{s.etape}</dt>
                                        <dd className="font-body-strong">{hotelChoisi(s, choixHotels)?.nom ?? "Au choix du conseiller"}</dd>
                                    </div>
                                ))}
                                {avecVisites && (
                                    <div className="cx-dv-recap__ligne">
                                        <dt className="font-body">Visites</dt>
                                        <dd className="font-body-strong">{resumeVisites(visites, choixVisites)}</dd>
                                    </div>
                                )}
                            </dl>

                            <p className="cx-dv-recap__note cx-dv-recap__suite font-body">
                                Votre conseiller compose le devis détaillé, poste par poste, et vous l'envoie
                                sous 48 heures. Vous le retrouverez dans « Mes devis ».
                            </p>

                            {envoi.erreur && <p className="cx-dv-recap__erreur font-body" role="alert">{envoi.erreur}</p>}

                            {isAuthenticated ? (
                                <>
                                    <button type="submit" className="cx-dv-recap__envoyer font-body-strong" disabled={envoi.enCours}>
                                        {envoi.enCours ? "Envoi…" : "Envoyer ma demande"}
                                        {!envoi.enCours && <FaArrowRight size={11} />}
                                    </button>
                                    <p className="cx-dv-recap__rassurance font-body">
                                        Réponse à {user?.email ?? "votre adresse"}. Aucun paiement, aucun engagement.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" state={{ from: location.pathname }}
                                        className="cx-dv-recap__envoyer font-body-strong">
                                        Se connecter pour envoyer <FaArrowRight size={11} />
                                    </Link>
                                    <p className="cx-dv-recap__rassurance font-body">
                                        Votre demande est gardée : vous la retrouverez intacte après la connexion.
                                    </p>
                                </>
                            )}
                        </aside>
                    </form>
                )}
            </div>
        </>
    );
}

function EnteteEtape({ numero, titre, aide }) {
    return (
        <div className="cx-dv-etape__entete">
            <span className="cx-dv-etape__numero font-title">{numero}</span>
            <div>
                <h2 className="cx-dv-etape__titre font-title">{titre}</h2>
                <p className="cx-dv-etape__aide font-body">{aide}</p>
            </div>
        </div>
    );
}

function Confirmation({ devis }) {
    return (
        <section className="cx-dv-merci">
            <span className="cx-label cx-label--accent font-body-strong">C'est envoyé</span>
            <h2 className="cx-dv-merci__titre font-title">Votre voyage est<br />entre nos mains.</h2>
            <p className="cx-dv-merci__reference font-body">
                Référence <strong className="font-body-strong">{devis.reference}</strong>
            </p>
            <p className="cx-dv-merci__texte font-body">
                Un conseiller étudie votre demande et vous envoie un devis détaillé sous 48 heures.
                Un e-mail de confirmation vient de partir ; vous suivrez chaque étape depuis votre espace.
            </p>
            <div className="cx-dv-merci__actions">
                <Link to="/mes-devis" className="cx-dv-recap__envoyer font-body-strong">
                    Suivre ma demande <FaArrowRight size={11} />
                </Link>
                <Link to="/circuit" className="cx-dv-lien font-body-strong">Continuer la visite</Link>
            </div>
        </section>
    );
}
