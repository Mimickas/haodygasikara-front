import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { findCircuitClientById } from "../../../api/client/cricuitApi";
import { useReservationHero } from "../../../hooks/design/animations/circuit/useReservationHero";
import HeroReservation from "./components/HeroReservation";
import FormulaireReservation from "./components/FormulaireReservation";

// ── Réserver ──────────────────────────────────────────────────────────────
// URL : /circuit/:id/reservation/:dateId
//
// ── Ce qui traverse, et ce qui ne traverse pas ───────────────────────────
// L'écran ne reçoit QUE deux identifiants, par l'URL. Pas le prix, pas la
// date, pas le nom du circuit — il va tout relire auprès du serveur.
//
// C'est le point important, et il n'est pas cosmétique. Trois façons de
// passer ces données existaient :
//
//   1. L'ÉTAT DU ROUTEUR — <Link state={{ depart }}>. Pratique, et faux ici :
//      l'état vit dans l'historique du navigateur, donc dans le client. Un
//      history.replaceState() depuis la console suffit à changer le montant
//      affiché, puis envoyé. Il disparaît aussi au rafraîchissement, et le
//      lien n'est ni partageable ni remis en favori — or une page de
//      réservation est exactement ce qu'on envoie à quelqu'un d'autre.
//
//   2. UN STORE GLOBAL — même faiblesse, plus un écran qui ne sait plus
//      s'afficher quand on y arrive directement.
//
//   3. DES IDENTIFIANTS DANS L'URL, le reste relu du serveur. C'est ce qui
//      est fait ici. L'URL survit au rafraîchissement, se partage, et ne
//      porte rien qui ait de la valeur : changer `dateId` ne donne pas un
//      autre prix, ça donne un autre départ — dont le serveur redonnera le
//      vrai tarif, ou qu'il refusera.
//
// ── Et la vraie garantie est ailleurs ────────────────────────────────────
// Elle est côté back. La requête de réservation envoie `circuitDateTarifId`
// et les quantités par catégorie — JAMAIS un montant : ReservationRequest n'a
// aucun champ pour cela. Le serveur relit les prix depuis CircuitTarif,
// recalcule le total, et revalide les trois mêmes conditions qu'ici.
//
// Tout ce qui est vérifié dans ce fichier l'est pour l'affichage : c'est du
// confort, pas de la sécurité. Aucun contrôle fait dans un navigateur n'est un
// contrôle — la requête peut arriver sans être jamais passée par l'écran.
//
// ── La mise en page ──────────────────────────────────────────────────────
// Un hero photographique, puis trois étapes numérotées et un récapitulatif
// collant. Le raisonnement est écrit dans `HeroReservation`,
// `EtapeReservation` et `RecapitulatifResa` — et dans le bloc « RESERVER » de
// la feuille de style, qui dit pourquoi les filets ont laissé la place à des
// panneaux.
export default function CircuitConfirmBooking() {
    const { id, dateId } = useParams();

    const [circuit, setCircuit] = useState(null);
    const [etat, setEtat] = useState("chargement");   // chargement | pret | absent

    const charger = useCallback(async () => {
        setEtat("chargement");
        try {
            const res = await findCircuitClientById(id);
            setCircuit(res?.data ?? null);
            setEtat(res?.data ? "pret" : "absent");
        } catch (error) {
            console.error("Chargement du circuit impossible", error);
            setEtat("absent");
        }
    }, [id]);

    useEffect(() => { charger(); }, [charger]);

    // Le départ est cherché DANS le circuit chargé, jamais pris pour argent
    // comptant depuis l'URL : c'est ce qui garantit qu'il lui appartient.
    // /circuit/1/reservation/999 ne trouve rien et tombe sur le refus.
    const depart = useMemo(
        () => (circuit?.dates ?? []).find((d) => String(d?.id) === String(dateId)) ?? null,
        [circuit, dateId]
    );

    // Les trois conditions de la page détail, revérifiées ici : un lien
    // recopié à la main ne doit pas ouvrir un formulaire que la liste
    // n'aurait jamais proposé.
    const passe = depart?.dateDebut
        ? new Date(depart.dateDebut) < new Date(new Date().toDateString())
        : false;
    const reservable = Boolean(circuit?.isTemplate) && Boolean(depart) && !passe
        && (depart?.prices?.length ?? 0) > 0;

    useReservationHero(etat === "pret");

    if (etat === "chargement") {
        return (
            <div className="cx-detail cx-sous-entete">
                <section className="cx-resa" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                    <p className="cx-label cx-label--legende font-body-strong">
                        Chargement&hellip;
                    </p>
                </section>
            </div>
        );
    }

    return (
        <>
            <HeroReservation
                circuit={circuit}
                depart={reservable ? depart : null}
                retourVers={`/circuit/${id}`}
            />

            <div className="cx-detail">
                {!reservable ? (
                    <div className="cx-resa" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
                        <p className="cx-resa__refus font-body">
                            {motifRefus({ circuit, depart, passe })}{" "}
                            <Link to={`/circuit/${id}`} className="cx-param__accent">
                                Revenir aux d&eacute;parts disponibles
                            </Link>.
                        </p>
                    </div>
                ) : (
                    <FormulaireReservation circuit={circuit} depart={depart} />
                )}
            </div>
        </>
    );
}

// Le refus dit POURQUOI. « Ce lien n'est pas valide » laisse le visiteur sans
// rien à faire ; « ce départ est passé » lui dit d'en regarder un autre.
function motifRefus({ circuit, depart, passe }) {
    if (!circuit) return "Ce circuit est introuvable.";
    if (!depart) return "Ce départ n'existe pas, ou n'appartient pas à ce circuit.";
    if (passe) return "Ce départ est déjà passé.";
    if (!circuit.isTemplate) return "Ce circuit se compose sur mesure et ne se réserve pas à la date.";
    return "Ce départ n'a pas encore de tarif : il ne peut pas être réservé en ligne.";
}
