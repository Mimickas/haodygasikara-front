import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { imagesTriees, journeesDeLEtape } from "../../../../../utils/circuit";
import { imageCloudinary } from "../../../../../utils/image";
import Journee from "./Journee";

// ── Une halte de l'itineraire ─────────────────────────────────────────────
// Une ligne pleine largeur separee par un filet franc, et son programme replie
// dessous. Pas de carte, pas de rayon, pas d'ombre : ce qui detache la ligne
// approchee, c'est un aplat qui se deroule d'un bord de l'ecran a l'autre
// (cf. .cx-leg dans index.css).
//
// Memoisee : un circuit peut aligner une quinzaine de haltes et rien dans une
// ligne ne depend de l'etat des autres. `onBasculer` est stable cote parent,
// la memoisation tient donc — seules l'ancienne et la nouvelle ligne ouverte
// rendent a nouveau.
const EtapeLigne = memo(function EtapeLigne({
    cle, circuit, step, index, total, duree, debut, fin, ouvert, onBasculer, onVoirCarte,
}) {
    const destination = step?.destination;
    const image = imagesTriees(destination)[0];

    const borne = index === 0 ? "Départ" : index === total - 1 ? "Arrivée" : null;
    // Une seule ligne de meta : la borne puis les tags, separes par des points.
    const meta = [borne, ...(destination?.tags ?? []).map((tag) => tag.nom)]
        .filter(Boolean)
        .join("  ·  ");

    const jours = debut == null
        ? null
        : debut === fin ? `Jour ${debut}` : `Jours ${debut} — ${fin}`;

    // Le programme ne pend plus a l'etape : il appartient au circuit, et cette
    // etape couvre les journees `debut` a `fin` du voyage.
    const programme = journeesDeLEtape(circuit, debut, fin);
    const depliable = programme.length > 0;

    return (
        <li className={`cx-leg${ouvert ? " cx-leg--ouvert" : ""}`}>

            <span aria-hidden className="cx-leg__aplat" />

            {/* La bascule est portee par la LIGNE, pas par la halte entiere :
                autrement le moindre clic dans le programme le refermait. */}
            <div
                className="cx-leg__row"
                onClick={depliable ? () => onBasculer(cle) : undefined}
                style={{ cursor: depliable ? "pointer" : "default" }}
            >

                <span className="cx-leg__num font-title tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                </span>

                <div className="cx-leg__media">
                    {image && (
                        <img
                            src={imageCloudinary(image, 900)}
                            alt={destination?.nom ?? ""}
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                </div>

                <div className="cx-leg__texte min-w-0 flex flex-wrap items-baseline gap-x-7 gap-y-2">
                    <h3 className="cx-leg__nom font-title">
                        {destination?.nom}
                    </h3>
                    {meta && (
                        <span className="cx-leg__meta font-body-strong">{meta}</span>
                    )}
                </div>

                <div className="cx-leg__stay font-body-strong tabular-nums whitespace-nowrap">
                    {jours}
                    {jours && duree > 0 && <span className="mx-2 opacity-40">&middot;</span>}
                    {duree > 0 && <span className="opacity-70">{duree} nuit{duree > 1 ? "s" : ""}</span>}
                </div>

                {/* Un vrai bouton : etat, clavier, et un chevron qui dit dans
                    quel sens ca va. Le <span/> garde la colonne quand une halte
                    n'a pas de programme — sans lui, sa colonne tombe a zero et
                    le sejour glisse de 118 px par rapport a la ligne voisine. */}
                {depliable ? (
                    <button
                        type="button"
                        aria-expanded={ouvert}
                        aria-label={ouvert
                            ? `Replier le programme de ${destination?.nom ?? "l'étape"}`
                            : `Voir le programme de ${destination?.nom ?? "l'étape"}`}
                        onClick={(e) => { e.stopPropagation(); onBasculer(cle); }}
                        className="cx-leg__bascule font-body-strong"
                    >
                        {ouvert ? "Replier" : "Voir plus"}
                        <ChevronDown size={14} className="cx-leg__chevron" />
                    </button>
                ) : <span />}

            </div>

            {ouvert && (
                <div className="cx-depli">
                    {programme.map((jour, i) => (
                        <Journee
                            key={jour?.id ?? i}
                            jour={jour}
                            lieu={destination?.nom}
                            onVoirCarte={onVoirCarte}
                        />
                    ))}
                </div>
            )}
        </li>
    );
});

export default EtapeLigne;
