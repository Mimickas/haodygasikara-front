// ── Les limites d'un champ, en un seul endroit ─────────────────────────────
//
// Les deux formulaires de l'administration — la page (CreateModal) et la
// fenêtre (FormModal) — partaient tous les deux en `noValidate` sans une seule
// borne : on pouvait enregistrer un circuit de 110 jours, une note de 47
// étoiles, un jour n° 0. Le serveur refusait parfois, jamais toujours, et son
// refus arrivait après l'envoi, en une phrase au pied de l'écran, sans dire
// QUEL champ.
//
// Les bornes se déclarent donc avec le champ (createConstant.js) et se
// vérifient ici, pour les deux formulaires à la fois : une borne ajoutée vaut
// partout, et le message se pose sous le champ fautif.
//
// Un champ facultatif laissé vide n'est pas une erreur : c'est un blanc voulu,
// que le serveur lit comme « non renseigné ». Seul `obligatoire` le refuse.

const estVide = (v) =>
    v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0);

const pluriel = (n, mot) => (mot ? ` ${mot}${Math.abs(n) > 1 ? "s" : ""}` : "");

/** « 12/03/2026 » plutôt que « 2026-03-12 » dans un message lu par un humain. */
const jour = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR");
};

function erreurNombre(field, valeur) {
    const n = Number(valeur);
    if (!Number.isFinite(n)) return "Indiquez un nombre.";
    if (field.entier !== false && !Number.isInteger(n)) return "Indiquez un nombre entier.";
    if (field.min != null && n < field.min) {
        return `Le minimum est ${field.min}${pluriel(field.min, field.unite)}.`;
    }
    if (field.max != null && n > field.max) {
        return `Le maximum est ${field.max}${pluriel(field.max, field.unite)}.`;
    }
    return null;
}

function erreurDate(field, valeur) {
    if (field.min && valeur < field.min) return `La date doit être au plus tôt le ${jour(field.min)}.`;
    if (field.max && valeur > field.max) return `La date doit être au plus tard le ${jour(field.max)}.`;
    return null;
}

function erreurTexte(field, valeur) {
    const texte = String(valeur);
    if (field.maxLength && texte.length > field.maxLength) {
        return `${field.maxLength} caractères au plus (actuellement ${texte.length}).`;
    }
    if (field.minLength && texte.trim().length < field.minLength) {
        return `${field.minLength} caractères au moins.`;
    }
    return null;
}

function erreurListe(field, valeur) {
    if (field.maxItems && valeur.length > field.maxItems) {
        return `${field.maxItems} au plus (actuellement ${valeur.length}).`;
    }
    if (field.minItems && valeur.length < field.minItems) {
        return `${field.minItems} au moins.`;
    }
    return null;
}

/** L'erreur d'un champ, ou null. */
export function erreurChamp(field, valeur) {
    if (estVide(valeur)) {
        return field.obligatoire ? (field.messageVide ?? "Ce champ est obligatoire.") : null;
    }
    if (Array.isArray(valeur)) return erreurListe(field, valeur);
    // Un nombre peut aussi arriver dans un champ « texte » borné : on se fie
    // aux bornes declarees, pas au seul type de l'input.
    if (field.type === "number" || field.min != null || field.max != null) {
        if (field.type === "date") return erreurDate(field, valeur);
        return erreurNombre(field, valeur);
    }
    if (field.type === "date") return erreurDate(field, valeur);
    if (typeof valeur === "string") return erreurTexte(field, valeur);
    return null;
}

/**
 * Toutes les erreurs d'un formulaire : { nomDuChamp: message }.
 *
 * `coherence` vérifie ce qu'un champ seul ne peut pas savoir — un âge maximum
 * plus petit que le minimum, par exemple. Elle reçoit toutes les valeurs et
 * renvoie la même forme.
 */
export function validerChamps(fields, formData, coherence) {
    const erreurs = {};
    for (const field of fields.flat()) {
        // Les champs d'envoi de fichiers et les listes composites ont leur
        // propre garde-fou dans leur composant.
        if (["image", "video", "programme", "inclusions"].includes(field.type)) continue;
        const message = erreurChamp(field, formData[field.name]);
        if (message) erreurs[field.name] = message;
    }
    return { ...erreurs, ...(coherence ? coherence(formData) : null) };
}

/** Le premier champ fautif, dans l'ordre du formulaire : celui où poser le focus. */
export function premierChampFautif(fields, erreurs) {
    return fields.flat().find((f) => erreurs[f.name])?.name ?? null;
}
