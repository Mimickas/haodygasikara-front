import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";

// ── L'attente entre deux pages ────────────────────────────────────────────
//
// Chaque page arrive maintenant dans son propre module : entre le clic et
// l'affichage, il y a un aller-retour réseau. Court sur une bonne connexion,
// franchement visible sur une mauvaise — et pendant ce temps l'écran ne
// disait rien du tout, ce qui se lit comme un site qui a planté.
//
// Un trait, en haut, de la couleur de la maison. Pas un voile, pas un
// pourcentage : on ne connaît pas la durée, et un compteur qui invente une
// progression ment. Le trait va et vient tant qu'on attend, il part dès que
// la page est là.
//
// Le délai de grâce compte autant que le trait : une page déjà en cache
// arrive en quelques millisecondes, et un indicateur qui clignote à chaque
// clic fatigue plus qu'il ne rassure. En dessous de ce seuil, on ne montre
// rien — la page était instantanée, il n'y avait rien à annoncer.
const GRACE_MS = 140;

export default function BarreDeChargement() {
    const { state } = useNavigation();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (state === "idle") {
            setVisible(false);
            return undefined;
        }
        const minuteur = setTimeout(() => setVisible(true), GRACE_MS);
        return () => clearTimeout(minuteur);
    }, [state]);

    return (
        <div
            className={`cx-chargement${visible ? " cx-chargement--actif" : ""}`}
            role="status"
            aria-live="polite"
        >
            <span className="cx-chargement__trait" />
            <span className="cx-visuellement-cache">{visible ? "Chargement de la page" : ""}</span>
        </div>
    );
}
