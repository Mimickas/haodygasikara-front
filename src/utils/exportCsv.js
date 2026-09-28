// Export CSV d'une liste de l'administration, tel que l'écran la montre
// (recherche, filtre et tri appliqués), pour l'ouvrir dans Excel ou Sheets.
//
// Séparateur « ; » et BOM UTF-8 : c'est ce qu'attend un Excel réglé en
// français — avec une virgule et sans BOM, tout tombe dans une colonne et les
// accents cassent.

const BOM = String.fromCharCode(0xfeff);

// La valeur lisible d'une cellule : une colonne peut fournir `texte(val, ligne)`
// quand son rendu est du JSX (pastille, lien…).
const texteBrut = (v) => {
    if (v == null) return "";
    if (Array.isArray(v)) return v.map(texteBrut).join(", ");
    if (typeof v === "object") return v.nom ?? v.name ?? v.libelle ?? v.reference ?? "";
    return String(v);
};

const cellule = (texte) => `"${String(texte).replaceAll('"', '""')}"`;

export const exporterCsv = (nom, colonnes, lignes) => {
    const cols = colonnes.filter((c) => c.type !== "actions" && c.export !== false);
    const entete = cols.map((c) => cellule(c.label)).join(";");
    const corps = lignes.map((l) => cols
        .map((c) => cellule(c.texte ? c.texte(l[c.key], l) : texteBrut(l[c.key])))
        .join(";"));

    const blob = new Blob([BOM + [entete, ...corps].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `${nom}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
