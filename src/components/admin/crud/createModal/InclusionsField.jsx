import { FaPlus, FaXmark } from "react-icons/fa6";

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
        <div className="ad-lignes">
            {lignes.map((ligne, i) => (
                <div key={i} className="ad-ligne">
                    <select
                        value={ligne.categorie ?? ""}
                        onChange={(e) => modifier(i, "categorie", e.target.value)}
                        aria-label="Catégorie"
                        className="ad-champ font-body w-44 shrink-0"
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
                        aria-label="Libellé"
                        className="ad-champ font-body"
                    />

                    <select
                        value={ligne.inclus === false ? "false" : "true"}
                        onChange={(e) => modifier(i, "inclus", e.target.value === "true")}
                        aria-label="Compris ou non"
                        className="ad-champ font-body w-40 shrink-0"
                    >
                        <option value="true">Compris</option>
                        <option value="false">Non compris</option>
                    </select>

                    <button type="button" onClick={() => retirer(i)} aria-label="Retirer cette ligne" className="ad-retirer">
                        <FaXmark className="text-xs" aria-hidden="true" />
                    </button>
                </div>
            ))}

            <button type="button" onClick={ajouter} className="ad-bouton font-body-strong self-start">
                <FaPlus aria-hidden="true" /> Ajouter une ligne
            </button>
        </div>
    );
}
