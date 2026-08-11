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
    const [fetchTagsGroups, setFetchTagsGroups] = useState([]);
    useEffect(() => {
        const fetchTagsGroups = async () => {
            try {
                const response = await getTagsGroupsApi();
                setFetchTagsGroups(response.data);
                console.log(response);
            }catch (error) {
                console.error("Erreur lors de la récupération des groupes d'étiquettes :", error);
            }
        }
        fetchTagsGroups();
    }, []);
    console.log(fetchTagsGroups);
    return <>
        <div className="">
            <Toolbar toolbarConfigs={toolbar.tagsGroup} actions={actions} />
        </div>
        <div className="">
         
            <KpiCard/>

            <DataTable
                columns={dataTableConstant.tagsGroupColumns}
                data={fetchTagsGroups}
                onRowClick={place => console.log(place)}
            />

        </div>

        <FormModal
            open={open}
            onClose={() => setOpen(false)}
            onSubmit={async data => { await createTagsGroupsApi(data) }}
            fields={createConstant.tagsGroups}
            title="Nouveau groupe d'étiquettes"
        />
    </>
}