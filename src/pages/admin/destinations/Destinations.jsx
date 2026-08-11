import { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import { getPlacesApi } from "../../../api/admin/places";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import { useDestinationActionToolbar } from "../../../hooks/admin/useDestinationActionToolbar";
import toolbar from "../../../constants/admin/toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";


export default function Destinations() {
    const { actions } = useDestinationActionToolbar();
    const [places, setPlaces] = useState([]);

    const handleEdit = (id) => {
        // ouvre ta modale d'édition avec cet id
        console.log("éditer", id);
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cet élément ?")) return;
        await api.delete(`/tags/${id}`);        // ← ton endpoint
        setTags((prev) => prev.filter((t) => t.id !== id));
    };
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const data = await getPlacesApi();
                setPlaces(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des places :", error);
            }
        };
        fetchPlaces();
    }, []);

    console.log(places);

    return (
        <>
            <div>
                <Toolbar toolbarConfigs={toolbar.destinations} actions={actions} />
            </div>

            <div>
                <div>
                    <KpiCard />
                </div>

                <DataTable
                    columns={dataTableConstant.destination}
                    data={places.data}
                    onRowClick={place => console.log(place)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </>
    );
}