import { useEffect, useState } from "react";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import { deleteDestinationsApi, getDestinationsApi, getDestinationStatsApi } from "../../../api/admin/destinations";
import { useDestinationActionToolbar } from "../../../hooks/admin/useDestinationActionToolbar";
import { parDate, parNombre, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { useSuppressionAdmin } from "../../../hooks/admin/useSuppressionAdmin";
import dataTableConstant from "../../../constants/admin/dataTableConstant";

// ── Les destinations — la page de référence de l'administration ──────────
//
// Barre (recherche, tri, filtres, export, création), quatre indicateurs,
// tableau paginé. Toutes les autres listes sont construites sur ce modèle.

const emptyStat = { value: 0, trend: "" };

const FILTRES = [
    { cle: "TOUTES", libelle: "Toutes", garde: () => true },
    { cle: "AVEC", libelle: "Avec étiquettes", garde: (d) => (d.tags?.length ?? 0) > 0 },
    { cle: "SANS", libelle: "Sans étiquette", garde: (d) => !d.tags?.length },
];

const TRIS = [
    { cle: "RECENTES", libelle: "Plus récentes", comparer: parDate("createdAt") },
    { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("nom") },
    { cle: "ETOILES", libelle: "Mieux notées", comparer: parNombre("stars") },
];

export default function Destinations() {
    const { actions } = useDestinationActionToolbar();
    const [destinations, setDestinations] = useState([]);
    const [stats, setStats] = useState({
        total: emptyStat, withTags: emptyStat, withoutTags: emptyStat, createdThisMonth: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingDestinations: true });

    const loadDestinations = async () => {
        try {
            const response = await getDestinationsApi();
            setDestinations(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des destinations :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingDestinations: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await getDestinationStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats destinations :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        loadDestinations();
        loadStats();
    }, []);

    const liste = useListeAdmin(destinations, {
        recherche: (d) => [d.nom, d.description, ...(d.tags ?? [])],
        filtres: FILTRES,
        tris: TRIS,
        export: { nom: "destinations", colonnes: dataTableConstant.destination },
    });

    const suppression = useSuppressionAdmin({
        supprimer: deleteDestinationsApi,
        apres: async () => { await loadDestinations(); await loadStats(); },
        titre: "Supprimer cette destination ?",
        texte: "Ses photos et sa vidéo partent avec elle. Une destination encore utilisée par un circuit ne peut pas être supprimée.",
    });

    const kpiItems = [
        { label: "Total des destinations", value: stats.total.value,            hint: stats.total.trend,            accent: "var(--brand-lagune)" },
        { label: "Avec étiquettes",        value: stats.withTags.value,         hint: stats.withTags.trend,         accent: "var(--brand-nature)" },
        { label: "Sans étiquette",         value: stats.withoutTags.value,      hint: stats.withoutTags.trend,      accent: "var(--brand-ocre)"   },
        { label: "Créées ce mois",         value: stats.createdThisMonth.value, hint: stats.createdThisMonth.trend, accent: "var(--brand-terre)"  },
    ];

    return <>
        <Toolbar liste={liste} placeholder="Rechercher une destination…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Nouvelle destination", onClick: actions.create, primaire: true },
        ]} />

        <BandeauErreur message={suppression.erreur} onFermer={() => suppression.setErreur(null)} />
        <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

        <DataTable
            columns={dataTableConstant.destination}
            data={liste.lignes}
            loading={loadingFetch.loadingDestinations}
            onRowClick={(d) => actions.edit(d.id)}
            onEdit={actions.edit}
            onDelete={suppression.demander}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucune destination", texte: "Créez la première : elle servira aux circuits et au créateur de voyage." }}
        />

        {suppression.modale}
    </>;
}
