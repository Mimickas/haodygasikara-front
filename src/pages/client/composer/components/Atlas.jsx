import { lazy, Suspense, useState } from "react";
import Catalogue from "./Catalogue";

// La carte et son moteur — Mapbox GL, 1,8 Mo à lui seul — partent dans leur
// propre paquet, téléchargé à la première ouverture du volet.
//
// Le composant n'était monté qu'à ce moment-là, mais son CODE arrivait avec la
// page : ouvrir le créateur coûtait Mapbox même sans jamais regarder la carte.
// C'est ce que le commentaire ci-dessous promettait déjà — c'est maintenant
// vrai du chargement aussi, et plus seulement de l'instance.
const CarteParcours = lazy(() => import("./CarteParcours"));

// ── La moitié droite : l'atlas ─────────────────────────────────────────────
//
// Deux vues, dont les titres servent d'onglets — « Destinations » et
// « Carte », écrits en serif comme les liens du menu : le mot actif est à
// l'encre, l'autre pâlit. La carte se pose PAR-DESSUS la galerie (un volet
// qui s'ouvre de droite à gauche) : revenir aux destinations retrouve la
// galerie exactement où on l'avait laissée.
//
// La carte n'est créée qu'à sa première ouverture : un voyageur qui ne la
// regarde pas ne paie pas son chargement.

const deux = (n) => String(n).padStart(2, "0");

export default function Atlas({ vue, onVue, c, pret, carteProps, glisse, onAjouter, onOuvrir, survol, onSurvol }) {
    const { filtres, setFiltres, catalogue, suggestions, circuit } = c;

    const [carteOuverte, setCarteOuverte] = useState(vue === "carte");
    if (vue === "carte" && !carteOuverte) setCarteOuverte(true);

    return (
        <section className="cx-cp-atlas" data-vue={vue} aria-label="Destinations et carte">
            <div className="cx-cp-atlas__tete">
                <div className="cx-cp-vues" role="tablist" aria-label="Affichage">
                    <button type="button" role="tab" aria-selected={vue === "destinations"}
                        className={`cx-cp-vue${vue === "destinations" ? " cx-cp-vue--active" : ""}`}
                        onClick={() => onVue("destinations")}>
                        <span className="cx-cp-masque"><span data-cp-vue className="cx-cp-vue__mot">Destinations</span></span>
                        <sup className="cx-cp-vue__compte">{catalogue.chargement && !catalogue.total ? "··" : deux(catalogue.total)}</sup>
                    </button>
                    <button type="button" role="tab" aria-selected={vue === "carte"}
                        className={`cx-cp-vue${vue === "carte" ? " cx-cp-vue--active" : ""}`}
                        onClick={() => onVue("carte")}>
                        <span className="cx-cp-masque"><span data-cp-vue className="cx-cp-vue__mot">Carte</span></span>
                    </button>
                </div>
            </div>

            <div className="cx-cp-atlas__corps">
                <Catalogue
                    filtres={filtres}
                    setFiltres={setFiltres}
                    catalogue={catalogue}
                    suggestions={suggestions}
                    pret={pret}
                    carteProps={carteProps}
                    glisse={glisse}
                    onAjouter={c.verrouille ? null : onAjouter}
                    onOuvrir={onOuvrir}
                />
                {carteOuverte && (
                    // `null` en attente : le volet s'ouvre sur son fond, et la
                    // carte s'y pose quand elle arrive. Un indicateur de
                    // chargement à cet endroit se verrait plus que l'attente.
                    <Suspense fallback={null}>
                        <CarteParcours
                            visible={vue === "carte"}
                            etapes={circuit.etapes}
                            destinations={catalogue.destinations}
                            survol={survol}
                            onSurvol={onSurvol}
                            onOuvrir={onOuvrir}
                        />
                    </Suspense>
                )}
            </div>
        </section>
    );
}
