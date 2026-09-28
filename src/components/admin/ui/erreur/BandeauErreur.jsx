// Un refus du serveur, en tête de page, lisible jusqu'à ce qu'on le ferme.
// Remplace window.alert(), qui bloquait la page et se lisait mal.
export default function BandeauErreur({ message, onFermer }) {
    if (!message) return null;
    return (
        <div className="ad-erreur" role="alert">
            <p className="font-body">{message}</p>
            {onFermer && (
                <button type="button" className="ad-erreur__fermer" onClick={onFermer} aria-label="Fermer le message">✕</button>
            )}
        </div>
    );
}
