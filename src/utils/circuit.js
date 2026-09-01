// Lectures partagées d'un circuit — le back renvoie des steps, l'affichage
// veut un trajet, une durée et un décompte d'étapes.

export const circuitSteps = (circuit) => circuit?.steps ?? [];

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
