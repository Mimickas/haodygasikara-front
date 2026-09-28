/**
 * Le retour du serveur, sous le formulaire qui l'a provoqué.
 *
 * Deux tons seulement, et ils viennent des jetons du site (`--error-*`,
 * `--success-*`) : aucune couleur inventée sur place.
 *
 * `white-space: pre-line` parce que `apiErrorMessage` joint le message et les
 * détails de validation par des retours à la ligne — sans ça, les trois motifs
 * d'un refus arrivent collés en une seule phrase illisible.
 */
export default function Avis({ ton, children }) {
    if (!children) return null;
    return (
        <p className={`cx-param__avis cx-param__avis--${ton} font-body`} role="status">
            {children}
        </p>
    );
}
