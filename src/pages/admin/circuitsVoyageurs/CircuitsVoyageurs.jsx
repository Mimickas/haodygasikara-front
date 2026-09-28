import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { findCircuitsVoyageursApi, findCircuitVoyageurApi } from "../../../api/admin/circuitsVoyageursApi";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import { parDate, parNombre, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { FaCalendarDays } from "react-icons/fa6";
import { formatDate, formatDateCourte } from "../../../utils/format";
import { apiErrorMessage } from "../../../utils/apiError";
import { libelleStatutDevis } from "../../../constants/client/devis";

// ── Les circuits des voyageurs — /admin/haodygasikara/circuits-voyageurs ──
//
// Ce que les voyageurs composent dans le créateur, en LECTURE SEULE : le
// voyage appartient à son auteur. L'agence y lit l'itinéraire avant de
// chiffrer un devis, et ce qui se compose le plus.
//
// Filtres : l'état du voyage (brouillon, finalisé, devis en cours), la
// période (à venir, passé, dates libres) et une recherche sur le voyageur,
// le nom du voyage ou une destination. ?voyageur=ID restreint à un compte,
// ?circuit=ID ouvre directement un voyage.

const B = "/admin/haodygasikara";

const ETATS = [
    { cle: "TOUS",       libelle: "Tous",               garde: () => true },
    { cle: "BROUILLON",  libelle: "Brouillons",         garde: (c) => c.statut === "BROUILLON" },
    { cle: "FINALISE",   libelle: "Finalisés",          garde: (c) => c.statut === "FINALISE" },
    { cle: "DEVIS",      libelle: "Devis en cours",     garde: (c) => Boolean(c.devis?.vivant) },
];

const PERIODES = [
    { cle: "TOUTES",   libelle: "Toutes les dates" },
    { cle: "AVENIR",   libelle: "Départ à venir" },
    { cle: "PASSE",    libelle: "Voyage passé" },
    { cle: "LIBRES",   libelle: "Dates non fixées" },
];

const aujourdhui = () => new Date().toISOString().slice(0, 10);

const dansPeriode = (c, periode) => {
    if (periode === "LIBRES") return !c.dateArrivee;
    if (periode === "AVENIR") return Boolean(c.dateArrivee) && c.dateArrivee >= aujourdhui();
    if (periode === "PASSE") return Boolean(c.dateDepart ?? c.dateArrivee) && (c.dateDepart ?? c.dateArrivee) < aujourdhui();
    return true;
};

const nomVoyageur = (v) => [v?.prenom, v?.nom].filter(Boolean).join(" ") || v?.email || "Voyageur";

const dates = (arrivee, depart) => (arrivee
    ? `${formatDateCourte(arrivee)}${depart ? ` → ${formatDateCourte(depart)}` : ""}`
    : "Dates non fixées");

const STATUT_VOYAGE = { BROUILLON: "Brouillon", FINALISE: "Finalisé" };

const colonnes = [
    { key: "nom", label: "Voyage", render: (val, row) => (
        <span className="ad-cv-voyage">
            <span className="font-body-strong">{val}</span>
            <span className="ad-tb-muet">{row.destinations.join(" → ") || "Aucune étape"}</span>
        </span>
    ) },
    { key: "voyageur",   label: "Voyageur", render: (val) => nomVoyageur(val), texte: (val) => nomVoyageur(val) },
    { key: "etapes",     label: "Parcours", render: (val, row) => `${val} étape${val > 1 ? "s" : ""} · ${row.nuits} nuit${row.nuits > 1 ? "s" : ""}` },
    { key: "dateArrivee", label: "Dates",   render: (val, row) => dates(val, row.dateDepart), texte: (val, row) => dates(val, row.dateDepart) },
    { key: "statut",     label: "État",     render: (val) => (
        <span className={`ad-dv-pastille ad-cv-pastille--${val}`}>{STATUT_VOYAGE[val] ?? val}</span>
    ), texte: (val) => STATUT_VOYAGE[val] ?? val },
    { key: "devis",      label: "Devis",    render: (val) => val
        ? <span className={`ad-dv-pastille ad-dv-pastille--${val.statut}`}>{val.reference} · {libelleStatutDevis(val.statut)}</span>
        : "—", texte: (val) => val ? `${val.reference} · ${libelleStatutDevis(val.statut)}` : "" },
    { key: "updatedAt",  label: "Modifié le", render: (val) => formatDate(val) },
];

const TRIS = [
    { cle: "RECENTS", libelle: "Modifiés récemment", comparer: parDate("updatedAt") },
    { cle: "DEPART", libelle: "Départ le plus proche", comparer: parDate("dateArrivee", 1) },
    { cle: "LONGS", libelle: "Plus longs", comparer: parNombre("nuits") },
    { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("nom") },
];

export default function CircuitsVoyageurs() {
    const [params, setParams] = useSearchParams();
    const [circuits, setCircuits] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");
    const [periode, setPeriode] = useState("TOUTES");

    const voyageurId = Number(params.get("voyageur")) || null;
    const ouvertId = Number(params.get("circuit")) || null;

    const majParam = (cle, valeur) => setParams((p) => {
        const suite = new URLSearchParams(p);
        if (valeur) suite.set(cle, valeur); else suite.delete(cle);
        return suite;
    }, { replace: true });

    useEffect(() => {
        findCircuitsVoyageursApi()
            .then((r) => setCircuits(r?.data ?? []))
            .catch((error) => setErreur(apiErrorMessage(error, "Les circuits des voyageurs n'ont pas pu être chargés.")))
            .finally(() => setChargement(false));
    }, []);

    const kpiItems = useMemo(() => {
        const voyageurs = new Set(circuits.map((c) => c.voyageur?.id)).size;
        const finalises = circuits.filter((c) => c.statut === "FINALISE").length;
        const avecDevis = circuits.filter((c) => c.devis).length;
        const nuits = circuits.length ? Math.round(circuits.reduce((s, c) => s + c.nuits, 0) / circuits.length) : null;
        return [
            { label: "Voyages composés", value: circuits.length,
                hint: `par ${voyageurs} voyageur${voyageurs > 1 ? "s" : ""}`, accent: "var(--brand-terre)" },
            { label: "Finalisés", value: finalises,
                hint: `${circuits.length - finalises} encore en brouillon`, accent: "var(--brand-nature)" },
            { label: "Avec un devis", value: avecDevis,
                hint: circuits.length ? `${Math.round(avecDevis * 100 / circuits.length)} % des voyages composés` : "aucun voyage composé",
                accent: "var(--brand-ocre)" },
            { label: "Durée moyenne", value: nuits == null ? "—" : `${nuits} nuit${nuits > 1 ? "s" : ""}`,
                hint: "par voyage composé", accent: "var(--brand-lagune)" },
        ];
    }, [circuits]);

    const voyageur = voyageurId ? circuits.find((c) => c.voyageur?.id === voyageurId)?.voyageur : null;
    // Le compte (?voyageur=) et la période restreignent d'abord ; la barre fait le reste
    const perimetre = useMemo(() => circuits
        .filter((c) => !voyageurId || c.voyageur?.id === voyageurId)
        .filter((c) => dansPeriode(c, periode)), [circuits, voyageurId, periode]);
    const liste = useListeAdmin(perimetre, {
        recherche: (c) => [c.nom, c.voyageur?.prenom, c.voyageur?.nom, c.voyageur?.email, ...c.destinations],
        filtres: ETATS,
        tris: TRIS,
        export: { nom: "circuits-des-voyageurs", colonnes },
    });

    return <>
        <Toolbar liste={liste} placeholder="Voyageur, voyage, destination…"
            actions={[{ libelle: "Exporter", onClick: liste.exporter }]}
            enPlus={
                <label className="ad-barre__tri font-body-strong">
                    <FaCalendarDays className="text-xs shrink-0" aria-hidden="true" />
                    <select value={periode} onChange={(e) => setPeriode(e.target.value)} aria-label="Période du voyage">
                        {PERIODES.map((p) => <option key={p.cle} value={p.cle}>{p.libelle}</option>)}
                    </select>
                </label>
            } />

        <BandeauErreur message={erreur} onFermer={() => setErreur("")} />
        <KpiCard items={kpiItems} loading={chargement} />

        {voyageurId && (
            <p className="ad-cv-puce font-body">
                Voyages de <span className="font-body-strong">{voyageur ? nomVoyageur(voyageur) : `compte n° ${voyageurId}`}</span>
                <button type="button" onClick={() => majParam("voyageur", null)} aria-label="Retirer ce filtre">✕</button>
            </p>
        )}

        <DataTable columns={colonnes} data={liste.lignes} loading={chargement} onRowClick={(c) => majParam("circuit", c.id)}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucun voyage composé", texte: "Les voyages que les voyageurs composent dans le créateur apparaîtront ici." }} />

        {ouvertId && <Voyage id={ouvertId} onFermer={() => majParam("circuit", null)} />}
    </>;
}

// ── Le voyage ouvert sur le côté ──────────────────────────────────────────

function Voyage({ id, onFermer }) {
    const [detail, setDetail] = useState(null);
    const [erreur, setErreur] = useState("");

    useEffect(() => {
        let actif = true;
        setDetail(null);
        setErreur("");
        findCircuitVoyageurApi(id)
            .then((r) => actif && setDetail(r?.data ?? null))
            .catch((error) => actif && setErreur(apiErrorMessage(error, "Ce voyage n'a pas pu être chargé.")));
        return () => { actif = false; };
    }, [id]);

    useEffect(() => {
        const echap = (e) => { if (e.key === "Escape") onFermer(); };
        window.addEventListener("keydown", echap);
        return () => window.removeEventListener("keydown", echap);
    }, [onFermer]);

    const c = detail?.circuit;
    const v = detail?.voyageur;
    const nuits = c?.etapes?.reduce((s, e) => s + e.nuits, 0) ?? 0;
    const messages = c?.coherence?.messages ?? [];

    return (
        <div className="ad-dv-voile" onClick={onFermer}>
            <aside className="ad-dv-dossier" onClick={(e) => e.stopPropagation()} aria-label="Voyage du voyageur">
                <header className="ad-dv-dossier__entete">
                    <div>
                        <p className="ad-dv-surtitre font-body-strong">
                            {c ? `Voyage n° ${c.id} · modifié le ${formatDate(c.updatedAt)}` : "Chargement…"}
                        </p>
                        <h2 className="font-title ad-dv-dossier__titre">{c?.nom ?? " "}</h2>
                        {c && <span className={`ad-dv-pastille ad-cv-pastille--${c.statut}`}>{STATUT_VOYAGE[c.statut] ?? c.statut}</span>}
                    </div>
                    <button type="button" className="ad-dv-fermer" onClick={onFermer} aria-label="Fermer">✕</button>
                </header>

                <div className="ad-dv-dossier__corps">
                    {erreur && <p className="ad-erreur">{erreur}</p>}
                    {!c && !erreur && <p className="ad-dv-muet font-body" style={{ padding: "20px 0" }}>Chargement du voyage…</p>}

                    {c && <>
                        <Bloc titre="Le voyageur">
                            <p className="font-body-strong">{nomVoyageur(v)}</p>
                            <p className="font-body"><a href={`mailto:${v?.email}`}>{v?.email}</a></p>
                            {v?.telephone && <p className="font-body"><a href={`tel:${v.telephone}`}>{v.telephone}</a></p>}
                            <Link to={`${B}/circuits-voyageurs?voyageur=${v?.id}`} className="ad-tb-lien font-body-strong" onClick={onFermer}>
                                Tous ses voyages →
                            </Link>
                        </Bloc>

                        <Bloc titre="Le voyage">
                            <Ligne g="Arrivée" d={c.dateArrivee ? formatDateCourte(c.dateArrivee) : "Non fixée"} />
                            <Ligne g="Départ" d={c.dateDepart ? formatDateCourte(c.dateDepart) : "Non fixé"} />
                            <Ligne g="Durée" d={`${c.etapes.length} étape${c.etapes.length > 1 ? "s" : ""} · ${nuits} nuit${nuits > 1 ? "s" : ""}`} />
                        </Bloc>

                        <Bloc titre="L'itinéraire">
                            {c.etapes.length === 0 ? <p className="ad-dv-muet font-body">Aucune étape pour l'instant.</p> : (
                                <ol className="ad-cv-etapes">
                                    {c.etapes.map((e) => (
                                        <li key={e.position} className="ad-cv-etape">
                                            <span className="ad-cv-etape__jours font-body-strong">J{e.jourDebut} → J{e.jourFin}</span>
                                            <span className="ad-cv-etape__corps">
                                                <span className="font-body-strong">{e.destination?.nom}</span>
                                                <span className="ad-dv-muet font-body">
                                                    {e.nuits} nuit{e.nuits > 1 ? "s" : ""}
                                                    {e.kmDepuisPrecedente != null && ` · à ${Math.round(e.kmDepuisPrecedente)} km de l'étape précédente`}
                                                </span>
                                                {e.notes && <span className="font-body ad-dv-texte">« {e.notes} »</span>}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </Bloc>

                        {messages.length > 0 && (
                            <Bloc titre="Cohérence">
                                {messages.map((m, i) => (
                                    <p key={i} className={`font-body ad-cv-message ad-cv-message--${m.niveau}`}>{m.texte}</p>
                                ))}
                            </Bloc>
                        )}

                        <Bloc titre="Demande de devis">
                            {c.devis ? <>
                                <Ligne g={c.devis.reference} d={libelleStatutDevis(c.devis.statut)} />
                                <Link to={`${B}/devis?dossier=${c.devis.id}`} className="ad-tb-lien font-body-strong">Ouvrir le dossier →</Link>
                            </> : (
                                <p className="ad-dv-muet font-body">
                                    {c.statut === "FINALISE"
                                        ? "Voyage finalisé, pas encore de demande de devis."
                                        : "Brouillon : le voyageur doit finaliser son voyage avant de demander un devis."}
                                </p>
                            )}
                        </Bloc>
                    </>}
                </div>
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

function Ligne({ g, d }) {
    return (
        <div className="ad-dv-ligne font-body">
            <span>{g}</span>
            <span>{d}</span>
        </div>
    );
}
