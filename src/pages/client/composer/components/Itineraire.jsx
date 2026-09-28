import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import EtapeItineraire from "./EtapeItineraire";
import { useReorderDrag } from "../../../../hooks/useReorderDrag";
import { plagesDesEtapes } from "../../../../functions/composer/itineraire";

gsap.registerPlugin(Flip);

// ── Les étapes du voyage ───────────────────────────────────────────────────
//
// Des lignes numérotées, comme les « trois gestes » de l'accueil. Deux gestes,
// deux mécaniques :
//   * RÉORDONNER : useReorderDrag, en saisissant le numéro de l'étape. La
//     ligne suit le curseur, les voisines s'écartent.
//   * AJOUTER / RETIRER : GSAP Flip. Avant chaque rendu, on photographie la
//     place de chaque ligne ; après, chacune glisse de l'ancienne place vers
//     la nouvelle. Une étape ajoutée par « + » reçoit la photo qui s'envole de
//     sa carte (useEnvolEtape), puis apparaît quand elle s'y pose.
//
// Flip est COUPÉ pour un réordonnancement : useReorderDrag a déjà amené la
// ligne sous le doigt, la ré-animer depuis son ancienne place la ferait
// revenir en arrière avant de repartir.

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export default function Itineraire({ circuit, actions, pret, zoneRef, listeRef, insertion, glisse, survol, onSurvol, envol, verrouille }) {
    const etapes = circuit.etapes;
    const plages = useMemo(() => plagesDesEtapes(etapes, circuit.dateArrivee), [etapes, circuit.dateArrivee]);

    const sansFlip = useRef(false);
    const { listRef, dragIndex, poigneeProps } = useReorderDrag({
        count: etapes.length,
        scrollerSelector: "[data-composer-scroller]",
        onReorder: (depuis, vers) => {
            sansFlip.current = true;
            actions.deplacer(depuis, vers);
        },
    });

    // Une seule ref pour deux usages : le glisser-réordonner et le calcul
    // d'insertion du glisser depuis la galerie.
    const attacherListe = (el) => {
        listRef.current = el;
        if (listeRef) listeRef.current = el;
    };

    const etatPrecedent = useRef(null);

    // La photographie des places suit le défilement de la colonne : prise
    // avant, elle ferait partir les lignes de là où elles étaient AVANT.
    useEffect(() => {
        const defile = zoneRef.current?.closest("[data-composer-scroller]");
        if (!defile) return undefined;
        let raf = null;
        const capturer = () => {
            raf = null;
            const lignes = listRef.current?.querySelectorAll("[data-reorder-row]");
            if (lignes?.length) etatPrecedent.current = Flip.getState(lignes);
        };
        const programmer = () => { if (!raf) raf = requestAnimationFrame(capturer); };
        defile.addEventListener("scroll", programmer, { passive: true });
        return () => {
            defile.removeEventListener("scroll", programmer);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [zoneRef, listRef]);

    const cles = etapes.map((e) => e.cle).join("|");
    useLayoutEffect(() => {
        const liste = listRef.current;
        if (!liste) {
            etatPrecedent.current = null;
            return;
        }
        const lignes = liste.querySelectorAll("[data-reorder-row]");

        // Une ligne qui entre : l'envol part d'abord, la ligne apparaît quand il se pose.
        const entrer = (entrees) => {
            const vol = entrees.length === 1 && envol?.lancer(entrees[0].querySelector("[data-cp-numero]"));
            gsap.fromTo(entrees,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.8, delay: vol ? 0.6 : 0, ease: "power3.out", stagger: 0.05, clearProps: "transform,opacity" });
        };

        if (pret && !sansFlip.current && !SOBRE()) {
            if (etatPrecedent.current) {
                Flip.from(etatPrecedent.current, {
                    targets: lignes,
                    duration: 0.7,
                    ease: "power3.inOut",
                    absolute: false,
                    clearProps: "transform",
                    onEnter: entrer,
                });
            } else if (lignes.length) {
                // La liste était vide : pas de photographie précédente, tout est nouveau.
                entrer([...lignes]);
            }
        }
        sansFlip.current = false;
        etatPrecedent.current = lignes.length ? Flip.getState(lignes) : null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cles]);

    const survolZone = insertion != null;

    return (
        <div ref={zoneRef}
            className={`cx-cp-etapes-zone${glisse ? " cx-cp-etapes-zone--active" : ""}${survolZone ? " cx-cp-etapes-zone--survol" : ""}`}>
            {etapes.length === 0 ? (
                <div className="cx-cp-vide" data-cp-etape>
                    <span className="cx-cp-vide__numero">01</span>
                    <div>
                        <p className="cx-cp-vide__titre">{survolZone ? "Déposez-la ici." : "Votre première étape."}</p>
                        <p className="cx-cp-vide__texte">Glissez une destination ici, ou « + » sur sa photo.</p>
                    </div>
                </div>
            ) : (
                <ol ref={attacherListe} className="cx-cp-etapes">
                    {etapes.map((e, i) => (
                        <FragmentEtape key={e.cle} insertionIci={insertion === i} glisse={glisse}>
                            <EtapeItineraire
                                etape={e}
                                index={i}
                                plage={plages[i]}
                                poigneeProps={verrouille ? {} : poigneeProps(i)}
                                verrouille={verrouille}
                                saisie={dragIndex === i}
                                enEvidence={survol === i}
                                onNuits={actions.nuits}
                                onRetirer={actions.retirer}
                                onNotes={actions.notes}
                                onSurvol={onSurvol}
                            />
                        </FragmentEtape>
                    ))}
                    {insertion === etapes.length && <IndicateurInsertion nom={glisse?.nom} />}
                </ol>
            )}
        </div>
    );
}

// La ligne d'insertion s'affiche AVANT l'étape visée. Elle n'est pas une
// ligne du réordonnancement (pas de data-reorder-row) : les calculs de
// useReorderDrag l'ignorent.
function FragmentEtape({ insertionIci, glisse, children }) {
    return (
        <>
            {insertionIci && <IndicateurInsertion nom={glisse?.nom} />}
            {children}
        </>
    );
}

function IndicateurInsertion({ nom }) {
    return (
        <li className="cx-cp-insertion" aria-hidden="true">
            <span className="cx-cp-insertion__ligne" />
            <span className="cx-cp-insertion__texte">{nom ?? "Déposer ici"}</span>
        </li>
    );
}
