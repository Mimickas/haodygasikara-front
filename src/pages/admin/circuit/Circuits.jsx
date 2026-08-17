import { useEffect, useState } from "react";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { deleteCircuitApi, findAllCircuitApi, findCircuitStatsApi } from "../../../api/admin/circuit";
import { useCircuitActionToolbar } from "../../../hooks/admin/useCircuitActionToolbar";
import { FaRoute, FaClone, FaHeart, FaFileInvoiceDollar } from "react-icons/fa6";
import Loader from "../../../components/admin/ui/loader/Loader";

export default function Circuits() {
    const { actions } = useCircuitActionToolbar();
    const [circuits, setCircuits] = useState([]);
    const [loadingFetch, setLoadingFetch] = useState({
        loadingStats: true,   // ← true au départ : ça charge dès le montage
        loadingCircuits: true,
    });

    const loadCircuits = async () => {
        try {
            const response = await findAllCircuitApi();
            setCircuits(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des circuits :", error);
        } finally {
            setTimeout(() => {
                setLoadingFetch((prev) => ({ ...prev, loadingCircuits: false }));
            }, 300);
        }
    };

    const [stats, setStats] = useState({ total: 0, templates: 0, favorites: 0, quoteRequests: 0 });

    const loadStats = async () => {
        try {
            const response = await findCircuitStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats circuits :", error);
        } finally {
            setTimeout(() => {
                setLoadingFetch((prev) => ({ ...prev, loadingStats: false }));
            }, 300);

        }
    };

    useEffect(() => {
        loadCircuits();
        loadStats();
    }, []);

    const kpiItems = [
        { label: "Total des circuits",  value: stats.total.value,         hint: stats.total.trend,         accent: "var(--brand-lagune)" },
        { label: "Total des modèles",   value: stats.templates.value,     hint: stats.templates.trend,     accent: "var(--brand-ocre)"   },
        { label: "Total des favoris",   value: stats.favorites.value,     hint: stats.favorites.trend,     accent: "var(--brand-nature)" },
        { label: "Demandes de devis",   value: stats.quoteRequests.value, hint: stats.quoteRequests.trend, accent: "var(--brand-terre)"  },
    ];

    const handleEdit = (id) => {
        console.log("éditer circuit", id);
        actions.edit(id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce circuit ?")) return;
        await deleteCircuitApi(id);
        loadCircuits();
    };

    return (
        <div>
            <div>
                <Toolbar toolbarConfigs={toolbar.circuits} actions={actions} />
            </div>

            <div>

                {loadingFetch.loadingStats
                    ? <Loader variant="kpi" />
                    : <KpiCard items={kpiItems} />
                }
                <DataTable
                    columns={dataTableConstant.circuit}
                    data={circuits}
                    loading={loadingFetch.loadingCircuits}
                    onRowClick={circuit => console.log(circuit)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}0