import { FaCheck, FaPlus } from "react-icons/fa6";

import { imageCloudinary } from "../../../../utils/image";
// Une destination, en photographie : le cadre des circuits de l'accueil —
// photo pleine, dégradé par le bas, nom en serif blanc, une ligne en
// capitales. On la glisse dans le voyage, on clique pour ouvrir sa fiche, ou
// « + » l'ajoute en fin de voyage (sa photo s'y envole).
//
// En haut à gauche, au plus UNE mention : « Suggérée » quand le serveur la
// trouve souvent associée aux étapes déjà choisies, « Dans votre voyage » une
// fois choisie. Sinon, rien : la photo parle seule.

export default function CarteDestination({ destination: d, prioritaire, suggestion, avecDistance, glisseProps, glissee, onAjouter, onOuvrir }) {
    const suggeree = Boolean(suggestion) && !d.dejaChoisie;
    // Le pourcentage est le score de la suggestion, calculé par le serveur
    // (association, étiquettes communes, proximité) ; sa raison au survol.
    const mention = d.dejaChoisie ? "Dans votre voyage" : suggeree ? `Suggérée · ${suggestion.score} %` : null;
    const meta = [d.tags[0]?.nom, avecDistance && d.distanceKm != null ? `${d.distanceKm} km` : null].filter(Boolean).join(" · ");

    return (
        <li
            data-cp-carte
            data-curseur="Ouvrir"
            data-flip-id={d.id}
            className={`cx-cp-carte${d.dejaChoisie ? " cx-cp-carte--choisie" : ""}${suggeree ? " cx-cp-carte--suggeree" : ""}${glissee ? " cx-cp-carte--glissee" : ""}`}
            title={suggeree ? suggestion.raison : undefined}
            tabIndex={0}
            aria-label={`${d.nom} — ouvrir la fiche`}
            onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOuvrir(d); }}
            {...glisseProps}
        >
            <div className="cx-cp-carte__media">
                {d.image
                    ? <img data-cp-photo src={imageCloudinary(d.image, 700)} alt="" loading={prioritaire ? "eager" : "lazy"} decoding="async" draggable={false} />
                    : <span className="cx-cp-carte__initiale">{d.nom.charAt(0)}</span>}
            </div>

            {mention && <span key={mention} className="cx-cp-carte__mention">{mention}</span>}

            <div className="cx-cp-carte__bas">
                <div className="cx-cp-carte__texte">
                    {meta && <span className="cx-cp-carte__meta">{meta}</span>}
                    <h3 className="cx-cp-carte__nom">{d.nom}</h3>
                </div>
                {onAjouter && (
                    <button type="button" className="cx-cp-carte__ajout"
                        onClick={(e) => onAjouter(d, e.currentTarget.closest("[data-cp-carte]")?.querySelector("[data-cp-photo]"))}
                        aria-label={`Ajouter ${d.nom} au voyage`}
                        title={d.dejaChoisie ? "Déjà dans votre voyage — l'ajouter à nouveau" : "Ajouter au voyage"}>
                        {d.dejaChoisie ? <FaCheck size={11} /> : <FaPlus size={11} />}
                    </button>
                )}
            </div>
        </li>
    );
}
