import { useMemo, useState } from "react";
import { exporterCsv } from "../../utils/exportCsv";

// ── La liste d'un écran d'administration ──────────────────────────────────
//
// Recherche, filtre, tri et export, appliqués aux données déjà chargées —
// les mêmes sur toutes les pages, pilotés par la même barre (Toolbar).
//
//   recherche : (ligne) => [valeurs où chercher]
//   filtres   : [{ cle, libelle, garde(ligne) }]  — le premier est le filtre par défaut
//   tris      : [{ cle, libelle, comparer(a, b) }] — le premier est le tri par défaut
//   export    : { nom, colonnes }                  — les colonnes du DataTable
//
// La recherche ignore la casse et les accents : « etoile » trouve « Étoile ».

const sansAccent = (v) => String(v ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function useListeAdmin(donnees, { recherche, filtres = [], tris = [], export: exp } = {}) {
    const [terme, setTerme] = useState("");
    const [filtre, setFiltre] = useState(filtres[0]?.cle ?? null);
    const [tri, setTri] = useState(tris[0]?.cle ?? null);

    const liste = useMemo(() => donnees ?? [], [donnees]);

    const filtresComptes = useMemo(
        () => filtres.map((f) => ({ ...f, compte: liste.filter(f.garde).length })),
        // les filtres sont déclarés par la page, stables d'un rendu à l'autre
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [liste]);

    const lignes = useMemo(() => {
        const garde = filtres.find((f) => f.cle === filtre)?.garde ?? (() => true);
        const mots = sansAccent(terme).trim().split(/\s+/).filter(Boolean);
        const trouve = (l) => {
            if (!mots.length || !recherche) return true;
            const texte = sansAccent(recherche(l).filter((v) => v != null).join(" "));
            return mots.every((m) => texte.includes(m));
        };
        const resultat = liste.filter(garde).filter(trouve);
        const comparer = tris.find((t) => t.cle === tri)?.comparer;
        return comparer ? [...resultat].sort(comparer) : resultat;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liste, terme, filtre, tri]);

    return {
        lignes,
        // Des données, mais rien ne correspond : le tableau le dit autrement qu'une liste vide
        aucunResultat: liste.length > 0 && lignes.length === 0,
        recherche: terme, setRecherche: setTerme,
        filtres: filtresComptes, filtre, setFiltre,
        tris, tri, setTri,
        exporter: exp ? () => exporterCsv(exp.nom, exp.colonnes, lignes) : undefined,
    };
}

// Les tris qui reviennent partout
export const parTexte = (champ) => (a, b) => String(a[champ] ?? "").localeCompare(String(b[champ] ?? ""), "fr");
export const parDate = (champ, sens = -1) => (a, b) => sens * (new Date(a[champ] ?? 0) - new Date(b[champ] ?? 0));
export const parNombre = (champ, sens = -1) => (a, b) => sens * ((a[champ] ?? 0) - (b[champ] ?? 0));
