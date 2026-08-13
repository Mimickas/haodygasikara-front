import { useEffect, useState } from "react";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import toolbar from "../../../constants/admin/toolbar";
import FormModal from "../../../components/admin/crud/form/FormModal";
import createConstant from "../../../constants/admin/createConstant";
import { useTagsGroup } from "../../../hooks/admin/useTagsGroup";
import { createTagsGroupsApi, getTagsGroupsApi } from "../../../api/admin/tagGroupApi";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";

import SousHeader from "../../../components/admin/layout/sousHeader/SousHeader";
import dataTableConstant from "../../../constants/admin/dataTableConstant";

export default function TagsGroup() {
    const { open, setOpen, actions } = useTagsGroup();
    const [tagsGroups, setTagsGroups] = useState([]);
    const [value, setValue] = useState({});

    const fetchTagsGroups = async () => {
        try {
            const response = await getTagsGroupsApi();
            setTagsGroups(response.data);
            console.log(response);
        }catch (error) {
            console.error("Erreur lors de la récupération des groupes d'étiquettes :", error);
        }
    }

    useEffect(() => { fetchTagsGroups();}, []);

    const handleSubmit = async (data) =>{
        if (value?.id) {
            
        }else{

        }
        await loadTags();
        setOpen(false);
        setValue({});
    }

    const handleEdit = (id) => {
        const tagGroups = tagsGroups?.find(t => t.id === id);
        setValue(tagGroups);
        actions.edit(id); 
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cet élément ?")) return;
        await deletePlacesApi(id);
        setPlaces(prev => prev.filter(p => p.id !== id));
    };
    return <>
        <div className="">
            <Toolbar toolbarConfigs={toolbar.tagsGroup} actions={actions} />
        </div>
        <div className="">
         
            <KpiCard/>

            <DataTable
                columns={dataTableConstant.tagsGroupColumns}
                data={tagsGroups}
                onRowClick={place => console.log(place)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

        </div>

        <FormModal
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={handleSubmit}
            fields={createConstant.tagsGroups}
            value={value}
            title="Nouveau groupe d'étiquettes"
        />
    </>
}