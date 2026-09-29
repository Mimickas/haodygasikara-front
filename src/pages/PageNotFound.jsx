import { Link, useLocation } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import VoilePage from "../components/client/layout/VoilePage";
import { useChargementPage } from "../hooks/design/useChargementPage";

const LOGO = "/img/logo/logo-2-horizontal.png";

// ── La page introuvable ────────────────────────────────────────────────────
//
// Une adresse qui ne mène nulle part rendait un écran VIDE : pas un mot, pas
// un lien. On dit ce qui s'est passé et on rend la main, dans la langue de
// l'accueil — sur-titre en capitales espacées, titre d'affiche, bouton terre.
export default function PageNotFound() {
    const { pathname } = useLocation();
    const { progression, pret } = useChargementPage({ images: [LOGO] });

    return (
        <main className="cx-404">
            <VoilePage progression={progression} pret={pret} />

            <Link to="/" className="cx-404__logo" aria-label="Haodygasikara, retour à l'accueil">
                <img src={LOGO} alt="Haodygasikara" />
            </Link>

            <section className="cx-404__contenu">
                <span className="cx-label cx-label--accent font-body-strong">Erreur 404</span>
                <h1 className="cx-404__titre font-title">Cette page s'est<br />perdue en chemin.</h1>
                <p className="cx-404__texte font-body">
                    L'adresse <span className="cx-404__adresse">{pathname}</span> ne mène à aucune page.
                    Elle a peut-être changé, ou le lien était incomplet.
                </p>
                <div className="cx-404__actions">
                    <Link to="/" className="cx-dv-recap__envoyer font-body-strong">
                        Retour à l'accueil <FaArrowRight size={11} />
                    </Link>
                    <Link to="/circuit" className="cx-dv-lien font-body-strong">Voir les circuits</Link>
                    <Link to="/composer" className="cx-dv-lien font-body-strong">Composer mon voyage</Link>
                </div>
            </section>
        </main>
    );
}
