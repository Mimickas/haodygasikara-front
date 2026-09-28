// Fourchettes de durée proposées dans la barre d'index des circuits
export const DURATIONS = [
    { id: "all",   label: "Tous",         match: () => true },
    { id: "short", label: "7 j et moins", match: (jours) => jours > 0 && jours <= 7 },
    { id: "mid",   label: "8 — 14 j",     match: (jours) => jours >= 8 && jours <= 14 },
    { id: "long",  label: "15 j et plus", match: (jours) => jours >= 15 },
];
