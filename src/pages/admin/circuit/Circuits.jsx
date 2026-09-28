import { useEffect, useState } from "react";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import { deleteCircuitApi, findAllCircuitApi, findCircuitStatsApi } from "../../../api/admin/circuit";
import { useCircuitActionToolbar } from "../../../hooks/admin/useCircuitActionToolbar";
import { parDate, parNombre, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { useSuppressionAdmin } from "../../../hooks/admin/useSuppressionAdmin";

// ── Les circuits de l'agence ──────────────────────────────────────────────
//
// Seulement ceux de l'agence : les voyages composés par les voyageurs ont
// leur propre écran, en lecture seule. Un circuit publié est au catalogue
// public — c'est le voyageur qui donne sa date en demandant son devis.

const emptyStat = { value: 0, trend: "" };

const FILTRES = [
    { cle: "TOUS", libelle: "Tous", garde: () => true },
    { cle: "PUBLIES", libelle: "Publiés", garde: (c) => c.isTemplate },
    { cle: "NON_PUBLIES", libelle: "Non publiés", garde: (c) => !c.isTemplate },
    // Publié mais sans programme : il est en ligne et ne raconte rien
    { cle: "SANS_PROGRAMME", libelle: "Sans programme", garde: (c) => !c.dureeJours },
];

const TRIS = [
    { cle: "RECENTS", libelle: "Plus récents", comparer: parDate("createdAt") },
    { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("name") },
    { cle: "DUREE", libelle: "Plus longs", comparer: parNombre("dureeJours") },
];

export default function Circuits() {
    const { actions } = useCircuitActionToolbar();
    const [circuits, setCircuits] = useState([]);
    const [stats, setStats] = useState({
        total: emptyStat, enCatalogue: emptyStat, demandesDevis: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingCircuits: true });

    const loadCircuits = async () => {
        try {
            const response = await findAllCircuitApi();
            setCircuits(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des circuits :", error);
        } finally {
            setLoadingFetch((prev) => ({ ...prev, loadingCircuits: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await findCircuitStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats circuits :", error);
        } finally {
            setLoadingFetch((prev) => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        loadCircuits();
        loadStats();
    }, []);

    const liste = useListeAdmin(circuits, {
        recherche: (c) => [c.name, c.notes, ...(c.steps ?? []).map((s) => s.destinationNom)],
        filtres: FILTRES,
        tris: TRIS,
        export: { nom: "circuits", colonnes: dataTableConstant.circuit },
    });

    const suppression = useSuppressionAdmin({
        supprimer: deleteCircuitApi,
        apres: async () => { await loadCircuits(); await loadStats(); },
        titre: "Supprimer ce circuit ?",
        texte: "Son programme, ses photos et sa vidéo partent avec lui.",
    });

    const kpiItems = [
        { label: "Circuits de l'agence", value: stats.total.value,         hint: stats.total.trend,         accent: "var(--brand-lagune)" },
        { label: "En ligne",             value: stats.enCatalogue.value,   hint: stats.enCatalogue.trend,   accent: "var(--brand-nature)" },
        { label: "Demandes de devis",    value: stats.demandesDevis.value, hint: stats.demandesDevis.trend, accent: "var(--brand-terre)"  },
    ];

    return <>
        <Toolbar liste={liste} placeholder="Rechercher un circuit, une étape…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Nouveau circuit", onClick: actions.create, primaire: true },
        ]} />

        <BandeauErreur message={suppression.erreur} onFermer={() => suppression.setErreur(null)} />
        <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

        <DataTable
            columns={dataTableConstant.circuit}
            data={liste.lignes}
            loading={loadingFetch.loadingCircuits}
            onRowClick={(c) => actions.edit(c.id)}
            onEdit={actions.edit}
            onDelete={suppression.demander}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucun circuit", texte: "Créez le premier circuit de l'agence : programme, photos, fiche technique." }}
        />

        {suppression.modale}
    </>;
}
