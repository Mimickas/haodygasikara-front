// Lectures partagées d'un circuit — le back renvoie des steps, l'affichage
// veut un trajet, une durée et un décompte d'étapes.

// L'ordre des étapes est réglé au glisser-déposer côté administration et rangé
// dans `position` ; rien ne garantit que la collection arrive déjà triée du
// back. On s'appuie donc sur `position`, jamais sur l'ordre du tableau.
//
// La liste n'est recopiée que si elle est réellement dans le désordre : dans le
// cas courant la référence reste la même d'un rendu à l'autre, ce qui laisse
// les useMemo et les composants mémoïsés tranquilles.
export const circuitSteps = (circuit) => {
    const steps = circuit?.steps ?? [];
    for (let i = 1; i < steps.length; i++) {
        if ((steps[i - 1]?.position ?? i - 1) > (steps[i]?.position ?? i)) {
            return [...steps].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));
        }
    }
    return steps;
};

export const circuitDays = (circuit) =>
    circuitSteps(circuit).reduce((total, step) => total + (step.durationDays ?? 0), 0);

export const circuitRoute = (circuit) => {
    const steps = circuitSteps(circuit);
    const depart = steps[0]?.place?.nom;
    const arrivee = steps[steps.length - 1]?.place?.nom;
    return depart && arrivee ? { depart, arrivee } : null;
};

// Nombre de lieux distincts traversés par une collection de circuits
export const countDestinations = (circuits = []) => {
    const seen = new Set();
    circuits.forEach((c) =>
        circuitSteps(c).forEach((s) => {
            const key = s.place?.id ?? s.place?.nom;
            if (key) seen.add(key);
        })
    );
    return seen.size;
};
