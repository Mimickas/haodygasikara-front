import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createReservationApi } from "../../../../api/client/cricuitApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import { formatDateCourte, formatPrice } from "../../../../utils/format";
import CompteurVoyageurs from "./CompteurVoyageurs";
import EtapeReservation from "./EtapeReservation";
import RecapitulatifResa from "./RecapitulatifResa";

// Le même garde-fou que le serveur (ReservationService.MAX_PAR_CATEGORIE).
// Recopié ici pour que le bouton « + » s'éteigne à la bonne valeur — pas pour
// faire respecter la règle : c'est le serveur qui la fait respecter.
const MAX_PAR_CATEGORIE = 30;

// ── Le formulaire de réservation ──────────────────────────────────────────
//
// ── Ce qui part au serveur ───────────────────────────────────────────────
//   { circuitDateTarifId, lignes: [{ circuitTarifId, quantite }], nom, email, … }
//
// Aucun prix, aucun total. Le total affiché pendant la saisie est un confort
// de lecture : le serveur relit les tarifs en base, recalcule, et c'est SON
// montant que l'accusé de réception affiche. Si les deux diffèrent — un tarif
// modifié entre-temps — c'est le second qui fait foi, et le visiteur le voit.
//
// ── Ce qui a changé dans la mise en page, et pourquoi ────────────────────
// Trois étapes numérotées au lieu de trois zones séparées par des filets, un
// récapitulatif toujours visible, et un bouton qui DIT ce qui manque au lieu
// de s'éteindre en silence. Le détail du raisonnement est dans les fichiers
// `EtapeReservation`, `RecapitulatifResa` et `CompteurVoyageurs`.
export default function FormulaireReservation({ circuit, depart }) {
    // Mémoïsé : `depart.prices` est une nouvelle référence à chaque rendu du
    // parent, et les totaux se recalculeraient à chaque frappe dans un champ.
    const tarifs = useMemo(() => depart?.prices ?? [], [depart]);

    const [quantites, setQuantites] = useState(() =>
        Object.fromEntries(tarifs.map((t) => [t.id, 0]))
    );
    const [contact, setContact] = useState({ nom: "", email: "", telephone: "", message: "" });
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [recu, setRecu] = useState(null);

    const lignes = useMemo(
        () => tarifs
            .map((t) => ({
                id: t.id,
                libelle: t.libelleCategory ?? t.codeCategory,
                quantite: quantites[t.id] ?? 0,
                sousTotal: (quantites[t.id] ?? 0) * Number(t.price ?? 0),
            }))
            .filter((l) => l.quantite > 0),
        [tarifs, quantites]
    );

    const voyageurs = lignes.reduce((total, l) => total + l.quantite, 0);
    const total = lignes.reduce((somme, l) => somme + l.sousTotal, 0);
    const devise = tarifs[0]?.devise ?? "";

    // Ce qui manque, DANS L'ORDRE où on le remplit. Un bouton éteint sans
    // explication laisse le visiteur bloqué sans savoir pourquoi — et c'est
    // exactement là qu'on abandonne.
    const manque = [
        voyageurs === 0 && "indiquer au moins un voyageur",
        !contact.nom.trim() && "écrire votre nom",
        !contact.email.trim() && "écrire votre adresse e-mail",
    ].filter(Boolean);

    const pretAEnvoyer = manque.length === 0 && !envoi;

    const changer = (champ) => (e) =>
        setContact((c) => ({ ...c, [champ]: e.target.value }));

    async function envoyer(e) {
        e.preventDefault();
        if (!pretAEnvoyer) return;

        setEnvoi(true);
        setErreur(null);
        try {
            const reponse = await createReservationApi({
                circuitDateTarifId: depart.id,
                lignes: tarifs.map((t) => ({
                    circuitTarifId: t.id,
                    quantite: quantites[t.id] ?? 0,
                })),
                nom: contact.nom.trim(),
                email: contact.email.trim(),
                telephone: contact.telephone.trim() || null,
                message: contact.message.trim() || null,
            });
            setRecu(reponse?.data ?? null);
            window.scrollTo({ top: 0, behavior: "instant" });
            window.lenis?.scrollTo(0, { immediate: true });
        } catch (error) {
            console.error("Réservation impossible", error);
            setErreur(apiErrorMessage(error, "La réservation n'a pas pu être enregistrée."));
        } finally {
            setEnvoi(false);
        }
    }

    // ── L'accusé de réception ────────────────────────────────────────────
    // Il remplace tout le formulaire et affiche les montants DU SERVEUR.
    if (recu) {
        return (
            <div className="cx-resa" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                <div className="cx-recu">
                    {/* Le libellé vient du serveur (StatutReservation.libelle) :
                        il dit l'état réel de la réservation, pas un texte figé
                        ici. Reformuler « Envoyée » en base suffira à changer
                        l'écran. */}
                    <span className="cx-label cx-label--accent font-body-strong">
                        {recu.statutLibelle
                            ? `Réservation ${recu.statutLibelle.toLowerCase()}`
                            : "Réservation enregistrée"}
                    </span>

                    <h2 className="cx-recu__titre font-title">
                        C&rsquo;est not&eacute;, {recu.nom}
                    </h2>

                    <p className="cx-recu__texte font-body">
                        Nous avons bien re&ccedil;u votre demande pour le d&eacute;part du{" "}
                        <strong>{formatDateCourte(recu.dateDebut)}</strong>.
                    </p>

                    <div className="cx-recu__suite font-body">
                        <strong>Ce qui se passe maintenant.</strong> Un r&eacute;capitulatif
                        part tout de suite &agrave; <strong>{recu.email}</strong>. Notre
                        &eacute;quipe v&eacute;rifie que les places sont disponibles et vous
                        r&eacute;pond <strong>sous 48&nbsp;heures</strong>. Vous ne payez rien
                        avant cette r&eacute;ponse.
                    </div>

                    <div className="cx-recu__lignes">
                        {(recu.lignes ?? []).map((ligne, i) => (
                            <span key={i} className="cx-recap__ligne font-body">
                                <span>
                                    <strong className="tabular-nums">{ligne.quantite}</strong>{" "}
                                    &times; {ligne.categorie}
                                </span>
                                <span className="tabular-nums">
                                    {formatPrice(ligne.sousTotal)} {recu.devise}
                                </span>
                            </span>
                        ))}
                    </div>

                    <div className="cx-recap__total">
                        <span className="cx-recap__total-legende font-body-strong">
                            Total confirm&eacute;
                        </span>
                        <span className="cx-recap__total-valeur font-body-strong tabular-nums">
                            {formatPrice(recu.total)} {recu.devise}
                        </span>
                    </div>

                    <div style={{ marginTop: "clamp(28px, 3vw, 40px)" }}>
                        <Link to="/mes-reservations" className="cx-devis__bouton font-body-strong">
                            Suivre ma r&eacute;servation
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={envoyer} className="cx-resa">

            <div className="cx-resa__etapes">

                {/* ══ 1 — Qui voyage ? ══════════════════════════════════ */}
                <EtapeReservation
                    numero="1"
                    titre="Qui voyage&nbsp;?"
                    aide="Ajoutez une personne à la fois avec les boutons + et −. Le prix se met à jour à droite."
                >
                    {tarifs.map((tarif) => (
                        <div key={tarif.id} className="cx-voyageur">
                            <span className="min-w-0">
                                <span className="cx-voyageur__nom font-body-strong">
                                    {tarif.libelleCategory ?? tarif.codeCategory}
                                </span>
                                {/* Le prix est ECRIT, pas sous-entendu par une
                                    colonne : « 250 000 MGA » seul, aligné à
                                    droite, laisse deviner s'il s'agit du prix
                                    par personne ou du total. */}
                                <span className="cx-voyageur__prix font-body">
                                    <span className="tabular-nums">{formatPrice(tarif.price)}</span>
                                    {tarif.devise && <> {tarif.devise}</>} par personne
                                </span>
                            </span>

                            {/* La mise à jour part de la valeur COURANTE de
                                l'état, pas de la prop : deux appuis rapides
                                sur « + » doivent compter deux personnes. */}
                            <CompteurVoyageurs
                                valeur={quantites[tarif.id] ?? 0}
                                max={MAX_PAR_CATEGORIE}
                                libelle={tarif.libelleCategory ?? tarif.codeCategory}
                                onModifier={(ecart) =>
                                    setQuantites((q) => ({
                                        ...q,
                                        [tarif.id]: Math.max(
                                            0,
                                            Math.min(MAX_PAR_CATEGORIE, (q[tarif.id] ?? 0) + ecart)
                                        ),
                                    }))
                                }
                            />
                        </div>
                    ))}
                </EtapeReservation>

                {/* ══ 2 — Comment vous joindre ? ════════════════════════ */}
                <EtapeReservation
                    numero="2"
                    titre="Comment vous joindre&nbsp;?"
                    aide="Nous vous écrivons pour confirmer les places. Le nom et l'adresse e-mail suffisent."
                >
                    <div className="cx-resa__champs">
                        <Champ
                            etiquette="Votre nom"
                            value={contact.nom}
                            onChange={changer("nom")}
                            placeholder="Rakoto Andry"
                            autoComplete="name"
                            required
                        />
                        <Champ
                            etiquette="Votre adresse e-mail"
                            type="email"
                            value={contact.email}
                            onChange={changer("email")}
                            placeholder="vous@exemple.com"
                            autoComplete="email"
                            required
                        />
                        <Champ
                            etiquette="Votre téléphone"
                            option="facultatif"
                            type="tel"
                            value={contact.telephone}
                            onChange={changer("telephone")}
                            placeholder="+261 34 00 000 00"
                            autoComplete="tel"
                        />
                        <Champ
                            etiquette="Quelque chose à nous dire"
                            option="facultatif"
                            large
                            value={contact.message}
                            onChange={changer("message")}
                            placeholder="Un enfant en bas âge, un régime particulier…"
                        />
                    </div>
                </EtapeReservation>

                {/* ══ 3 — Envoyer ═══════════════════════════════════════ */}
                <EtapeReservation
                    numero="3"
                    titre="Envoyer la demande"
                    aide="Vous ne payez rien maintenant. Nous vérifions les places et nous vous répondons sous 48 heures."
                >
                    {/* Le message vient du serveur : il dit précisément ce qui
                        a été refusé, plutôt qu'un « erreur » générique. */}
                    {erreur && (
                        <p className="cx-resa__erreur font-body" role="alert">{erreur}</p>
                    )}

                    {manque.length > 0 && (
                        <p className="cx-resa__manque font-body">
                            Avant d&rsquo;envoyer, il reste &agrave;{" "}
                            <strong>{enumerer(manque)}</strong>.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="cx-resa__envoyer font-body-strong"
                        disabled={!pretAEnvoyer}
                    >
                        {envoi ? "Envoi en cours…" : "Envoyer ma demande"}
                    </button>

                    <span className="cx-resa__rassurance font-body">
                        Aucun paiement &agrave; cette &eacute;tape, et aucun engagement. Le
                        montant est recalcul&eacute; puis confirm&eacute; par notre
                        &eacute;quipe.
                    </span>
                </EtapeReservation>
            </div>

            {/* ══ Le récapitulatif, toujours visible ═══════════════════ */}
            <div className="cx-resa__recap">
                <RecapitulatifResa
                    circuit={circuit}
                    depart={depart}
                    lignes={lignes}
                    voyageurs={voyageurs}
                    total={total}
                    devise={devise}
                />
            </div>

            {/* ══ La barre du téléphone ════════════════════════════════
                Sur un écran étroit, la colonne de droite passe au-dessus du
                formulaire et sort du champ de vision pendant la saisie. */}
            <div className="cx-resa__barre">
                <span>
                    <span className="cx-resa__barre-legende font-body-strong">
                        {voyageurs > 0
                            ? `${voyageurs} voyageur${voyageurs > 1 ? "s" : ""}`
                            : "Aucun voyageur"}
                    </span>
                    <span className="cx-resa__barre-total font-body-strong tabular-nums">
                        {voyageurs > 0 ? `${formatPrice(total)} ${devise}` : "—"}
                    </span>
                </span>
                <button
                    type="submit"
                    className="cx-resa__envoyer font-body-strong"
                    style={{ width: "auto", padding: "16px 22px" }}
                    disabled={!pretAEnvoyer}
                >
                    {envoi ? "Envoi…" : "Envoyer"}
                </button>
            </div>
        </form>
    );
}

/** « a, b et c » — une énumération qui se lit, pas une liste à puces. */
function enumerer(elements) {
    if (elements.length === 1) return elements[0];
    return elements.slice(0, -1).join(", ") + " et " + elements[elements.length - 1];
}

/**
 * Un champ souligné : la règle `.field-line` de tout le site, déjà employée à
 * la connexion. Le filet passe en Terre à la saisie.
 *
 * « Facultatif » est écrit à côté de l'étiquette et non dedans : on lit
 * d'abord ce qui est demandé, ensuite seulement s'il faut le remplir.
 */
function Champ({ etiquette, option, large = false, ...props }) {
    return (
        <label className={large ? "cx-resa__champ--large" : undefined}>
            <span className="cx-resa__etiquette font-body-strong">
                {etiquette}
                {option && <span className="cx-resa__option font-body"> — {option}</span>}
            </span>
            <input {...props} className="cx-resa__saisie field-line font-body" />
        </label>
    );
}
