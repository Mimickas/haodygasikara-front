import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { actionDemandeVivante } from "../../../../constants/client/devis";

// Le pied de la colonne : le bouton de marque (celui de « Voir la sélection »
// sur /circuit) et un lien en capitales. Rien d'autre.

export default function ActionsVoyage({ circuit, sauvegarde, coherence, isAuthenticated, verrouille, onEnregistrer, onDevis, onDupliquer }) {
    // Un voyage tenu par un devis : le seul geste utile est d'aller au devis,
    // ou d'en composer une variante. « Demander un devis » n'a plus de sens.
    if (verrouille) {
        return (
            <div className="cx-cp-actions" data-cp-apparait>
                {sauvegarde.erreur && <p className="cx-cp-actions__erreur" role="alert">{sauvegarde.erreur}</p>}
                <div className="cx-cp-actions__ligne">
                    <Link to="/mes-devis" className="cx-cp-cta">
                        <span>{actionDemandeVivante(circuit.devis?.statut)}</span>
                        <FaArrowRight size={11} />
                    </Link>
                    <button type="button" className="cx-cp-lien-espace" disabled={sauvegarde.enCours} onClick={onDupliquer}>
                        Dupliquer
                    </button>
                </div>
            </div>
        );
    }

    const finalisable = Boolean(coherence?.finalisable);
    const raison = coherence?.messages?.find((m) => m.niveau === "ERREUR")?.texte
        ?? "Composez votre voyage pour demander un devis";
    const rienANouveau = !sauvegarde.modifie && Boolean(circuit.id);

    return (
        <div className="cx-cp-actions" data-cp-apparait>
            {sauvegarde.erreur && <p className="cx-cp-actions__erreur" role="alert">{sauvegarde.erreur}</p>}
            <div className="cx-cp-actions__ligne">
                <button type="button" className="cx-cp-cta"
                    disabled={sauvegarde.enCours || !finalisable}
                    title={finalisable ? undefined : raison}
                    onClick={onDevis}>
                    <span>Demander un devis</span>
                    <FaArrowRight size={11} />
                </button>

                <button type="button" className="cx-cp-lien-espace"
                    disabled={sauvegarde.enCours || rienANouveau}
                    title={isAuthenticated ? undefined : "Connectez-vous pour garder ce voyage dans votre compte"}
                    onClick={onEnregistrer}>
                    Enregistrer
                </button>

                {isAuthenticated && (
                    <Link to="/mes-circuits" className="cx-cp-lien-espace cx-cp-lien-espace--discret">Mes circuits</Link>
                )}
            </div>
        </div>
    );
}
