import Mention from "../shared/Mention";

// ── La fiche technique ────────────────────────────────────────────────────
// Durée, style, niveau, âges, groupe, langues, déplacements — ce qu'un
// voyageur veut savoir avant de lire le programme.
//
// Deux colonnes serrées, étiquette au-dessus de la valeur. La version
// précédente étalait les mêmes mentions sur six colonnes et toute la largeur
// de la page : aérée au point de ne plus faire fiche du tout. Une fiche
// technique se lit en bloc — c'est sa densité qui la rend crédible.
//
// Chaque mention ne s'affiche que si le back l'a renseignée. On n'écrit jamais
// « non communiqué » : c'est une ligne à lire pour une information de moins, et
// une fiche trouée se voit plus qu'une fiche courte.
//
// Les libellés viennent tous du back (LibelleDetaille : code + libellé). Le
// front n'a donc aucune table de traduction à tenir — reformuler « Modéré » se
// fait dans l'enum, et cet écran suit.
export default function FicheTechnique({ fiche, duree, nuitees }) {
    const { style, niveau, ages, groupe, langues = [], transports = [] } = fiche ?? {};

    // La durée ouvre la fiche : c'est la première chose qu'on demande d'un
    // voyage. Elle se dit ici en jours ET en nuits, ce qu'aucun autre endroit
    // de la page ne donne d'un coup.
    const sejour = duree > 0
        ? `${duree} jour${duree > 1 ? "s" : ""}${nuitees > 0 ? ` · ${nuitees} nuit${nuitees > 1 ? "s" : ""}` : ""}`
        : null;

    const mentions = [
        sejour && { legende: "Durée", valeur: sejour },
        style && { legende: "Style de voyage", valeur: style.libelle },
        ages && { legende: "Âges", valeur: ages.libelle },
        groupe && { legende: "Taille du groupe", valeur: groupe.libelle },
        langues.length > 0 && {
            legende: langues.length > 1 ? "Langues" : "Langue",
            valeur: langues.map((l) => l.libelle).join("  ·  "),
        },
        transports.length > 0 && {
            legende: "Déplacements",
            valeur: transports.map((t) => t.libelle).join("  ·  "),
        },
    ].filter(Boolean);

    if (!mentions.length && !niveau) return null;

    return (
        <dl className="cx-specs">
            {mentions.slice(0, 2).map((m) => (
                <Mention key={m.legende} legende={m.legende} valeur={m.valeur} />
            ))}

            {/* Le niveau a sa propre mention : il porte une échelle que les
                autres n'ont pas. Il se place en troisième, juste après le
                style qu'il précise. */}
            {niveau && (
                <div className="cx-mention">
                    <dt className="cx-label cx-label--legende font-body-strong">
                        Niveau physique
                    </dt>
                    <dd>
                        <span className="cx-mention__valeur font-body-strong block">{niveau.libelle}</span>

                        {/* Quatre traits plats remplis jusqu'à la note. Ce ne sont
                            pas des étoiles : une étoile note une qualité, ces
                            barres mesurent une exigence. */}
                        <span
                            className="cx-niveau"
                            role="img"
                            aria-label={`${niveau.note} sur ${niveau.sur}`}
                        >
                            {Array.from({ length: niveau.sur }, (_, i) => (
                                <span
                                    key={i}
                                    className={`cx-niveau__barre${i < niveau.note ? " cx-niveau__barre--on" : ""}`}
                                />
                            ))}
                        </span>
                    </dd>
                </div>
            )}

            {mentions.slice(2).map((m) => (
                <Mention key={m.legende} legende={m.legende} valeur={m.valeur} />
            ))}
        </dl>
    );
}
