import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCircuitActionToolbar } from "../../../hooks/admin/useCircuitActionToolbar";

export default function Circuits(params) {
    const { actions } = useCircuitActionToolbar();

    return (
        <div>
            <div>
                <Toolbar toolbarConfigs={toolbar.circuits} actions={actions} />
            </div>

            <div>
                <div>
                    <KpiCard />
                </div>

                {/* <DataTable
                    columns={dataTableConstant.circuits}
                    data={null}
                    onRowClick={place => console.log(place)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                /> */}
            </div>
        </div>
    )
}