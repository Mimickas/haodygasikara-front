import { useEffect, useState } from "react";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import toolbar from "../../../constants/admin/toolbar";
import FormModal from "../../../components/admin/crud/form/FormModal";
import createConstant from "../../../constants/admin/createConstant";
import { useTagsGroup } from "../../../hooks/admin/useTagsGroup";
import {
    createTagsGroupsApi, getTagsGroupsApi,
    getTagGroupStatsApi,
} from "../../../api/admin/tagGroupApi";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import dataTableConstant from "../../../constants/admin/dataTableConstant";

const emptyStat = { value: 0, trend: "" };

export default function TagsGroup() {
    const { open, setOpen, actions } = useTagsGroup();
    const [tagsGroups, setTagsGroups] = useState([]);
    const [value, setValue] = useState({});
    const [stats, setStats] = useState({
        total: emptyStat, withTags: emptyStat, empty: emptyStat, createdThisMonth: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingGroups: true });

    const fetchTagsGroups = async () => {
        try {
            const response = await getTagsGroupsApi();
            setTagsGroups(response.data);   // ← ton code fait response.data
        } catch (error) {
            console.error("Erreur lors de la récupération des groupes d'étiquettes :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingGroups: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await getTagGroupStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats groupes :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        fetchTagsGroups();
        loadStats();
    }, []);

    const kpiItems = [
        { label: "Total des groupes", value: stats.total.value,            hint: stats.total.trend,            accent: "var(--brand-lagune)" },
        { label: "Avec tags",         value: stats.withTags.value,         hint: stats.withTags.trend,         accent: "var(--brand-nature)" },
        { label: "Vides",             value: stats.empty.value,            hint: stats.empty.trend,            accent: "var(--brand-ocre)"   },
        { label: "Créés ce mois",     value: stats.createdThisMonth.value, hint: stats.createdThisMonth.trend, accent: "var(--brand-terre)"  },
    ];

    const handleSubmit = async (data) => {
        if (value?.id) {
            await updateTagsGroupsApi(value.id, data);
        } else {
            await createTagsGroupsApi(data);
        }
        await fetchTagsGroups(); // ← CORRIGÉ : c'était loadTags() qui n'existe pas ici
        await loadStats();
        setOpen(false);
        setValue({});
    };

    const handleEdit = (id) => {
        const tagGroup = tagsGroups?.find(t => t.id === id);
        setValue(tagGroup);
        actions.edit(id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cet élément ?")) return;
        await deleteTagGroupApi(id); // ← CORRIGÉ : c'était deletePlacesApi
        setTagsGroups(prev => prev.filter(t => t.id !== id)); // ← CORRIGÉ : c'était setPlaces
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.tagsGroup} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

            <DataTable
                columns={dataTableConstant.tagsGroupColumns}
                data={tagsGroups}
                loading={loadingFetch.loadingGroups}
                onRowClick={group => console.log(group)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>

        <FormModal
            open={open}
            onClose={() => { setOpen(false); setValue({}); }}
            onSubmit={handleSubmit}
            fields={createConstant.tagsGroups}
            value={value}
            title={value?.id ? "Modifier le groupe" : "Nouveau groupe d'étiquettes"}
        />
    </>;
}