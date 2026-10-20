import { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../../../utils/format";
import Squelette from "./Squelette";
import { B, HEURES_PROMESSE } from "./outils";

const A_TRAITER = ["ENVOYE", "EN_COURS"];

// « il y a 3 h », « il y a 2 j » : l'âge d'une demande se lit mieux qu'une date.
const depuis = (date) => {
    const heures = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000));
    if (heures < 1) return "à l'instant";
    if (heures < 48) return `il y a ${heures} h`;
    return `il y a ${Math.floor(heures / 24)} j`;
};

const heuresDepuis = (date) => (Date.now() - new Date(date).getTime()) / 3_600_000;

// ── Qui attend une réponse ? ──────────────────────────────────────────────

export default function DemandesEnAttente({ devis, chargement }) {
    // Les plus anciennes d'abord : c'est l'ordre de la promesse
    const attente = useMemo(() => devis
        .filter((d) => A_TRAITER.includes(d.statutAffiche))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(0, 6), [devis]);

    return (
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
    );
}
