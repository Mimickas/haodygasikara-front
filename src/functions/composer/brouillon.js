import { CLE_BROUILLON_LOCAL } from "../../constants/client/composer";

// ── Le brouillon local d'un visiteur sans compte ───────────────────────────
//
// Un visiteur compose sans être connecté. Au moment d'enregistrer, il part se
// connecter : on garde son circuit dans le navigateur pour qu'il le retrouve
// intact au retour. Le stockage peut être indisponible (navigation privée,
// quota) : on perd alors le brouillon, sans casser la page.

export function lireBrouillonLocal() {
    try {
        const brut = localStorage.getItem(CLE_BROUILLON_LOCAL);
        return brut ? JSON.parse(brut) : null;
    } catch {
        return null;
    }
}

export function ecrireBrouillonLocal(etat) {
    try {
        localStorage.setItem(CLE_BROUILLON_LOCAL, JSON.stringify({
            nom: etat.nom,
            dateArrivee: etat.dateArrivee,
            dateDepart: etat.dateDepart,
            etapes: etat.etapes,
            enregistreLe: Date.now(),
        }));
    } catch { /* stockage indisponible */ }
}

export function effacerBrouillonLocal() {
    try { localStorage.removeItem(CLE_BROUILLON_LOCAL); } catch { /* rien à effacer */ }
}
