import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { findCircuitClientById } from "../../../api/client/cricuitApi";
import { circuitLegs, circuitMedias, circuitRoute } from "../../../utils/circuit";
import { useCircuitDetailAnimations } from "../../../hooks/design/animations/circuit/useCircuitDetailAnimations";
import CircuitDetailHero from "./components/hero/CircuitDetailHero";
import CircuitApropos from "./components/apropos/CircuitApropos";
import CircuitRecap from "./components/recap/CircuitRecap";
import CircuitItineraire from "./components/itineraire/CircuitItineraire";

// ── La page detail d'un circuit ───────────────────────────────────────────
// Elle ne fait plus que trois choses : charger le circuit, en tirer les deux
// ou trois lectures partagees, et poser ses sections. Tout le dessin est
// descendu dans components/ — une section par dossier — et les regles dans
// index.css (.cx-about, .cx-iti, .cx-depli, .cx-visites).
//
//   components/hero/       la photo plein cadre et le nom du circuit
//   components/apropos/    l'accroche editoriale
//   components/recap/      ce que comprend le circuit : fiche, decompte, listes
//   components/itineraire/ la liste des haltes, une halte, une journee,
//                          ses visites, sa planche photo
//   components/shared/     la mention (valeur + legende), partagee
//
// Ce que le back envoie et qu'on ne recalcule donc pas : `dureeJours` (la
// duree du circuit), `premierJour` (le jour ou commence une etape) et
// `jourCircuit` (le jour du voyage, pas celui de l'etape).
export default function CircuitDetail() {
    const { id } = useParams();
    const [circuit, setCircuit] = useState(null);

    const loadCircuit = useCallback(async () => {
        try {
            const res = await findCircuitClientById(id);
            setCircuit(res?.data ?? null);
        } catch (error) {
            console.error("Chargement du circuit impossible", error);
        }
    }, [id]);

    useEffect(() => { loadCircuit(); }, [loadCircuit]);

    // Les animations de toute la page. Le hook ne touche AUCUN dessin : il se
    // branche sur les classes existantes et ne fait bouger qu'`opacity` et
    // `transform`, qu'il retire une fois jouées. Retirer cette ligne retire
    // toute la chorégraphie, et il ne reste rien.
    useCircuitDetailAnimations(Boolean(circuit));

    const jours = circuit?.dureeJours ?? 0;
    const { depart, arrivee } = circuitRoute(circuit) || {};
    const etapes = circuitLegs(circuit);

    // La planche photo de la section « Le voyage ». circuitMedias ouvre sur la
    // couverture du circuit : on la saute, elle occupe deja tout le hero et la
    // reposer trente lignes plus bas ne montrerait rien de neuf. Restent les
    // visuels des etapes, et le film s'il y en a un.
    const visuels = circuitMedias(circuit, 4).slice(1);

    return (
        <>
            <CircuitDetailHero
                circuit={circuit}
                days={jours}
                depart={depart}
                arrivee={arrivee}
            />

            {/* .cx-detail ne dessine rien : il porte --cx-gutter, la gouttiere
                que l'« A propos » et l'itineraire partagent pour rester
                alignes a toutes les largeurs. */}
            <div className="cx-detail">
                <CircuitApropos notes={circuit?.notes} />

                {/* Avant l'itineraire, et c'est voulu : « est-ce que ce voyage
                    est pour moi ? » se repond avant qu'on demande au lecteur
                    d'avaler quinze jours de programme. */}
                <CircuitRecap
                    recap={circuit?.recap}
                    fiche={circuit?.fiche}
                    tags={circuit?.tags ?? []}
                    visuels={visuels}
                    duree={jours}
                />

                <CircuitItineraire
                    etapes={etapes}
                    jours={jours}
                    depart={depart}
                    arrivee={arrivee}
                    circuitId={id}
                />
            </div>
        </>
    );
}
