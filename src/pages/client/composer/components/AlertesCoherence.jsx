// Le verdict du serveur sur le parcours, UNE phrase à la fois — la plus
// grave d'abord. Ce que l'écran dit déjà ailleurs n'est pas répété ici :
// les dates manquantes (le bouton « Choisir les dates »), l'itinéraire vide
// (la première ligne l'invite), les nuits à répartir (la jauge).
// Un message lié à une étape la met en évidence au survol.

const DEJA_DIT = new Set(["VIDE", "DATES_MANQUANTES", "NUITS_A_REPARTIR", "NUITS_EN_TROP"]);

export default function AlertesCoherence({ coherence, onSurvolEtape }) {
    const messages = (coherence?.messages ?? []).filter((m) => !DEJA_DIT.has(m.code));
    const message = messages.find((m) => m.niveau === "ERREUR") ?? messages[0];
    if (!message) return null;

    return (
        <p key={`${message.code}-${message.etape ?? ""}`}
            className={`cx-cp-alerte${message.niveau === "ERREUR" ? " cx-cp-alerte--erreur" : ""}`}
            aria-live="polite"
            onMouseEnter={() => message.etape != null && onSurvolEtape(message.etape)}
            onMouseLeave={() => onSurvolEtape(null)}>
            {message.texte}
        </p>
    );
}
