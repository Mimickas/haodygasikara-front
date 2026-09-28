import { useMemo, useRef, useState } from "react";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import CarteDestination from "./CarteDestination";
import FiltresEtiquettes from "./FiltresEtiquettes";
import TriCatalogue from "./TriCatalogue";
import { useGalerieVivante } from "../../../../hooks/design/animations/composer/useGalerieVivante";

// La galerie des destinations : une barre d'outils (chercher, filtrer, trier)
// qui reste en haut pendant qu'on fait défiler, puis les photographies.
//
// Les suggestions du serveur (« souvent associées à vos étapes ») ne forment
// pas un bloc à part : la carte concernée porte la mention « Suggérée », et
// la raison s'affiche au survol.
//
// L'ORDRE ATTEND QUE LA SOURIS PARTE. La pertinence dépend de la dernière
// étape : chaque ajout réordonne la galerie. Réordonnée sous le curseur, la
// carte visée par un second clic ne serait plus la même. Tant que la souris
// est sur la galerie, les cartes gardent donc leur place (leurs états, eux,
// se mettent à jour) ; le nouvel ordre se joue, animé, dès qu'elle en sort.
// Un filtre ou une recherche, gestes du voyageur, s'appliquent tout de suite.

// Les premières photos sont chargées tout de suite (le rideau les attend),
// les suivantes à l'approche du défilement.
const PHOTOS_PRIORITAIRES = 6;

const memeEnsemble = (a, b) => a.length === b.length && b.every((id) => a.includes(id));

export default function Catalogue({
    filtres, setFiltres, catalogue, suggestions, pret,
    carteProps, glisse, onAjouter, onOuvrir,
}) {
    const defileRef = useRef(null);
    const grilleRef = useRef(null);

    const destinations = catalogue.destinations;
    const ids = destinations.map((d) => d.id);
    const cleServeur = ids.join(",");
    const cleFiltres = `${filtres.q}|${filtres.tags.join(",")}|${filtres.tri}`;

    // L'ordre affiché, et les filtres qui l'ont produit : un nouvel ordre venu
    // d'un changement de filtre est un geste du voyageur, il passe toujours.
    const [survolee, setSurvolee] = useState(false);
    const [vue, setVue] = useState({ cle: cleServeur, filtres: cleFiltres, ordre: ids });
    if (cleServeur !== vue.cle) {
        const geste = cleFiltres !== vue.filtres;
        const figer = survolee && !geste && memeEnsemble(vue.ordre, ids);
        setVue({ cle: cleServeur, filtres: cleFiltres, ordre: figer ? vue.ordre : ids });
    }

    const affichees = useMemo(() => {
        const parId = new Map(destinations.map((d) => [d.id, d]));
        return memeEnsemble(vue.ordre, [...parId.keys()]) ? vue.ordre.map((id) => parId.get(id)) : destinations;
    }, [destinations, vue.ordre]);

    const suggerees = useMemo(() => new Map(suggestions.map((s) => [s.destination.id, s])), [suggestions]);
    useGalerieVivante({ defileRef, grilleRef, cle: affichees.map((d) => d.id).join(","), pret });

    const basculerTag = (id) => setFiltres((f) => ({
        ...f, tags: f.tags.includes(id) ? f.tags.filter((t) => t !== id) : [...f.tags, id],
    }));
    const effacer = () => setFiltres((f) => ({ ...f, q: "", tags: [] }));
    const vide = !catalogue.chargement && catalogue.total === 0;

    return (
        <div ref={defileRef} className="cx-cp-catalogue" data-lenis-prevent
            onPointerEnter={(e) => { if (e.pointerType === "mouse") setSurvolee(true); }}
            onPointerLeave={() => { setSurvolee(false); setVue((v) => ({ ...v, ordre: ids })); }}>
            <div className="cx-cp-outils" data-cp-apparait>
                <label className="cx-cp-recherche">
                    <FaMagnifyingGlass size={11} className="cx-cp-recherche__icone" />
                    <input type="search" value={filtres.q}
                        onChange={(e) => setFiltres((f) => ({ ...f, q: e.target.value }))}
                        placeholder="Rechercher" className="cx-cp-recherche__champ"
                        aria-label="Rechercher une destination" />
                    {filtres.q && (
                        <button type="button" className="cx-cp-recherche__effacer" aria-label="Effacer la recherche"
                            onClick={() => setFiltres((f) => ({ ...f, q: "" }))}>
                            <FaXmark size={11} />
                        </button>
                    )}
                </label>

                <FiltresEtiquettes facettes={catalogue.facettes} actifs={filtres.tags}
                    onBasculer={basculerTag} onEffacer={() => setFiltres((f) => ({ ...f, tags: [] }))} />

                <TriCatalogue tri={filtres.tri} onChange={(tri) => setFiltres((f) => ({ ...f, tri }))} />
            </div>

            {vide ? (
                <div className="cx-cp-catalogue__vide">
                    <p className="cx-cp-catalogue__vide-titre">Aucune destination ne correspond.</p>
                    <button type="button" className="cx-cp-lien-espace" onClick={effacer}>Tout afficher</button>
                </div>
            ) : (
                <ul ref={grilleRef} className={`cx-cp-grille${catalogue.chargement ? " cx-cp-grille--attente" : ""}`}>
                    {affichees.map((d, i) => (
                        <CarteDestination
                            key={d.id}
                            destination={d}
                            prioritaire={i < PHOTOS_PRIORITAIRES}
                            suggestion={suggerees.get(d.id)}
                            avecDistance={filtres.tri === "PROXIMITE"}
                            glisseProps={carteProps(d)}
                            glissee={glisse?.id === d.id}
                            onAjouter={onAjouter}
                            onOuvrir={onOuvrir}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
