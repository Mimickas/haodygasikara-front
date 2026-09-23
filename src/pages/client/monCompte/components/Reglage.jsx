import { ChevronDown } from "lucide-react";

/**
 * Un réglage : la rangée fermée, et le formulaire qui se déplie dessous.
 *
 * C'est la rangée de « Votre voyage en trois gestes », sur l'accueil, reprise
 * telle quelle — douze colonnes, le numéro en Abhaya clair sur deux colonnes,
 * le titre sur quatre qui avance de 2 px au survol, le propos sur six, un filet
 * d'un pixel entre chaque. Aucun vocabulaire nouveau : c'est déjà la grammaire
 * de la page d'accueil, posée sur un autre contenu.
 *
 * S'y ajoute ce dont un réglage a besoin et qu'une étape n'a pas : la VALEUR
 * ACTUELLE, en petites capitales sous le propos. Sans elle il faut ouvrir les
 * trois volets pour savoir ce qui est réglé.
 *
 * `grid-template-rows: 0fr → 1fr` : la seule façon d'animer l'ouverture d'une
 * hauteur inconnue sans aller la mesurer en JavaScript. Le geste est celui de
 * l'itinéraire et des réservations.
 */
export default function Reglage({
    numero,
    titre,
    propos,
    valeur,
    ouvert,
    onBasculer,
    children,
}) {
    return (
        <li className={`cx-reglage${ouvert ? " cx-reglage--ouvert" : ""}`}>
            <span aria-hidden className="cx-reglage__aplat" />

            <button
                type="button"
                className="cx-reglage__rangee"
                onClick={onBasculer}
                aria-expanded={ouvert}
            >
                <span className="cx-reglage__numero font-title tabular-nums">{numero}</span>

                <span className="cx-reglage__titre font-title">{titre}</span>

                <span className="cx-reglage__propos min-w-0">
                    <span className="cx-reglage__desc font-body">{propos}</span>
                    <span className="cx-reglage__valeur font-body-strong">{valeur}</span>
                </span>

                <span className="cx-reglage__bascule font-body-strong">
                    {ouvert ? "Replier" : "Modifier"}
                    <ChevronDown size={14} className="cx-reglage__chevron" />
                </span>
            </button>

            <div className="cx-reglage__corps">
                <div>
                    <div className="cx-reglage__dedans">{children}</div>
                </div>
            </div>
        </li>
    );
}
