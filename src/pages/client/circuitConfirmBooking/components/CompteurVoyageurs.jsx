// Le nombre de voyageurs d'une catégorie.
//
// Deux boutons et un nombre entre les deux, plutôt qu'un <input type="number"> :
// ses flèches natives sont minuscules, différentes d'un navigateur à l'autre,
// et le champ accepte au clavier des valeurs que personne ne veut — un collage,
// un exposant, un nombre négatif. Deux boutons bornés disent exactement ce qui
// est permis, et il n'y a rien à valider.
//
// ── 52 px de côté, et c'est une exigence, pas un réglage ────────────────
// La consigne était « imagine que le client est très très vieux, qui vient de
// la brousse ». La cible tactile confortable commence à 44 px ; on prend 52.
// Et le compteur est placé JUSTE À CÔTÉ de la catégorie qu'il compte : dans la
// version précédente, « Adulte » était à gauche de l'écran et son compteur à
// 1 400 px de là, à l'autre bout de la ligne.
//
// Les bornes ne disparaissent pas à la limite, elles s'éteignent : un bouton
// retiré décalerait la rangée à chaque fois qu'on atteint 0.
//
// ── Pourquoi un ÉCART et pas une valeur ────────────────────────────────
// Le composant annonce « +1 » ou « −1 », et c'est le parent qui applique le
// changement à partir de SA valeur du moment. La première version calculait
// `valeur + 1` ici même, à partir de la prop — donc à partir d'un nombre qui
// n'a pas encore été rafraîchi si on appuie deux fois vite : deux appuis
// donnaient un seul voyageur. Constaté en cliquant deux fois de suite.
//
// Ce n'est pas un cas tordu : appuyer deux fois rapidement sur « + » est
// exactement le geste de quelqu'un qui compte deux personnes, et c'est le
// public de cette page.
export default function CompteurVoyageurs({ valeur, onModifier, max, libelle }) {
    return (
        <div className="cx-compteur">
            <button
                type="button"
                className="cx-compteur__bouton font-body-strong"
                onClick={() => onModifier(-1)}
                disabled={valeur <= 0}
                aria-label={`Retirer un voyageur — ${libelle}`}
            >
                &minus;
            </button>

            {/* aria-live : le lecteur d'écran annonce le nouveau total sans
                que le focus quitte le bouton qu'on vient d'actionner. */}
            <span
                className="cx-compteur__valeur font-body-strong tabular-nums"
                aria-live="polite"
                aria-label={`${valeur} ${libelle}`}
            >
                {valeur}
            </span>

            <button
                type="button"
                className="cx-compteur__bouton font-body-strong"
                onClick={() => onModifier(1)}
                disabled={valeur >= max}
                aria-label={`Ajouter un voyageur — ${libelle}`}
            >
                +
            </button>
        </div>
    );
}
