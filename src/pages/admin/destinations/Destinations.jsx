import { useEffect, useState } from "react";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import { deletePlacesApi, getPlacesApi, getPlaceStatsApi } from "../../../api/admin/places";
import { useDestinationActionToolbar } from "../../../hooks/admin/useDestinationActionToolbar";
import toolbar from "../../../constants/admin/toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";

const emptyStat = { value: 0, trend: "" };

export default function Destinations() {
    const { actions } = useDestinationActionToolbar();
    const [places, setPlaces] = useState([]);
    const [stats, setStats] = useState({
        total: emptyStat, withTags: emptyStat, withoutTags: emptyStat, createdThisMonth: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingPlaces: true });

    const loadPlaces = async () => {
        try {
            const response = await getPlacesApi();
            setPlaces(response.data);   
        } catch (error) {
            console.error("Erreur lors de la récupération des places :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingPlaces: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await getPlaceStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats destinations :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        loadPlaces();
        loadStats();
    }, []);

    const kpiItems = [
        { label: "Total des destinations", value: stats.total.value,            hint: stats.total.trend,            accent: "var(--brand-lagune)" },
        { label: "Avec tags",              value: stats.withTags.value,         hint: stats.withTags.trend,         accent: "var(--brand-nature)" },
        { label: "Sans tags",              value: stats.withoutTags.value,      hint: stats.withoutTags.trend,      accent: "var(--brand-ocre)"   },
        { label: "Créées ce mois",         value: stats.createdThisMonth.value, hint: stats.createdThisMonth.trend, accent: "var(--brand-terre)"  },
    ];

    const handleEdit = (id) => {
        actions.edit(id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cet élément ?")) return;
        await deletePlacesApi(id);
        setPlaces(prev => prev.filter(p => p.id !== id)); // ← CORRIGÉ : tableau, pas objet
    };

    return (
        <>
            <div>
                <Toolbar toolbarConfigs={toolbar.destinations} actions={actions} />
            </div>

            <div>
                <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

                <DataTable
                    columns={dataTableConstant.destination}
                    data={places}
                    loading={loadingFetch.loadingPlaces}
                    onRowClick={place => console.log(place)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </>
    );
}