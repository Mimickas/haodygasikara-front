import { useEffect, useState } from "react";
import { createTagsApi, findAllTags, updateTagApi } from "../../../api/admin/tag";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useTags } from "../../../hooks/admin/useTags";

export default function Tags() {
    const { open, setOpen, actions, fields } = useTags();
    const [fetchTags, setFetchTags] = useState({ data: [] });
    const [value, setValue] = useState({});

    const loadTags = async () => {
        try {
            const response = await findAllTags();
            setFetchTags(response);
        } catch (error) {
            console.error("Erreur lors de la récupération des tags :", error);
        }
    };

    useEffect(() => { loadTags(); }, []);

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
        setOpen(false);
        setValue({});
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.tags} actions={actions} />
        </div>

        <div>
            <KpiCard />

            <DataTable
                columns={dataTableConstant.tagColumns}
                data={fetchTags.data}
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