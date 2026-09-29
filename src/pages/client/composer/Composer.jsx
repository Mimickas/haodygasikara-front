import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useComposer } from "../../../hooks/client/composer/useComposer";
import { useGlisserAjout } from "../../../hooks/client/composer/useGlisserAjout";
import { useComposerIntro } from "../../../hooks/design/animations/composer/useComposerIntro";
import { useEnvolEtape } from "../../../hooks/design/animations/composer/useEnvolEtape";
import { useChargementPage } from "../../../hooks/design/useChargementPage";
import PanneauVoyage from "./components/PanneauVoyage";
import Atlas from "./components/Atlas";
import FicheDestination from "./components/FicheDestination";
import BandeauAnnuler from "./components/BandeauAnnuler";

// ── Composer son circuit — /composer et /composer/:id ──────────────────────
//
// La page parle la langue de l'accueil et de /circuit : une colonne de sable
// à gauche, la photographie à droite.
//   * À GAUCHE, VOTRE VOYAGE : son nom écrit en grand, ses dates, ses nuits,
//     et les étapes numérotées comme les « trois gestes » de l'accueil.
//   * À DROITE, L'ATLAS : les destinations en photographies, qu'on glisse
//     dans le voyage ou qu'on ajoute d'un « + » ; ou la carte du tracé.
//
// Tout geste est immédiat à l'écran ; le serveur vérifie la cohérence dans la
// foulée et c'est lui qui décide si le circuit peut partir en devis. Sur
// téléphone, les deux moitiés deviennent trois onglets.

const ONGLETS = [
    { cle: "voyage", libelle: "Votre voyage" },
    { cle: "destinations", libelle: "Destinations" },
    { cle: "carte", libelle: "Carte" },
];

const PANNEAUX_RIDEAU = 6;
const PHOTOS_AVANT_OUVERTURE = 6;

export default function Composer() {
    const { id } = useParams();
    const c = useComposer(id ? Number(id) : null);
    const [fiche, setFiche] = useState(null);
    const [survol, setSurvol] = useState(null);
    const [onglet, setOnglet] = useState("destinations");

    // Le rideau attend le circuit, le catalogue ET les premières photos : sans
    // elles, la révélation se jouerait sur des cadres vides. C'est l'attente de
    // toutes les pages du site (useChargementPage) ; seul le costume change —
    // ici le rideau à six panneaux, ailleurs le voile au compteur.
    const donneesPretes = !c.chargement && !c.catalogue.chargement;
    const premieresPhotos = useMemo(
        () => c.catalogue.destinations.slice(0, PHOTOS_AVANT_OUVERTURE).map((d) => d.image).filter(Boolean),
        [c.catalogue.destinations],
    );
    const { pret } = useChargementPage({ donneesPretes, images: donneesPretes ? premieresPhotos : null });

    const zoneRef = useRef(null);
    const listeRef = useRef(null);
    const envol = useEnvolEtape();
    const scope = useComposerIntro(pret);

    const ajouter = useCallback((destination, index) => c.actions.ajouter(destination, index), [c.actions]);
    const ajouterDepuisPhoto = useCallback((destination, photo) => {
        envol.preparer(photo, destination.image);
        c.actions.ajouter(destination);
    }, [c.actions, envol]);

    const { carteProps, glisse, insertion } = useGlisserAjout({
        zoneRef, listeRef,
        onDeposer: ajouter,
        onClic: setFiche,
    });

    // Stable : le bandeau relance son minuteur quand ce rappel change.
    const { setAnnulable } = c;
    const fermerBandeau = useCallback(() => setAnnulable(null), [setAnnulable]);

    const location = useLocation();
    if (c.erreurChargement) {
        return (
            <div className="cx-cp-erreur" data-header-text="var(--text-primary)">
                <span className="cx-cp-surtitre">Votre voyage</span>
                <p className="cx-cp-erreur__titre">{c.erreurChargement}</p>
                {/* Sans compte, le seul geste utile est de se connecter — puis revenir ici */}
                {c.isAuthenticated
                    ? <Link to="/mes-circuits" className="cx-cp-lien-espace">Retour à mes circuits</Link>
                    : <Link to="/login" state={{ from: location.pathname }} className="cx-cp-lien-espace">Se connecter</Link>}
            </div>
        );
    }

    const nbEtapes = c.circuit.etapes.length;

    return (
        <div ref={scope} className={`cx-cp${c.verrouille ? " cx-cp--verrouille" : ""}`} data-onglet={onglet} data-header-text="var(--text-primary)">
            <div className="cx-cp-rideau" data-cp-rideau aria-hidden="true">
                {Array.from({ length: PANNEAUX_RIDEAU }, (_, i) => <span key={i} data-cp-panneau />)}
                <div className="cx-cp-rideau__attente" data-cp-attente>
                    <span className="cx-cp-surtitre">Haodygasikara</span>
                    <span className="cx-cp-rideau__filet" />
                </div>
            </div>

            {/* Le titre de la page, pour les lecteurs d'écran : à l'écran, c'est le
                nom du voyage (un champ) qui tient ce rôle. */}
            <h1 className="sr-only">Créateur de circuit</h1>

            <nav className="cx-cp-onglets" aria-label="Sections du créateur">
                {ONGLETS.map((o) => (
                    <button key={o.cle} type="button" aria-pressed={onglet === o.cle}
                        className={`cx-cp-onglet${onglet === o.cle ? " cx-cp-onglet--actif" : ""}`}
                        onClick={() => setOnglet(o.cle)}>
                        {o.libelle}
                        {o.cle === "voyage" && nbEtapes > 0 && (
                            <sup key={nbEtapes} className="cx-cp-onglet__compte">{String(nbEtapes).padStart(2, "0")}</sup>
                        )}
                    </button>
                ))}
            </nav>

            <PanneauVoyage
                c={c}
                pret={pret}
                zoneRef={zoneRef}
                listeRef={listeRef}
                insertion={insertion}
                glisse={glisse}
                survol={survol}
                onSurvol={setSurvol}
                envol={envol}
            />

            <Atlas
                vue={onglet === "carte" ? "carte" : "destinations"}
                onVue={setOnglet}
                c={c}
                pret={pret}
                // Verrouillé : une photo ne se glisse plus dans le voyage, un clic ouvre sa fiche
                carteProps={c.verrouille ? (d) => ({ onClick: () => setFiche(d) }) : carteProps}
                glisse={glisse}
                onAjouter={ajouterDepuisPhoto}
                onOuvrir={setFiche}
                survol={survol}
                onSurvol={setSurvol}
            />

            {fiche && <FicheDestination destination={fiche} onFermer={() => setFiche(null)}
                onAjouter={c.verrouille ? null : (d) => ajouter(d)} />}
            <BandeauAnnuler annulable={c.annulable} onAnnuler={c.annuler} onFermer={fermerBandeau} />
        </div>
    );
}
