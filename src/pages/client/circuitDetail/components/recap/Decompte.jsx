// ── Le décompte ───────────────────────────────────────────────────────────
// Quatre chiffres tirés du programme jour par jour, jamais saisis : une nuit
// ajoutée à une étape se voit ici sans que personne y pense. C'est la garantie
// que ces chiffres ne peuvent pas mentir au client — ils SONT le programme.
//
// Ce sont les seuls chiffres de la page : ils ont donc le droit d'être grands.
//
// Pas de <dl> ici : ce ne sont pas des définitions mais des mesures, et une
// liste de description n'accepte pas la ligne de détail qui les suit.
export default function Decompte({ recap }) {
    if (!recap) return null;

    const repas = (recap.petitsDejeuners ?? 0) + (recap.dejeuners ?? 0) + (recap.diners ?? 0);
    const pluriel = (n, singulier, pluriel) => (n > 1 ? pluriel : singulier);

    const chiffres = [
        { cle: "nuitees", valeur: recap.nuitees ?? 0,
          legende: pluriel(recap.nuitees ?? 0, "Nuitée", "Nuitées") },
        { cle: "repas", valeur: repas,
          legende: pluriel(repas, "Repas compris", "Repas compris") },
        { cle: "incluses", valeur: recap.visitesIncluses ?? 0,
          legende: pluriel(recap.visitesIncluses ?? 0, "Visite comprise", "Visites comprises") },
        { cle: "option", valeur: recap.visitesEnOption ?? 0,
          legende: pluriel(recap.visitesEnOption ?? 0, "Visite en option", "Visites en option") },
    ].filter((c) => c.valeur > 0);

    if (!chiffres.length) return null;

    // « 3 nuits en hôtel, 1 nuit en écolodge » — déduit des séjours.
    const hebergements = (recap.hebergements ?? [])
        .map((h) => `${h.nuitees} nuit${h.nuitees > 1 ? "s" : ""} en ${h.libelle.toLowerCase()}`)
        .join(", ");

    return (
        <>
            {/* La grille crée exactement autant de colonnes qu'il y a de
                chiffres, et elles se partagent toute la largeur. */}
            <div className="cx-compte">
                {chiffres.map((c) => (
                    <div key={c.cle} className="min-w-0">
                        <span className="cx-compte__valeur font-body-strong tabular-nums">
                            {String(c.valeur).padStart(2, "0")}
                        </span>
                        <span className="cx-compte__legende cx-label cx-label--legende font-body-strong block">
                            {c.legende}
                        </span>
                    </div>
                ))}
            </div>

            {/* Hors de la grille : en flux colonne, une ligne pleine largeur
                n'existe pas. */}
            {hebergements && (
                <p className="cx-compte__detail font-body">{hebergements}</p>
            )}
        </>
    );
}
