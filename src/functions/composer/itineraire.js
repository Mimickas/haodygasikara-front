import { ETAPES_MAX, NUITS_MAX_ETAPE, NUITS_MIN_ETAPE } from "../../constants/client/composer";

// ── L'itinéraire, en fonctions pures ───────────────────────────────────────
//
// Aucune de ces fonctions ne touche au réseau ni à l'écran : elles reçoivent
// une liste d'étapes et en rendent une nouvelle, sans modifier l'ancienne.
// C'est ce qui permet à l'écran de réagir au geste sans attendre le serveur,
// et au serveur de rester seul juge de la cohérence (il reçoit l'état entier
// à chaque vérification).
//
// Une étape : { cle, destination, nuits, notes }
//   `cle` est locale et stable : c'est elle que React suit pendant un
//   glisser-déposer, pas l'id de la destination (une destination peut
//   revenir deux fois dans un circuit).

let compteur = 0;
const nouvelleCle = () => `e${Date.now().toString(36)}${(compteur++).toString(36)}`;

const borner = (n) => Math.max(NUITS_MIN_ETAPE, Math.min(NUITS_MAX_ETAPE, n));

export const creerEtape = (destination, nuits = 1, notes = "") =>
    ({ cle: nouvelleCle(), destination, nuits: borner(nuits), notes });

/** Insère à `index` (fin de liste si absent). Refuse au-delà du maximum. */
export function ajouterEtape(etapes, destination, index = etapes.length, nuits = 1) {
    if (etapes.length >= ETAPES_MAX) return etapes;
    const copie = [...etapes];
    copie.splice(Math.max(0, Math.min(index, copie.length)), 0, creerEtape(destination, nuits));
    return copie;
}

export const retirerEtape = (etapes, cle) => etapes.filter((e) => e.cle !== cle);

export function deplacerEtape(etapes, depuis, vers) {
    if (depuis === vers || depuis < 0 || vers < 0 || depuis >= etapes.length || vers >= etapes.length) return etapes;
    const copie = [...etapes];
    const [bougee] = copie.splice(depuis, 1);
    copie.splice(vers, 0, bougee);
    return copie;
}

export const changerNuits = (etapes, cle, nuits) =>
    etapes.map((e) => (e.cle === cle ? { ...e, nuits: borner(nuits) } : e));

export const changerNotes = (etapes, cle, notes) =>
    etapes.map((e) => (e.cle === cle ? { ...e, notes } : e));

// ── Les dates ──────────────────────────────────────────────────────────────

/** "2026-11-02" → Date locale à minuit (sans décalage de fuseau). */
export const versDate = (iso) => {
    if (!iso) return null;
    const [a, m, j] = iso.split("-").map(Number);
    return new Date(a, m - 1, j);
};

/** Date → "2026-11-02". */
export const versIso = (date) => {
    if (!date) return null;
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const j = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${m}-${j}`;
};

/** Nuits entre deux dates ISO, ou null si l'une manque ou si elles sont inversées. */
export function nuitsEntre(arrivee, depart) {
    const a = versDate(arrivee);
    const d = versDate(depart);
    if (!a || !d) return null;
    const n = Math.round((d - a) / 86400000);
    return n > 0 ? n : null;
}

export const nuitsPlanifiees = (etapes) => etapes.reduce((s, e) => s + e.nuits, 0);

/**
 * Les jours couverts par chaque étape : { jourDebut, jourFin, dateDebut, dateFin }.
 * Une étape de 3 nuits commencée le jour 1 se termine le jour 4 — le jour du
 * départ, qui est aussi le premier jour de l'étape suivante.
 */
export function plagesDesEtapes(etapes, arrivee) {
    const debut = versDate(arrivee);
    let cumul = 0;
    return etapes.map((e) => {
        const jourDebut = cumul + 1;
        const jourFin = cumul + e.nuits + 1;
        const dateDebut = debut ? new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + cumul) : null;
        const dateFin = debut ? new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + cumul + e.nuits) : null;
        cumul += e.nuits;
        return { jourDebut, jourFin, dateDebut, dateFin };
    });
}

/**
 * Répartit les nuits prévues entre les étapes, au prorata de ce qui est déjà
 * posé : une étape de 3 nuits en garde plus qu'une étape d'une nuit. Chaque
 * étape garde au moins une nuit ; l'arrondi est rattrapé sur les plus longues.
 */
export function repartirNuits(etapes, total) {
    if (!etapes.length || !total || total < etapes.length) return etapes;
    const actuel = nuitsPlanifiees(etapes);
    const parts = etapes.map((e) => Math.max(NUITS_MIN_ETAPE, Math.floor((e.nuits / actuel) * total)));
    let reste = total - parts.reduce((s, n) => s + n, 0);
    const ordre = etapes.map((e, i) => i).sort((a, b) => etapes[b].nuits - etapes[a].nuits);
    for (let k = 0; reste !== 0 && k < 1000; k++) {
        const i = ordre[k % ordre.length];
        if (reste > 0) { parts[i] += 1; reste -= 1; }
        else if (parts[i] > NUITS_MIN_ETAPE) { parts[i] -= 1; reste += 1; }
    }
    return etapes.map((e, i) => ({ ...e, nuits: borner(parts[i]) }));
}

// ── Aller-retour avec le serveur ───────────────────────────────────────────

/** L'état de l'écran → le corps attendu par le back (ComposerRequests.Sauvegarde). */
export const versPayload = ({ nom, dateArrivee, dateDepart, etapes }, statut = "BROUILLON") => ({
    nom: nom?.trim() || null,
    dateArrivee: dateArrivee || null,
    dateDepart: dateDepart || null,
    statut,
    etapes: etapes.map((e) => ({ destinationId: e.destination.id, nuits: e.nuits, notes: e.notes?.trim() || null })),
});

/** Un circuit renvoyé par le back → l'état de l'écran. */
export const depuisMonCircuit = (circuit) => ({
    id: circuit.id,
    nom: circuit.nom ?? "",
    dateArrivee: circuit.dateArrivee ?? null,
    dateDepart: circuit.dateDepart ?? null,
    statut: circuit.statut,
    devis: circuit.devis ?? null,
    etapes: (circuit.etapes ?? []).map((e) => creerEtape(e.destination, e.nuits, e.notes ?? "")),
});

/** Les ids des destinations dans l'ordre : ce que le catalogue et les suggestions reçoivent. */
export const idsChoisis = (etapes) => etapes.map((e) => e.destination.id);
