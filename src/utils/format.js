import { circuitSteps } from "./circuit";

export const formatDate = (value) => value
    ? new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
    : "—";

// Prix à la française, séparateur de milliers : 250000.5 → "250 000,5"
export const formatPrice = (value) => value != null && value !== ""
    ? new Intl.NumberFormat("fr-FR").format(value)
    : "—";

// Date seule, sans heure : "12 oct. 2026"
export const formatDateCourte = (value) => value
    ? new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

// Libellé d'une date de départ : "Majunga vers le nord · 12 oct. 2026 → 19 oct. 2026"
export const formatCircuitDate = (date) => date
    ? `${date.circuitNom} · ${formatDateCourte(date.dateDebut)} → ${formatDateCourte(date.dateFin)}`
    : "—";

// Libellé lisible d'un tarif : "Majunga vers le nord · 12 oct. 2026 · Adulte · 250 000 MGA"
export const formatCircuitTarif = (tarif) => tarif
    ? `${tarif.circuitNom} · ${formatDateCourte(tarif.dateDebut)} · ${tarif.categoryTarif?.name} · ${formatPrice(tarif.price)} ${tarif.devise?.code}`
    : "—";

// Libellé d'une étape de circuit : "Majunga vers le nord · Étape 2 · Nosy Be (3 j)"
export const formatCircuitStep = (circuit, step) => circuit && step
    ? `${circuit.name} · Étape ${step.position} · ${step.destinationNom} (${step.durationDays} j)`
    : "—";

// Libellé d'un point d'intérêt : "Hôtel du Lac · Hôtel · ★★★"
export const formatPoi = (poi) => poi
    ? [poi.nom, poi.categoryPoi?.name, poi.stars ? "★".repeat(poi.stars) : null].filter(Boolean).join(" · ")
    : "—";

// Un texte libre découpé en paragraphes. Le back range les notes d'un circuit
// dans un seul champ : rendu tel quel dans un <p>, ses retours à la ligne sont
// écrasés et tout finit en un pavé. On rend ce que l'auteur a écrit.
export const enParagraphes = (texte) => (texte ?? "")
    .split(/\n+/)
    .map((ligne) => ligne.trim())
    .filter(Boolean);

// Repas compris dans une journée : "Petit-déjeuner · Dîner"
export const formatRepas = (day) => {
    const repas = [
        day?.petitDejeuner && "Petit-déjeuner",
        day?.dejeuner && "Déjeuner",
        day?.diner && "Dîner",
    ].filter(Boolean);
    return repas.length ? repas.join(" · ") : "—";
};

// Jour d'un circuit entier : durées des étapes qui précèdent + jour dans l'étape.
// Si l'étape 1 dure 3 jours, le jour 1 de l'étape 2 est le jour 4 du circuit.
export const circuitDayNumber = (circuit, stepPosition, jour) =>
    circuitSteps(circuit)
        .filter((step) => step.position < stepPosition)
        .reduce((total, step) => total + (step.durationDays ?? 0), 0) + (jour ?? 0);

// Libellé d'un jour de programme : "Majunga vers le nord · Jour 4 · Nosy Be"
// Sans le circuit sous la main, on retombe sur le jour dans l'étape
export const formatCircuitDay = (day, circuit) => day
    ? `${day.circuitNom} · Jour ${circuit ? circuitDayNumber(circuit, day.stepPosition, day.jour) : day.jour} · ${day.destinationNom}`
    : "—";
