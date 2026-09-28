import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ChampDates from "./ChampDates";
import JaugeNuits from "./JaugeNuits";
import Itineraire from "./Itineraire";
import AlertesCoherence from "./AlertesCoherence";
import ActionsVoyage from "./ActionsVoyage";
import { STATUTS_CIRCUIT } from "../../../../constants/client/composer";
import { libelleStatutDevis } from "../../../../constants/client/devis";

// ── La colonne de sable : votre voyage ─────────────────────────────────────
//
// Construite comme la colonne « Territoires » de l'accueil : un sur-titre
// espacé, un titre au format d'affiche (ici, le nom du voyage, qu'on écrit
// directement), puis ce qui s'y rattache — dates, nuits, étapes. Les deux
// gestes qui comptent (devis, enregistrer) restent posés en pied.

export default function PanneauVoyage({ c, pret, zoneRef, listeRef, insertion, glisse, survol, onSurvol, envol }) {
    const { circuit, actions, sauvegarde, coherence, nuitsPrevues, planifiees, isAuthenticated, verrouille } = c;

    return (
        <aside className="cx-cp-voyage" aria-label="Votre voyage">
            <div className="cx-cp-voyage__defile" data-composer-scroller data-lenis-prevent>
                <div className="cx-cp-voyage__surtitres">
                    <span className="cx-cp-masque">
                        <span data-cp-kicker className="cx-cp-surtitre">Votre voyage</span>
                    </span>
                    <span className="cx-cp-masque">
                        <span data-cp-kicker className="cx-cp-surtitre cx-cp-surtitre--discret" aria-live="polite">
                            {verrouille
                                ? libelleStatutDevis(circuit.devis.statut)
                                : <EtatSauvegarde circuit={circuit} sauvegarde={sauvegarde} isAuthenticated={isAuthenticated} />}
                        </span>
                    </span>
                </div>

                <TitreVoyage valeur={circuit.nom} onChange={actions.nom} lectureSeule={verrouille} />

                <div data-cp-apparait className="cx-cp-voyage__dates">
                    <ChampDates arrivee={circuit.dateArrivee} depart={circuit.dateDepart} onChange={actions.dates}
                        desactive={verrouille} />
                </div>

                <div data-cp-apparait>
                    <JaugeNuits etapes={circuit.etapes} prevues={nuitsPrevues} planifiees={planifiees}
                        onRepartir={verrouille ? null : actions.repartir} />
                </div>

                {verrouille && circuit.devis?.raison && (
                    <p data-cp-apparait className="cx-cp-verrou">{circuit.devis.raison}</p>
                )}

                <Itineraire
                    circuit={circuit}
                    actions={actions}
                    pret={pret}
                    zoneRef={zoneRef}
                    listeRef={listeRef}
                    insertion={insertion}
                    glisse={glisse}
                    survol={survol}
                    onSurvol={onSurvol}
                    envol={envol}
                    verrouille={verrouille}
                />

                {!verrouille && <AlertesCoherence coherence={coherence} onSurvolEtape={onSurvol} />}
            </div>

            <ActionsVoyage
                circuit={circuit}
                sauvegarde={sauvegarde}
                coherence={coherence}
                isAuthenticated={isAuthenticated}
                verrouille={verrouille}
                onEnregistrer={() => c.enregistrer()}
                onDevis={c.demanderDevis}
                onDupliquer={c.dupliquer}
            />
        </aside>
    );
}

// Le nom du voyage, au format d'affiche. Un <textarea> et non un <input> :
// un nom long passe à la ligne comme un titre, au lieu de fuir hors du cadre.
// Entrée valide, sans jamais insérer de retour à la ligne.
function ajusterHauteur(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
}

function TitreVoyage({ valeur, onChange, lectureSeule }) {
    const ref = useRef(null);

    useLayoutEffect(() => ajusterHauteur(ref.current), [valeur]);

    // Mesuré pendant que sa colonne est masquée (onglets du téléphone), le
    // champ aurait une hauteur nulle : on le remesure dès que sa largeur change.
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        let largeur = el.offsetWidth;
        const observateur = new ResizeObserver(() => {
            if (el.offsetWidth === largeur) return;
            largeur = el.offsetWidth;
            ajusterHauteur(el);
        });
        observateur.observe(el);
        return () => observateur.disconnect();
    }, []);

    return (
        <div className="cx-cp-masque cx-cp-voyage__titre-cadre">
            <textarea
                ref={ref}
                data-cp-titre
                rows={1}
                className="cx-cp-voyage__titre"
                value={valeur}
                readOnly={lectureSeule}
                onChange={(e) => onChange(e.target.value.replace(/\s*\n\s*/g, " "))}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                    }
                }}
                placeholder="Nommez votre voyage"
                maxLength={120}
                aria-label="Nom du voyage"
                spellCheck={false}
            />
        </div>
    );
}

// Une ligne, dans le sur-titre : l'état du circuit ou de son enregistrement.
function EtatSauvegarde({ circuit, sauvegarde, isAuthenticated }) {
    // Rafraîchit l'heure affichée sans rien demander au serveur.
    const [, setTic] = useState(0);
    useEffect(() => {
        if (!sauvegarde.derniere) return undefined;
        const t = setInterval(() => setTic((n) => n + 1), 60000);
        return () => clearInterval(t);
    }, [sauvegarde.derniere]);

    if (sauvegarde.enCours) return "Enregistrement…";
    if (sauvegarde.erreur) return "Non enregistré";
    if (sauvegarde.modifie && isAuthenticated && circuit.id) return "Modifié";
    if (sauvegarde.derniere) {
        const heure = new Date(sauvegarde.derniere).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        return `Enregistré à ${heure}`;
    }
    return (STATUTS_CIRCUIT[circuit.statut] ?? STATUTS_CIRCUIT.BROUILLON).libelle;
}
