import { Link, useNavigate } from "react-router-dom";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import Button from "../../../components/ui/button/Button";
import InputComponent from "../../../components/ui/input/InputComponent";
import createConstant from "../../../constants/admin/createConstant";
import FormModal from "../../../components/admin/crud/form/FormModal";
import { useEffect, useState } from "react";
import { createTagsApi, findAllTags } from "../../../api/admin/tag";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import toolbar from "../../../constants/admin/toolbar";
import { useTags } from "../../../hooks/admin/useTags";

import DataTable from "../../../components/admin/ui/tableau/DataTable";
import dataTableConstant from "../../../constants/admin/dataTableConstant";

export default function Tags() {
    const navigate = useNavigate();
    const { open, setOpen, actions, fields } = useTags();
    const [fetchTags, setFetchTags] = useState([]);
    useEffect(()=> {

        const fetchTags = async () => {
            try {
                const response = await findAllTags();
                setFetchTags(response);
                console.log(response);
            }catch (error) {
                console.error("Erreur lors de la récupération des tags :", error);
            }
        };

        fetchTags();

    },[])

    return <>
        <div >
    
            <Toolbar toolbarConfigs={toolbar.tags} actions={actions} />

        </div>
        <div>
      
            <KpiCard/>

            <DataTable
                columns={dataTableConstant.tagColumns}
                data={fetchTags.data}
                onRowClick={place => console.log(place)}
            />
            

            <FormModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={async data => await createTagsApi(data)}
                fields={fields}  // ← enrichis avec les options
                title="Nouveau tag"
            />
        </div>
    </>
}