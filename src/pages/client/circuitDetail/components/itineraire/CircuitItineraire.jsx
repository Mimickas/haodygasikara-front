import { useCallback, useEffect, useState } from "react";
import EtapeLigne from "./EtapeLigne";

// ── L'itineraire ──────────────────────────────────────────────────────────
// Un mot en tete de section, tres grand, chasse serree, et son compte en
// exposant. Puis des lignes pleine largeur separees par un filet franc : ni
// serif a fort contraste, ni etoiles, ni bornes encadrees — le verdict du
// client sur la premiere version tenait en une phrase, « je trouve pas du tout
// que c'est luxe, je trouve que c'est vieux ». Le detail du raisonnement est
// range avec les regles, dans index.css.
//
// L'etat vit ici et pas dans la page : quelle halte est ouverte ne regarde que
// cette liste.
export default function CircuitItineraire({ etapes = [], jours, depart, arrivee, circuitId }) {
    // On garde la CLE de la halte depliee, pas son objet : l'objet d'origine
    // devient perime des que le circuit est recharge, et la comparaison
    // d'identite laissait alors la ligne ouverte sur du vide.
    const [ouverte, setOuverte] = useState(null);

    // Un autre circuit, une autre liste : on referme.
    useEffect(() => { setOuverte(null); }, [circuitId]);

    const basculer = useCallback((cle) => {
        setOuverte((actuelle) => (actuelle === cle ? null : cle));
    }, []);

    if (!etapes.length) return null;

    return (
        <section className="cx-iti" data-header-text="var(--text-primary)">
            <header className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
                <h2 className="cx-iti__titre font-title flex items-start gap-3">
                    Itin&eacute;raire
                    <span className="cx-iti__exposant font-body-strong tabular-nums">
                        {String(etapes.length).padStart(2, "0")}
                    </span>
                </h2>
                <p className="cx-iti__intro font-body-strong">
                    {jours > 0 && <>{jours} jours</>}
                    {jours > 0 && depart && arrivee && <span className="mx-3 opacity-50">/</span>}
                    {depart && arrivee && <>{depart} &rarr; {arrivee}</>}
                </p>
            </header>

            <ol className="cx-legs">
                {etapes.map(({ step, index, duree, debut, fin }) => {
                    const cle = step?.id ?? index;
                    return (
                        <EtapeLigne
                            key={cle}
                            cle={cle}
                            step={step}
                            index={index}
                            total={etapes.length}
                            duree={duree}
                            debut={debut}
                            fin={fin}
                            ouvert={ouverte === cle}
                            onBasculer={basculer}
                        />
                    );
                })}
            </ol>
        </section>
    );
}
