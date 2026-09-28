import { FaArrowRight } from "react-icons/fa6";
import LienPanneau from "./LienPanneau";
import { CONTACT } from "../../../../constants/client/contact";

// ── Le menu ────────────────────────────────────────────────────────────────
//
// Trois liens en serif d'affiche, une phrase sous chacun, et les coordonnées
// en pied. Rien ne bouge au survol que la couleur : pas d'image qui suit le
// curseur, pas de texte qui glisse — le menu se lit, il ne se donne pas en
// spectacle.
const LIENS = [
    { libelle: "Découvrir", vers: "/", note: "Notre façon de composer un voyage, geste après geste." },
    { libelle: "Circuits", vers: "/circuit", note: "Les itinéraires de l'agence, à reprendre ou à personnaliser." },
    { libelle: "Composer", vers: "/composer", note: "Votre voyage, étape par étape, sur la carte de Madagascar." },
];

export default function MenuPanel({ onNaviguer }) {
    return (
        <div className="cx-menu">
            <nav className="cx-menu__liens" aria-label="Navigation principale">
                {LIENS.map(({ libelle, vers, note }) => (
                    <div key={vers} data-panel-item>
                        <LienPanneau to={vers} onNaviguer={onNaviguer} className="cx-menu__lien">
                            <span className="min-w-0">
                                <span className="cx-menu__titre font-title">{libelle}</span>
                                <span className="cx-menu__note font-body">{note}</span>
                            </span>
                            <FaArrowRight className="cx-menu__fleche" aria-hidden="true" />
                        </LienPanneau>
                    </div>
                ))}
            </nav>

            <div className="cx-menu__pied">
                <div data-panel-item>
                    <p className="cx-label cx-label--accent font-body-strong">Nous écrire</p>
                    <a href={`mailto:${CONTACT.email}`} className="cx-menu__contact font-body">{CONTACT.email}</a>
                    <a href={`tel:${CONTACT.telHref}`} className="cx-menu__contact cx-menu__contact--pale font-body">{CONTACT.tel}</a>
                </div>
                <div data-panel-item>
                    <p className="cx-label cx-label--accent font-body-strong">Nous trouver</p>
                    {CONTACT.adresse.map((ligne) => (
                        <p key={ligne} className="cx-menu__contact cx-menu__contact--pale font-body">{ligne}</p>
                    ))}
                </div>
                <div data-panel-item className="cx-menu__promesse">
                    <p className="cx-label cx-label--legende font-body-strong">Devis sur mesure sous 48 h</p>
                </div>
            </div>
        </div>
    );
}
