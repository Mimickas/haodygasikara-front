import { useEffect, useState } from "react";
import { createTagsApi, findAllTags, getTagStatsApi, updateTagApi } from "../../../api/admin/tag";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useTags } from "../../../hooks/admin/useTags";

const emptyStat = { value: 0, trend: "" };

export default function Tags() {
    const { open, setOpen, actions, fields } = useTags();
    const [fetchTags, setFetchTags] = useState({ data: [] });
    const [value, setValue] = useState({});
    const [stats, setStats] = useState({
        total: emptyStat, used: emptyStat, orphans: emptyStat, grouped: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingTags: true });

    const loadTags = async () => {
        try {
            const response = await findAllTags();
            setFetchTags(response);   // ← ton code garde la forme { data: [...] }
        } catch (error) {
            console.error("Erreur lors de la récupération des tags :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingTags: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await getTagStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats tags :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        loadTags();
        loadStats();
    }, []);

    const kpiItems = [
        { label: "Total des tags", value: stats.total.value,   hint: stats.total.trend,   accent: "var(--brand-lagune)" },
        { label: "Utilisés",       value: stats.used.value,    hint: stats.used.trend,    accent: "var(--brand-nature)" },
        { label: "Orphelins",      value: stats.orphans.value, hint: stats.orphans.trend, accent: "var(--brand-ocre)"   },
        { label: "Groupés",        value: stats.grouped.value, hint: stats.grouped.trend, accent: "var(--brand-terre)"  },
    ];

    const handleEdit = async (id) => {
        const tag = fetchTags.data?.find(t => t.id === id);
        setValue(tag);
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cet élément ?")) return;
        // await deleteTagApi(id);
        setFetchTags(prev => ({ ...prev, data: prev.data.filter(t => t.id !== id) }));
    };

    const handleSubmit = async (data) => {
        if (value?.id) {
            await updateTagApi(value.id, data);
        } else {
            await createTagsApi(data);
        }
        await loadTags();
        await loadStats(); // ← les stats changent après create/delete, on recharge
        setOpen(false);
        setValue({});
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.tags} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

            <DataTable
                columns={dataTableConstant.tagColumns}
                data={fetchTags.data}
                loading={loadingFetch.loadingTags}
                onRowClick={tag => console.log(tag)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier le tag" : "Nouveau tag"}
            />
        </div>
    </>;
}