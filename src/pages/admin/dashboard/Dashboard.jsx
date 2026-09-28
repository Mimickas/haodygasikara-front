import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { findAllDemandesDevisApi, findStatsDevisApi } from "../../../api/admin/demandeDevisApi";
import { findEfficaciteSuggestionsApi, recalculerAssociationsApi } from "../../../api/admin/suggestionsApi";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import { useAuthStore } from "../../../store/authStore";
import { formatDate } from "../../../utils/format";
import { apiErrorMessage } from "../../../utils/apiError";

// ── Le tableau de bord — /admin/haodygasikara ─────────────────────────────
//
// Deux questions, dans cet ordre :
//
//   1. QUI ATTEND UNE RÉPONSE ? Les demandes de devis non traitées, les plus
//      anciennes d'abord — la promesse faite au voyageur est de 48 h.
//   2. LES SUGGESTIONS DU CRÉATEUR SERVENT-ELLES ? Sur ce que l'écran a
//      montré, combien de destinations le voyageur a ajoutées, par source et
//      par destination ; et les paires « souvent associées » du moment.

const B = "/admin/haodygasikara";
const HEURES_PROMESSE = 48;
const A_TRAITER = ["ENVOYE", "EN_COURS"];

// « il y a 3 h », « il y a 2 j » : l'âge d'une demande se lit mieux qu'une date.
const depuis = (date) => {
    const heures = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000));
    if (heures < 1) return "à l'instant";
    if (heures < 48) return `il y a ${heures} h`;
    return `il y a ${Math.floor(heures / 24)} j`;
};

const heuresDepuis = (date) => (Date.now() - new Date(date).getTime()) / 3_600_000;

const pourcent = (taux) => (taux == null ? "—" : `${taux} %`);

// « Bonjour », « Bonsoir » : l'écran s'ouvre sur la même phrase que la personne
// qui entre dans le bureau.
const salutation = () => {
    const h = new Date().getHours();
    if (h < 6) return "Bonne nuit";
    if (h < 18) return "Bonjour";
    return "Bonsoir";
};

export default function Dashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [devis, setDevis] = useState([]);
    const [efficacite, setEfficacite] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    useEffect(() => {
        let actif = true;
        // Chaque bloc vit sa vie : une panne des suggestions ne doit pas
        // masquer les devis à traiter.
        Promise.allSettled([findStatsDevisApi(), findAllDemandesDevisApi(), findEfficaciteSuggestionsApi()])
            .then(([s, d, e]) => {
                if (!actif) return;
                if (s.status === "fulfilled") setStats(s.value?.data ?? null);
                if (d.status === "fulfilled") setDevis(d.value?.data ?? []);
                if (e.status === "fulfilled") setEfficacite(e.value?.data ?? null);
                const echec = [s, d, e].find((r) => r.status === "rejected");
                if (echec) setErreur(apiErrorMessage(echec.reason, "Une partie du tableau de bord n'a pas pu être chargée."));
            })
            .finally(() => actif && setChargement(false));
        return () => { actif = false; };
    }, []);

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
            label: "Taux d'acceptation",
            value: pourcent(stats?.tauxAcceptation),
            hint: `${stats?.acceptes ?? 0} accepté${(stats?.acceptes ?? 0) > 1 ? "s" : ""} sur ${stats?.total ?? 0} demande${(stats?.total ?? 0) > 1 ? "s" : ""}`,
            accent: "var(--brand-nature)",
        },
        {
            label: "Suggestions ajoutées",
            value: pourcent(efficacite?.taux),
            hint: efficacite?.vues
                ? `${efficacite.ajouts} ajout${efficacite.ajouts > 1 ? "s" : ""} sur ${efficacite.vues} suggestion${efficacite.vues > 1 ? "s" : ""} montrée${efficacite.vues > 1 ? "s" : ""}`
                : "aucune suggestion encore montrée",
            accent: "var(--brand-lagune)",
        },
    ], [stats, efficacite]);

    // Les plus anciennes d'abord : c'est l'ordre de la promesse
    const attente = useMemo(() => devis
        .filter((d) => A_TRAITER.includes(d.statutAffiche))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(0, 6), [devis]);

    const enAttente = (stats?.aTraiter ?? 0) + (stats?.enCours ?? 0);

    return <>
        {/* L'écran s'ouvrait sur quatre chiffres, sans un mot pour dire ce
            qu'on regarde. Une phrase d'abord : qui arrive, et ce qui l'attend. */}
        <section className="ad-tb-accueil">
            <h2 className="ad-tb-accueil__titre font-title">
                {salutation()}{user?.prenom ? ` ${user.prenom}` : ""}.
            </h2>
            <p className="ad-tb-accueil__texte font-body">
                {chargement
                    ? "Lecture des demandes en cours…"
                    : enAttente > 0
                        ? `${enAttente} demande${enAttente > 1 ? "s" : ""} de devis attend${enAttente > 1 ? "ent" : ""} une réponse. La promesse faite au voyageur est de ${HEURES_PROMESSE} h.`
                        : "Aucune demande en attente : les voyageurs ont tous eu leur réponse."}
            </p>
        </section>

        <KpiCard items={kpiItems} loading={chargement} />

        {erreur && <p className="ad-erreur" style={{ marginTop: 0, marginBottom: 24 }}>{erreur}</p>}

        <div className="ad-tb-grille">
            <section className="ad-tb-bloc">
                <header className="ad-tb-entete">
                    <div>
                        <p className="ad-dv-surtitre font-body-strong">La question du matin</p>
                        <h2 className="ad-tb-titre font-title">Qui attend une réponse ?</h2>
                    </div>
                    <Link to={`${B}/devis`} className="ad-tb-lien font-body-strong">Toutes les demandes →</Link>
                </header>

                {chargement ? <Squelette lignes={4} /> : attente.length === 0 ? (
                    <p className="ad-tb-vide font-body">Aucune demande en attente : tout est à jour.</p>
                ) : (
                    <ul className="ad-tb-liste">
                        {attente.map((d) => {
                            const enRetard = heuresDepuis(d.createdAt) > HEURES_PROMESSE;
                            const voyageur = [d.client?.prenom, d.client?.nom].filter(Boolean).join(" ") || d.client?.email || "Voyageur";
                            return (
                                <li key={d.id}>
                                    <Link to={`${B}/devis?dossier=${d.id}`} className="ad-tb-demande">
                                        <span className="ad-tb-demande__ref font-body-strong">{d.reference}</span>
                                        <span className="ad-tb-demande__corps">
                                            <span className="font-body-strong">{voyageur}</span>
                                            <span className="ad-tb-muet font-body">{d.circuit?.nom ?? "Circuit"} · {d.nombreVoyageurs ?? "?"} pers.</span>
                                        </span>
                                        <span className={`ad-tb-age font-body-strong${enRetard ? " ad-tb-age--retard" : ""}`}
                                            title={`Reçue le ${formatDate(d.createdAt)}`}>
                                            {depuis(d.createdAt)}
                                        </span>
                                        <span className={`ad-dv-pastille ad-dv-pastille--${d.statutAffiche}`}>{d.statutLibelle ?? d.statutAffiche}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>

            <EfficaciteSources efficacite={efficacite} chargement={chargement} />
        </div>

        <div className="ad-tb-grille">
            <Destinations efficacite={efficacite} chargement={chargement} />
            <Associations efficacite={efficacite} chargement={chargement} onRecalcul={setEfficacite} />
        </div>
    </>;
}

// ── Par source : association, étiquettes, proximité, préférences, agence ──

function EfficaciteSources({ efficacite, chargement }) {
    const sources = efficacite?.parSource ?? [];
    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Créateur de circuit</p>
                    <h2 className="ad-tb-titre font-title">Les suggestions servent-elles ?</h2>
                </div>
            </header>
            {chargement ? <Squelette lignes={4} /> : sources.length === 0 ? (
                <p className="ad-tb-vide font-body">
                    Aucune suggestion n'a encore été montrée. Les chiffres apparaîtront dès que des voyageurs composeront un circuit.
                </p>
            ) : (
                <>
                    <p className="ad-tb-aide font-body">
                        Part des suggestions montrées que le voyageur a ajoutées à son circuit, selon ce qui les a fait proposer.
                    </p>
                    <ul className="ad-tb-barres">
                        {sources.map((s) => (
                            <li key={s.cle} className="ad-tb-barre">
                                <div className="ad-tb-barre__ligne">
                                    <span className="font-body-strong">{s.libelle}</span>
                                    <span className="ad-tb-barre__chiffre font-body-strong">{pourcent(s.taux)}</span>
                                </div>
                                <div className="ad-tb-barre__piste" aria-hidden="true">
                                    <span className="ad-tb-barre__jauge" style={{ width: `${Math.max(s.taux ?? 0, 1)}%` }} />
                                </div>
                                <span className="ad-tb-muet font-body">{s.ajouts} ajout{s.ajouts > 1 ? "s" : ""} · {s.vues} vue{s.vues > 1 ? "s" : ""}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}

// ── Par destination : ce qui convainc le plus ──────────────────────────────

function Destinations({ efficacite, chargement }) {
    const lignes = efficacite?.parDestination ?? [];
    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Par destination</p>
                    <h2 className="ad-tb-titre font-title">Les suggestions qui convainquent</h2>
                </div>
            </header>
            {chargement ? <Squelette lignes={5} /> : lignes.length === 0 ? (
                <p className="ad-tb-vide font-body">Pas encore de mesure par destination.</p>
            ) : (
                <table className="ad-tb-table font-body">
                    <thead>
                        <tr>
                            <th>Destination</th>
                            <th>Vues</th>
                            <th>Ajouts</th>
                            <th>Taux</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lignes.map((l) => (
                            <tr key={l.cle}>
                                <td className="font-body-strong">{l.libelle}</td>
                                <td>{l.vues}</td>
                                <td>{l.ajouts}</td>
                                <td className="ad-tb-table__taux font-body-strong">{pourcent(l.taux)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}

// ── Les paires « souvent associées » et leur recalcul ─────────────────────

function Associations({ efficacite, chargement, onRecalcul }) {
    const [enCours, setEnCours] = useState(false);
    const [message, setMessage] = useState(null);
    const paires = efficacite?.associations ?? [];

    const recalculer = async () => {
        setEnCours(true);
        setMessage(null);
        try {
            const r = await recalculerAssociationsApi();
            onRecalcul(r?.data ?? null);
            setMessage({ ton: "succes", texte: "Associations recalculées sur l'ensemble des circuits." });
        } catch (error) {
            setMessage({ ton: "erreur", texte: apiErrorMessage(error, "Le recalcul a échoué. Réessayez dans un instant.") });
        } finally {
            setEnCours(false);
        }
    };

    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Souvent associées</p>
                    <h2 className="ad-tb-titre font-title">Les destinations qui vont ensemble</h2>
                </div>
            </header>
            <p className="ad-tb-aide font-body">
                Calculées sur tous les circuits, ceux de l'agence comme ceux des voyageurs : chaque nuit à 3 h,
                et autour d'un circuit dès qu'il est enregistré.
            </p>
            {chargement ? <Squelette lignes={4} /> : paires.length === 0 ? (
                <p className="ad-tb-vide font-body">Pas encore assez de circuits pour dégager des paires.</p>
            ) : (
                <ul className="ad-tb-paires">
                    {paires.map((p) => (
                        <li key={`${p.a}-${p.b}`} className="ad-tb-paire">
                            <span className="font-body-strong">{p.a} <span className="ad-tb-muet">+</span> {p.b}</span>
                            <span className="ad-tb-muet font-body">
                                ensemble dans {p.circuits} circuit{p.circuits > 1 ? "s" : ""} · confiance {p.confiance} % · lift {String(p.lift).replace(".", ",")}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <div className="ad-tb-pied">
                <span className="ad-tb-muet font-body">
                    Dernier calcul : {efficacite?.dernierCalcul ? formatDate(efficacite.dernierCalcul) : "jamais"}
                </span>
                <button type="button" className="ad-bouton font-body-strong" onClick={recalculer} disabled={enCours || chargement}>
                    {enCours ? "Calcul en cours…" : "Recalculer maintenant"}
                </button>
            </div>
            {message && (
                <p className={message.ton === "erreur" ? "ad-erreur" : "ad-tb-succes font-body"} role="status">{message.texte}</p>
            )}
        </section>
    );
}

function Squelette({ lignes }) {
    return (
        <div className="ad-tb-squelette" aria-hidden="true">
            {Array.from({ length: lignes }, (_, i) => (
                <div key={i} className="skeleton-box h-4" style={{ borderRadius: 0, width: `${90 - i * 9}%` }} />
            ))}
        </div>
    );
}
