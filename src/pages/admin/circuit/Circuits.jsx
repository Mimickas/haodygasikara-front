import { useEffect, useState } from "react";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { findAllCircuitApi } from "../../../api/admin/circuit";
import { useCircuitActionToolbar } from "../../../hooks/admin/useCircuitActionToolbar";

export default function Circuits() {
    const { actions } = useCircuitActionToolbar();
    const [circuits, setCircuits] = useState([]);

    const loadCircuits = async () => {
        try {
            const response = await findAllCircuitApi();
            setCircuits(response.data);   // ApiResponse → response.data = le tableau
        } catch (error) {
            console.error("Erreur lors de la récupération des circuits :", error);
        }
    };

    useEffect(() => { loadCircuits(); }, []);

    const handleEdit = (id) => {
        console.log("éditer circuit", id);
        // à brancher plus tard
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce circuit ?")) return;
        // await deleteCircuitApi(id);
        setCircuits(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div>
            <div>
                <Toolbar toolbarConfigs={toolbar.circuits} actions={actions} />
            </div>

            <div>
                <KpiCard />

                <DataTable
                    columns={dataTableConstant.circuit}
                    data={circuits}
                    onRowClick={circuit => console.log(circuit)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}