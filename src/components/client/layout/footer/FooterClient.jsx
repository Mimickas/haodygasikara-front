import { Link } from "react-router-dom";
import { CONTACT } from "../../../../constants/client/contact";

// Le pied de page : la marque, les coordonnées, trois liens. Sur-titres en
// capitales espacées et filets d'un pixel, comme le reste du site.
const LIENS = [
    { label: "Accueil", to: "/" },
    { label: "Circuits", to: "/circuit" },
    { label: "Créer mon circuit", to: "/composer" },
];

export default function FooterClient() {
    return (
        <footer className="cx-pied">
            <div className="cx-pied__grille">
                <div className="cx-pied__marque">
                    <img src="/img/logo/logo-2-horizontal.png" alt="Haodygasikara" className="cx-pied__logo" />
                    <p className="cx-pied__texte font-body">
                        Tour-opérateur basé à Toamasina, spécialiste d'un Madagascar authentique, éthique et solidaire.
                    </p>
                </div>

                <div>
                    <p className="cx-label cx-label--accent font-body-strong">Nous contacter</p>
                    <p className="cx-pied__texte font-body">{CONTACT.adresse.join(", ")}</p>
                    <a href={`tel:${CONTACT.telHref}`} className="cx-pied__lien font-body">{CONTACT.tel}</a>
                    <a href={`mailto:${CONTACT.email}`} className="cx-pied__lien font-body">{CONTACT.email}</a>
                </div>

                <nav aria-label="Pied de page">
                    <p className="cx-label cx-label--accent font-body-strong">Explorer</p>
                    {LIENS.map((lien) => (
                        <Link key={lien.to} to={lien.to} className="cx-pied__lien font-body">{lien.label}</Link>
                    ))}
                </nav>
            </div>

            <p className="cx-pied__signature font-body">
                © {new Date().getFullYear()} Haodygasikara — Le voyage est un partage
            </p>
        </footer>
    );
}
