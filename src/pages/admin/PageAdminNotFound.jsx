import { useNavigate } from "react-router-dom";

// Une adresse inconnue sous /admin : la page reste dans le cadre de
// l'administration (barre latérale, en-tête) et propose deux gestes.
export default function PageAdminNotFound() {
    const navigate = useNavigate();

    return (
        <section className="ad-introuvable">
            <p className="cx-label cx-label--accent font-body-strong">Erreur 404</p>
            <h2 className="ad-introuvable__titre font-title">Page introuvable</h2>
            <p className="ad-introuvable__texte font-body">
                Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez au tableau de bord.
            </p>
            <div className="ad-introuvable__gestes">
                <button type="button" className="ad-bouton font-body-strong" onClick={() => navigate(-1)}>Retour</button>
                <button type="button" className="ad-bouton ad-bouton--plein font-body-strong" onClick={() => navigate("/admin/haodygasikara")}>
                    Tableau de bord
                </button>
            </div>
        </section>
    );
}
