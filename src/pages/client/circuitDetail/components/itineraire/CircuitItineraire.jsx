import { useCallback, useEffect, useState } from "react";
import EtapeLigne from "./EtapeLigne";

// ── L'itineraire ──────────────────────────────────────────────────────────
// Le même en-tête que les autres sections de la page, son compte en exposant,
// puis des lignes pleine largeur séparées par un filet franc — ni étoiles, ni
// bornes encadrées. La règle typographique du site s'y applique comme
// ailleurs : le nom d'une étape et le titre d'un jour NOMMENT (Abhaya), les
// numéros 01, 02… ORDONNENT (Abhaya pâle), les durées et dates MESURENT
// (Barlow). Le détail est rangé avec les règles, dans index.css.
//
// L'etat vit ici et pas dans la page : quelle halte est ouverte ne regarde que
// cette liste.
export default function CircuitItineraire({ circuit, etapes = [], jours, depart, arrivee, circuitId, onVoirCarte }) {
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
            {/* Le même en-tête que « L'esprit du voyage » : sur-titre, titre serif,
                et en face ce qu'il faut savoir — une section de la page, pas un
                titre d'affiche à part. */}
            <header className="cx-tete">
                <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">
                    Le parcours
                </span>
                <h2 className="cx-tete__titre cx-iti__titre font-title">
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
                            circuit={circuit}
                            step={step}
                            index={index}
                            total={etapes.length}
                            duree={duree}
                            debut={debut}
                            fin={fin}
                            ouvert={ouverte === cle}
                            onBasculer={basculer}
                            onVoirCarte={onVoirCarte}
                        />
                    );
                })}
            </ol>
        </section>
    );
}
