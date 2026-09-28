import { ArrowUpRight } from "lucide-react";
import { mediasPoi, trajetDuJour } from "../../../../../utils/circuit";
import { formatRepas } from "../../../../../utils/format";
import Mention from "../shared/Mention";
import JourneeVisites from "./JourneeVisites";
import PlanchePhoto from "./PlanchePhoto";

// ── Une journee du programme ──────────────────────────────────────────────
// `CircuitDayDetaille` : jour, jourCircuit, titre, description, hebergement,
// les trois repas, et les visites.
//
// L'ordre de lecture etait a l'envers : le titre et le recit d'abord, le
// « Jour 3 : » plus bas — on ne savait pas de quel jour on parlait avant
// d'avoir fini de le lire. La journee se deroule maintenant du general au
// precis, et dans l'ordre ou on la vit :
//
//     le numero et le renvoi vers la carte
//     le titre
//     le recit
//     ce qu'on fait  (les visites)
//     ou l'on dort   (la nuitee, les repas)
//     les photos du lieu ou l'on dort
//
// Le dernier point n'est pas un detail : la planche montre l'hebergement. La
// poser juste apres la fiche du soir, c'est ce qui dit de quoi elle parle.
export default function Journee({ jour, lieu }) {
    const repas = formatRepas(jour);
    const aRepas = repas !== "—";
    const trajet = trajetDuJour(jour);

    // La planche photo est celle de l'hebergement — son film compris, s'il en
    // a un. Le POI porte ses visuels dans la meme forme qu'une destination.
    const medias = mediasPoi(jour?.hebergement);

    return (
        <article className="cx-jour">
            <div className="cx-jour__tete">
                {/* `jour` est le numero sur TOUT le voyage : la premiere journee
                    de la deuxieme halte n'est pas le jour 1. */}
                <span className="cx-label cx-label--accent font-body-strong">
                    Jour {jour?.jour}
                </span>

                {/* Le renvoi vers la carte reste a brancher : il est ici en
                    bouton, pas en paragraphe, pour que le jour ou il l'est il
                    n'y ait rien a redessiner. */}
                <button type="button" className="cx-jour__carte font-body-strong">
                    Voir sur la carte
                    <ArrowUpRight size={13} />
                </button>
            </div>

            {/* Le trajet de la journee : « Antananarivo → Ampefy → Chute de
                Lily ». Une journee traverse souvent plusieurs lieux, et c'est ce
                que la fiche ne savait pas dire — un jour valait un lieu. */}
            {trajet.length > 1 && (
                <p className="cx-jour__trajet font-body-strong">
                    {trajet.join(" → ")}
                </p>
            )}

            {jour?.titre && (
                <h4 className="cx-jour__titre font-title">{jour.titre}</h4>
            )}

            {jour?.description && (
                <p className="cx-jour__texte font-body">{jour.description}</p>
            )}

            <JourneeVisites visites={jour?.visites} />

            {(jour?.hebergement || aRepas || jour?.transport) && (
                <dl className="cx-jour__fiche">
                    {jour?.hebergement && (
                        <Mention legende="Nuitée" valeur={jour.hebergement.nom} />
                    )}
                    {/* Les autres hébergements que l'agence propose pour cette
                        nuit ; le voyageur choisit en demandant son devis. */}
                    {jour?.alternatives?.length > 0 && (
                        <Mention legende="Ou au choix" valeur={jour.alternatives.map((a) => a.nom).join(" · ")} />
                    )}
                    {aRepas && <Mention legende="Repas inclus" valeur={repas} />}
                    {jour?.transport?.libelle && (
                        <Mention legende="Déplacement" valeur={jour.transport.libelle} />
                    )}
                </dl>
            )}

            <PlanchePhoto medias={medias} legende={jour?.hebergement?.nom ?? lieu} />
        </article>
    );
}
