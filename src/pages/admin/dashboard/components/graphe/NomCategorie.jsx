import { ENCRE_DOUCE } from "./apparence";

const MAX_CARACTERES = 22;

// Le nom en face de la barre. Trop long, il est coupé : le nom entier reste
// au survol et dans le tableau.
export default function NomCategorie({ x, y, payload }) {
    const nom = String(payload?.value ?? "");
    const court = nom.length > MAX_CARACTERES ? `${nom.slice(0, MAX_CARACTERES - 1)}…` : nom;
    return (
        <text x={x} y={y} dy={4} textAnchor="end" fill={ENCRE_DOUCE} fontSize={13}>
            <title>{nom}</title>
            {court}
        </text>
    );
}
