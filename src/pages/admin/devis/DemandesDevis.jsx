import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    declinerDevisApi, findAllDemandesDevisApi, findPostesSuggeresDevisApi, findStatsDevisApi,
    noterDevisApi, prendreEnChargeDevisApi, proposerDevisApi, renvoyerEmailDevisApi, telechargerPdfDevisApi,
} from "../../../api/admin/demandeDevisApi";
import { enregistrerFichier, relireErreurBlob } from "../../../utils/telecharger";
import { libelleNuits } from "../../../functions/devis/hebergements";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import { parDate, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import { formatDate, formatDateCourte } from "../../../utils/format";
import { apiErrorMessage } from "../../../utils/apiError";
import { montantDevis } from "../../../constants/client/devis";

// ── Les demandes de devis — /admin/haodygasikara/devis ────────────────────
//
// L'écran de travail du conseiller. Trois choses à lire d'un coup d'œil :
// combien de demandes attendent, depuis combien de temps l'agence met à
// répondre, et combien de devis finissent acceptés. Puis la liste, filtrée
// par défaut sur « À traiter » : c'est la question du matin.
//
// Une ligne ouvre le dossier sur le côté, sans quitter la liste : on traite
// une demande, on passe à la suivante.

const FILTRES = [
    { cle: "ATRAITER", libelle: "À traiter",  garde: (d) => d.statutAffiche === "ENVOYE" || d.statutAffiche === "EN_COURS" },
    { cle: "PROPOSE",  libelle: "Proposés",   garde: (d) => d.statutAffiche === "PROPOSE" },
    { cle: "ACCEPTE",  libelle: "Acceptés",   garde: (d) => d.statutAffiche === "ACCEPTE" },
    { cle: "CLOS",     libelle: "Clos",       garde: (d) => ["REFUSE", "DECLINE", "ANNULE", "EXPIRE"].includes(d.statutAffiche) },
    // Les voyageurs à qui le dernier e-mail n'est pas parvenu : à renvoyer
    { cle: "EMAIL",    libelle: "E-mail non parti", garde: (d) => Boolean(d.emailErreur) },
    { cle: "TOUS",     libelle: "Tous",       garde: () => true },
];

// Les étapes où le voyageur attend un e-mail qu'on peut lui renvoyer :
// l'accusé (à l'étude), le devis (proposé, non expiré), le motif (décliné).
const RENVOYABLES = ["ENVOYE", "EN_COURS", "PROPOSE", "DECLINE"];

// Une demande en attente depuis plus de 48 h a dépassé la promesse faite au voyageur.
const HEURES_PROMESSE = 48;

export default function DemandesDevis() {
    const [devis, setDevis] = useState([]);
    const [stats, setStats] = useState(null);
    const [chargement, setChargement] = useState(true);
    // ?dossier=12 : le tableau de bord ouvre directement une demande
    const [params, setParams] = useSearchParams();
    const [ouvertId, setOuvertIdEtat] = useState(() => Number(params.get("dossier")) || null);
    const setOuvertId = (id) => {
        setOuvertIdEtat(id);
        setParams((p) => {
            const suite = new URLSearchParams(p);
            if (id) suite.set("dossier", id); else suite.delete("dossier");
            return suite;
        }, { replace: true });
    };

    const charger = async () => {
        try {
            const [liste, chiffres] = await Promise.all([findAllDemandesDevisApi(), findStatsDevisApi()]);
            setDevis(liste?.data ?? []);
            setStats(chiffres?.data ?? null);
        } catch (error) {
            console.error("Erreur lors de la récupération des devis :", error);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const remplacer = async (majour) => {
        setDevis((liste) => liste.map((d) => (d.id === majour.id ? majour : d)));
        try {
            const chiffres = await findStatsDevisApi();
            setStats(chiffres?.data ?? null);
        } catch { /* les indicateurs se rafraîchiront au prochain chargement */ }
    };

    const kpiItems = useMemo(() => [
        {
            label: "À traiter",
            value: (stats?.aTraiter ?? 0) + (stats?.enCours ?? 0),
            hint: `${stats?.aTraiter ?? 0} nouvelle${(stats?.aTraiter ?? 0) > 1 ? "s" : ""}, ${stats?.enCours ?? 0} à l'étude`,
            accent: "var(--brand-terre)",
        },
        {
            label: "Délai de réponse",
            value: stats?.delaiMoyenHeures == null ? "—" : `${stats.delaiMoyenHeures} h`,
            hint: stats?.delaiMoyenHeures == null ? "aucun devis encore proposé"
                : stats.delaiMoyenHeures <= HEURES_PROMESSE ? "dans la promesse des 48 h" : "au-delà de la promesse des 48 h",
            accent: "var(--brand-ocre)",
        },
        {
            label: "Devis en attente",
            value: stats?.proposes ?? 0,
            hint: "proposés, sans réponse du voyageur",
            accent: "var(--brand-lagune)",
        },
        {
            label: "Taux d'acceptation",
            value: stats?.tauxAcceptation == null ? "—" : `${stats.tauxAcceptation} %`,
            hint: `${stats?.acceptes ?? 0} accepté${(stats?.acceptes ?? 0) > 1 ? "s" : ""} sur les devis tranchés`,
            accent: "var(--brand-nature)",
        },
    ], [stats]);

    // Les plus anciennes d'abord : c'est l'ordre de la promesse des 48 h
    const liste = useListeAdmin(devis, {
        recherche: (d) => [d.reference, d.circuit?.nom, d.client?.prenom, d.client?.nom, d.client?.email],
        filtres: FILTRES,
        tris: [
            { cle: "ANCIENNES", libelle: "Plus anciennes d'abord", comparer: parDate("createdAt", 1) },
            { cle: "RECENTES", libelle: "Plus récentes d'abord", comparer: parDate("createdAt", -1) },
        ],
        export: { nom: "demandes-de-devis", colonnes: dataTableConstant.demandeDevisColumns },
    });

    const ouvert = devis.find((d) => d.id === ouvertId) ?? null;

    return <>
        <Toolbar liste={liste} placeholder="Référence, voyageur, circuit…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
        ]} />

        <KpiCard items={kpiItems} loading={chargement} />

        <DataTable
            columns={dataTableConstant.demandeDevisColumns}
            data={liste.lignes}
            loading={chargement}
            onRowClick={(d) => setOuvertId(d.id)}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucune demande", texte: "Les demandes de devis des voyageurs arrivent ici, avec leur récapitulatif." }}
        />

        {ouvert && <Dossier devis={ouvert} onFermer={() => setOuvertId(null)} onMaj={remplacer} />}
    </>;
}

// ── Le dossier d'une demande ──────────────────────────────────────────────
//
// Le chiffrage est ENTIÈREMENT MANUEL : le voyageur n'a donné qu'une date et
// un nombre de voyageurs. Le conseiller compose le devis poste par poste —
// guide, hébergements, véhicule… — et le total est la somme des postes, jamais
// un chiffre tapé à part qui pourrait contredire son propre détail.

const posteVide = () => ({ libelle: "", quantite: 1, prixUnitaire: "" });

function Dossier({ devis: d, onFermer, onMaj }) {
    const [mode, setMode] = useState(null);         // null | "proposer" | "decliner"
    const [envoi, setEnvoi] = useState({ enCours: false, erreur: null });
    const [notes, setNotes] = useState(d.adminNotes ?? "");

    const dans30Jours = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().slice(0, 10);
    };

    // Une révision repart du devis déjà envoyé ; un premier devis, d'une
    // première ligne vide pré-remplie avec le nombre de voyageurs.
    const [postes, setPostes] = useState(() => d.postes?.length
        ? d.postes.map((p) => ({ libelle: p.libelle, quantite: p.quantite, prixUnitaire: p.prixUnitaire }))
        : [{ ...posteVide(), quantite: d.nombreVoyageurs ?? 1 }]);
    const [offre, setOffre] = useState({
        devise: d.deviseProposee ?? "MGA",
        validiteJusquau: d.validiteJusquau ?? dans30Jours(),
        message: d.messageAgence ?? "",
    });
    const [motif, setMotif] = useState("");

    useEffect(() => {
        const echap = (e) => { if (e.key === "Escape") onFermer(); };
        window.addEventListener("keydown", echap);
        return () => window.removeEventListener("keydown", echap);
    }, [onFermer]);

    const agir = async (appel) => {
        setEnvoi({ enCours: true, erreur: null });
        try {
            const reponse = await appel();
            await onMaj(reponse?.data);
            setMode(null);
            setEnvoi({ enCours: false, erreur: null });
        } catch (error) {
            setEnvoi({ enCours: false, erreur: apiErrorMessage(error, "L'opération n'a pas abouti.") });
        }
    };

    // Les hébergements choisis par le voyageur, en lignes déjà libellées :
    // il ne reste qu'à les chiffrer. Elles remplacent la ligne vide de départ.
    const reprendreHebergements = () => agirSansFermer(async () => {
        const reponse = await findPostesSuggeresDevisApi(d.id);
        const lignes = (reponse?.data ?? []).map((p) => ({ libelle: p.libelle, quantite: p.quantite, prixUnitaire: "" }));
        setPostes((liste) => [...liste.filter((p) => p.libelle.trim() || p.prixUnitaire !== ""), ...lignes]);
    });

    const agirSansFermer = async (appel) => {
        setEnvoi({ enCours: true, erreur: null });
        try {
            await appel();
            setEnvoi({ enCours: false, erreur: null });
        } catch (error) {
            setEnvoi({ enCours: false, erreur: apiErrorMessage(error, "L'opération n'a pas abouti.") });
        }
    };

    const majPoste = (i, champ, valeur) =>
        setPostes((liste) => liste.map((p, j) => (j === i ? { ...p, [champ]: valeur } : p)));
    const retirerPoste = (i) => setPostes((liste) => liste.filter((_, j) => j !== i));
    const monterPoste = (i) => setPostes((liste) => {
        if (i === 0) return liste;
        const copie = [...liste];
        [copie[i - 1], copie[i]] = [copie[i], copie[i - 1]];
        return copie;
    });

    const postesValides = postes.filter((p) => p.libelle.trim() && Number(p.quantite) >= 1 && p.prixUnitaire !== "" && Number(p.prixUnitaire) >= 0);
    const total = postesValides.reduce((s, p) => s + Number(p.quantite) * Number(p.prixUnitaire), 0);
    const incomplet = postesValides.length !== postes.length || postes.length === 0 || total <= 0;
    const parVoyageur = d.nombreVoyageurs > 0 && total > 0 ? Math.round(total / d.nombreVoyageurs) : null;

    const statut = d.statutAffiche;
    // Un devis envoyé ne bouge plus tant que le voyageur peut y répondre : il
    // accepterait un prix différent de celui qu'il a lu. Expiré, il se renouvelle.
    const peutProposer = ["ENVOYE", "EN_COURS", "EXPIRE"].includes(statut);
    const peutRenvoyer = RENVOYABLES.includes(statut);
    const renvoyer = () => agirSansFermer(async () => {
        const reponse = await renvoyerEmailDevisApi(d.id);
        await onMaj(reponse?.data);
        if (reponse?.data?.emailErreur) throw new Error("L'e-mail n'est toujours pas parti.");
    });
    const heuresAttente = Math.round((Date.now() - new Date(d.createdAt).getTime()) / 3600000);
    const enRetard = (statut === "ENVOYE" || statut === "EN_COURS") && heuresAttente > HEURES_PROMESSE;

    return (
        <div className="ad-dv-voile" onClick={onFermer}>
            <aside className="ad-dv-dossier" onClick={(e) => e.stopPropagation()} aria-label={`Dossier ${d.reference}`}>
                <header className="ad-dv-dossier__entete">
                    <div>
                        <p className="ad-dv-surtitre font-body-strong">{d.reference} · reçue le {formatDate(d.createdAt)}</p>
                        <h2 className="font-title ad-dv-dossier__titre">{d.circuit?.nom}</h2>
                        <span className={`ad-dv-pastille ad-dv-pastille--${statut}`}>{d.statutLibelle}</span>
                        {enRetard && <span className="ad-dv-alerte font-body-strong">En attente depuis {heuresAttente} h</span>}
                        <button type="button" className="ad-bouton ad-dv-pdf font-body-strong" disabled={envoi.enCours}
                            onClick={() => agirSansFermer(async () => {
                                try {
                                    enregistrerFichier(await telechargerPdfDevisApi(d.id), `Haodygasikara-${d.reference}.pdf`);
                                } catch (error) {
                                    throw await relireErreurBlob(error);
                                }
                            })}>
                            Récapitulatif PDF ↓
                        </button>
                    </div>
                    <button type="button" className="ad-dv-fermer" onClick={onFermer} aria-label="Fermer">✕</button>
                </header>

                <div className="ad-dv-dossier__corps">
                    {/* Le voyageur n'a pas reçu le dernier e-mail : c'est la première chose à lire */}
                    {d.emailErreur && (
                        <div className="ad-erreur ad-mail ad-mail--dossier" role="alert">
                            <div>
                                <p className="font-body-strong">Le dernier e-mail au voyageur n'est pas parti.</p>
                                <p className="font-body">{d.emailErreur}</p>
                            </div>
                            {peutRenvoyer && (
                                <button type="button" className="ad-bouton font-body-strong" disabled={envoi.enCours} onClick={renvoyer}>
                                    {envoi.enCours ? "Envoi…" : "Renvoyer l'e-mail"}
                                </button>
                            )}
                        </div>
                    )}

                    <Bloc titre="Le voyageur">
                        <p className="font-body-strong">{[d.client?.prenom, d.client?.nom].filter(Boolean).join(" ")}</p>
                        <p className="font-body"><a href={`mailto:${d.client?.email}`}>{d.client?.email}</a></p>
                        {d.client?.telephone && <p className="font-body"><a href={`tel:${d.client.telephone}`}>{d.client.telephone}</a></p>}
                        {!d.emailErreur && d.emailEnvoyeLe && (
                            <p className="font-body ad-dv-muet">Dernier e-mail parti le {formatDate(d.emailEnvoyeLe)}</p>
                        )}
                        {!d.emailErreur && peutRenvoyer && (
                            <button type="button" className="ad-dv-ajout font-body-strong" disabled={envoi.enCours} onClick={renvoyer}>
                                Renvoyer l'e-mail au voyageur
                            </button>
                        )}
                    </Bloc>

                    <Bloc titre="Sa demande">
                        <Ligne g="Départ" d={d.datesAConvenir ? "À convenir" : formatDateCourte(d.dateDebut)} />
                        <Ligne g="Voyageurs" d={d.nombreVoyageurs ?? "—"} />
                        {d.hebergements?.map((h) => (
                            <Ligne key={h.premierJour} g={`${h.etape} · ${libelleNuits(h)}`}
                                d={h.hotel ? `${h.hotel}${h.conseille ? "" : " · autre choix"}` : "Au choix de l'agence"} />
                        ))}
                        {d.message && <p className="font-body ad-dv-texte">{d.message}</p>}
                    </Bloc>

                    {/* Les visites. Celles en option sont ce qu'il reste à chiffrer :
                        elles arrivent déjà libellées dans les postes suggérés. */}
                    {d.visites?.length > 0 && (
                        <Bloc titre="Les visites">
                            {d.visites.map((v) => (
                                <Ligne key={`${v.premierJour}-${v.poiId}`}
                                    g={`${v.etape} · ${v.nom}`}
                                    d={v.inclus ? "comprise" : "en option"} />
                            ))}
                        </Bloc>
                    )}

                    {/* L'itinéraire qu'on chiffre : un voyage composé n'a que lui */}
                    {d.circuit?.etapes?.length > 0 && (
                        <Bloc titre={d.circuit.modele ? "Le parcours · circuit de l'agence" : "Le parcours · composé par le voyageur"}>
                            {d.circuit.etapes.map((e) => (
                                <Ligne key={e.position} g={`J${e.premierJour} → J${e.dernierJour} · ${e.destination}`}
                                    d={d.circuit.modele ? `${e.duree} j` : `${e.duree} nuit${e.duree > 1 ? "s" : ""}`} />
                            ))}
                            {d.circuit.modele
                                ? <a href={`/circuit/${d.circuit.id}`} target="_blank" rel="noreferrer" className="font-body">Voir la fiche du circuit ↗</a>
                                : <Link to={`/admin/haodygasikara/circuits-voyageurs?circuit=${d.circuit.id}`} className="font-body">Ouvrir le voyage composé →</Link>}
                        </Bloc>
                    )}

                    {d.montantPropose != null && mode !== "proposer" && (
                        <Bloc titre="Devis envoyé">
                            {d.postes.map((p, i) => (
                                <Ligne key={i} g={`${p.libelle}${p.quantite > 1 ? ` · ${p.quantite} × ${montantDevis(p.prixUnitaire, d.deviseProposee)}` : ""}`}
                                    d={montantDevis(p.sousTotal, d.deviseProposee)} />
                            ))}
                            <Ligne g="Total" d={montantDevis(d.montantPropose, d.deviseProposee)} fort />
                            <Ligne g="Valable jusqu'au" d={formatDateCourte(d.validiteJusquau)} />
                            {d.messageAgence && <p className="font-body ad-dv-texte">« {d.messageAgence} »</p>}
                        </Bloc>
                    )}

                    {/* ── Rédiger le devis ─────────────────────────────── */}
                    {mode === "proposer" && (
                        <Bloc titre={statut === "EXPIRE" ? "Renouveler le devis" : "Rédiger le devis"}>
                            <div className="ad-dv-postes">
                                <div className="ad-dv-poste ad-dv-poste--entete">
                                    <span className="ad-dv-surtitre font-body-strong">Poste</span>
                                    <span className="ad-dv-surtitre font-body-strong">Qté</span>
                                    <span className="ad-dv-surtitre font-body-strong">Prix unitaire</span>
                                    <span />
                                </div>
                                {postes.map((p, i) => (
                                    <div key={i} className="ad-dv-poste">
                                        <input type="text" value={p.libelle} maxLength={200}
                                            onChange={(e) => majPoste(i, "libelle", e.target.value)}
                                            placeholder="Guide, hébergement, véhicule…" className="ad-dv-saisie font-body" />
                                        <input type="number" min="1" value={p.quantite}
                                            onChange={(e) => majPoste(i, "quantite", e.target.value)} className="ad-dv-saisie font-body" />
                                        <input type="number" min="0" step="1" value={p.prixUnitaire}
                                            onChange={(e) => majPoste(i, "prixUnitaire", e.target.value)} className="ad-dv-saisie font-body" />
                                        <span className="ad-dv-poste__outils">
                                            <button type="button" className="ad-dv-icone" title="Monter" disabled={i === 0}
                                                onClick={() => monterPoste(i)}>↑</button>
                                            <button type="button" className="ad-dv-icone" title="Retirer" disabled={postes.length === 1}
                                                onClick={() => retirerPoste(i)}>✕</button>
                                        </span>
                                    </div>
                                ))}
                                <button type="button" className="ad-dv-ajout font-body-strong"
                                    onClick={() => setPostes((liste) => [...liste, posteVide()])}>
                                    + Ajouter un poste
                                </button>
                                {d.hebergements?.some((h) => h.hotel) && (
                                    <button type="button" className="ad-dv-ajout font-body-strong" disabled={envoi.enCours}
                                        onClick={reprendreHebergements}>
                                        + Reprendre les hébergements choisis
                                    </button>
                                )}
                            </div>

                            <div className="ad-dv-total">
                                <span className="ad-dv-surtitre font-body-strong">Total du devis</span>
                                <span className="font-title ad-dv-total__montant">{montantDevis(total, offre.devise)}</span>
                                {parVoyageur != null && (
                                    <span className="font-body ad-dv-muet">soit {montantDevis(parVoyageur, offre.devise)} par voyageur</span>
                                )}
                            </div>

                            <div className="ad-dv-grille ad-dv-grille--deux">
                                <label className="ad-dv-champ">
                                    <span className="ad-dv-surtitre font-body-strong">Devise</span>
                                    <input type="text" maxLength={3} value={offre.devise}
                                        onChange={(e) => setOffre({ ...offre, devise: e.target.value.toUpperCase() })} className="ad-dv-saisie font-body" />
                                </label>
                                <label className="ad-dv-champ">
                                    <span className="ad-dv-surtitre font-body-strong">Valable jusqu'au</span>
                                    <input type="date" value={offre.validiteJusquau}
                                        onChange={(e) => setOffre({ ...offre, validiteJusquau: e.target.value })} className="ad-dv-saisie font-body" />
                                </label>
                            </div>
                            <label className="ad-dv-champ">
                                <span className="ad-dv-surtitre font-body-strong">Message au voyageur</span>
                                <textarea rows={4} value={offre.message} onChange={(e) => setOffre({ ...offre, message: e.target.value })}
                                    placeholder="Ce qui est compris, ce qui a été adapté à sa demande…" className="ad-dv-saisie font-body" />
                            </label>
                            <div className="ad-dv-actions">
                                <button type="button" className="ad-bouton ad-bouton--plein font-body-strong"
                                    disabled={envoi.enCours || incomplet}
                                    onClick={() => agir(() => proposerDevisApi(d.id, {
                                        postes: postes.map((p) => ({
                                            libelle: p.libelle.trim(),
                                            quantite: Number(p.quantite),
                                            prixUnitaire: Number(p.prixUnitaire),
                                        })),
                                        devise: offre.devise,
                                        validiteJusquau: offre.validiteJusquau,
                                        message: offre.message || null,
                                    }))}>
                                    {envoi.enCours ? "Envoi…" : "Envoyer le devis"}
                                </button>
                                <button type="button" className="ad-bouton font-body-strong" onClick={() => setMode(null)}>Annuler</button>
                            </div>
                            {incomplet && (
                                <p className="font-body ad-dv-muet">Chaque poste doit avoir un libellé, une quantité et un prix.</p>
                            )}
                        </Bloc>
                    )}

                    {/* ── Décliner ─────────────────────────────────────── */}
                    {mode === "decliner" && (
                        <Bloc titre="Décliner la demande">
                            <textarea rows={3} value={motif} onChange={(e) => setMotif(e.target.value)}
                                placeholder="Le motif part au voyageur : complet à ces dates, circuit suspendu…" className="ad-dv-saisie font-body" />
                            <div className="ad-dv-actions">
                                <button type="button" className="ad-bouton ad-bouton--danger font-body-strong" disabled={envoi.enCours}
                                    onClick={() => agir(() => declinerDevisApi(d.id, motif.trim() || null))}>
                                    Décliner et prévenir le voyageur
                                </button>
                                <button type="button" className="ad-bouton font-body-strong" onClick={() => setMode(null)}>Annuler</button>
                            </div>
                        </Bloc>
                    )}

                    <Bloc titre="Historique">
                        <ol className="ad-dv-historique">
                            {d.historique.map((e, i) => (
                                <li key={i} className="ad-dv-historique__etape">
                                    <span className="font-body-strong">{e.libelle}</span>
                                    <span className="font-body ad-dv-muet">
                                        {formatDate(e.date)} · {e.auteur === "AGENCE" ? "agence" : "voyageur"}
                                    </span>
                                    {e.note && <span className="font-body ad-dv-texte">{e.note}</span>}
                                </li>
                            ))}
                        </ol>
                    </Bloc>

                    <Bloc titre="Notes internes">
                        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                            placeholder="Visibles de l'agence seulement" className="ad-dv-saisie font-body" />
                        <button type="button" className="ad-bouton font-body-strong"
                            disabled={envoi.enCours || notes === (d.adminNotes ?? "")}
                            onClick={() => agir(() => noterDevisApi(d.id, notes))}>
                            Enregistrer les notes
                        </button>
                    </Bloc>

                    {envoi.erreur && <p className="ad-erreur font-body" role="alert">{envoi.erreur}</p>}
                </div>

                {mode === null && (
                    <footer className="ad-dv-dossier__pied">
                        {statut === "ENVOYE" && (
                            <button type="button" className="ad-bouton font-body-strong" disabled={envoi.enCours}
                                onClick={() => agir(() => prendreEnChargeDevisApi(d.id))}>
                                Prendre en charge
                            </button>
                        )}
                        {peutProposer && (
                            <button type="button" className="ad-bouton ad-bouton--plein font-body-strong" onClick={() => setMode("proposer")}>
                                {statut === "EXPIRE" ? "Renouveler le devis" : "Rédiger le devis"}
                            </button>
                        )}
                        {(statut === "ENVOYE" || statut === "EN_COURS") && (
                            <button type="button" className="ad-bouton font-body-strong" onClick={() => setMode("decliner")}>
                                Décliner
                            </button>
                        )}
                        {statut === "PROPOSE" && (
                            <p className="font-body ad-dv-muet">Devis envoyé : il attend la réponse du voyageur jusqu'au {formatDateCourte(d.validiteJusquau)}.</p>
                        )}
                        {statut === "ACCEPTE" && (
                            <p className="font-body ad-dv-muet">Accepté : rappelez le voyageur pour finaliser.</p>
                        )}
                    </footer>
                )}
            </aside>
        </div>
    );
}

function Bloc({ titre, children }) {
    return (
        <section className="ad-dv-bloc">
            <p className="ad-dv-surtitre font-body-strong">{titre}</p>
            {children}
        </section>
    );
}

function Ligne({ g, d, fort = false }) {
    return (
        <div className={`ad-dv-ligne${fort ? " ad-dv-ligne--fort" : ""}`}>
            <span className="font-body">{g}</span>
            <span className="font-body-strong">{d}</span>
        </div>
    );
}
