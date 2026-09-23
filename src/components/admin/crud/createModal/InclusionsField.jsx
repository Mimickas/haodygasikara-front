// Ce qui est compris dans le prix, et ce qui ne l'est pas.
//
// Une seule liste, une colonne « Compris » : c'est le même objet des deux côtés,
// il change de liste à l'affichage. Saisir deux tableaux séparés aurait forcé à
// dupliquer le poste et l'ordre.
//
// Seules les lignes que le PROGRAMME ne sait pas dire se saisissent ici — les
// vols, l'assurance, le véhicule privé, les pourboires. Les nuitées, les repas
// et les visites se déduisent tout seuls du programme jour par jour, et les
// retaper ici reviendrait à les faire mentir au premier changement d'étape.
export default function InclusionsField({ value = [], onChange, options = [] }) {
    const lignes = Array.isArray(value) ? value : [];

    const modifier = (i, champ, v) =>
        onChange(lignes.map((l, j) => (j === i ? { ...l, [champ]: v } : l)));

    const retirer = (i) => onChange(lignes.filter((_, j) => j !== i));

    const ajouter = () =>
        onChange([...lignes, { categorie: options[0]?.value ?? "AUTRE", libelle: "", inclus: true }]);

    return (
        <div className="flex flex-col gap-2">
            {lignes.map((ligne, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <select
                        value={ligne.categorie ?? ""}
                        onChange={(e) => modifier(i, "categorie", e.target.value)}
                        className="px-3 py-2 text-sm outline-none w-44 shrink-0"
                        style={champStyle}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        value={ligne.libelle ?? ""}
                        onChange={(e) => modifier(i, "libelle", e.target.value)}
                        placeholder="Ex : transport privé en 4x4 avec chauffeur"
                        className="px-3 py-2 text-sm outline-none w-full"
                        style={champStyle}
                    />

                    <select
                        value={ligne.inclus === false ? "false" : "true"}
                        onChange={(e) => modifier(i, "inclus", e.target.value === "true")}
                        className="px-3 py-2 text-sm outline-none w-40 shrink-0"
                        style={champStyle}
                    >
                        <option value="true">Compris</option>
                        <option value="false">Non compris</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => retirer(i)}
                        aria-label="Retirer cette ligne"
                        className="w-9 h-9 shrink-0 flex items-center justify-center text-sm cursor-pointer transition-colors"
                        style={{ ...champStyle, color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                        ✕
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={ajouter}
                className="self-start text-sm px-3.5 py-1.5 cursor-pointer transition-colors"
                style={{
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-card)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-terre)";
                    e.currentTarget.style.color = "var(--brand-terre)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                }}
            >
                + Ajouter une ligne
            </button>
        </div>
    );
}

const champStyle = {
    backgroundColor: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: "var(--radius-md)",
};
