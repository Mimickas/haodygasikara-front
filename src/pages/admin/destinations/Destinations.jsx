import { useEffect, useState } from "react";
import Button from "../../../components/ui/button/Button";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import { deletePlacesApi, getPlacesApi } from "../../../api/admin/places";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import { useDestinationActionToolbar } from "../../../hooks/admin/useDestinationActionToolbar";
import toolbar from "../../../constants/admin/toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";


export default function Destinations() {
    const { actions } = useDestinationActionToolbar();
    const [places, setPlaces] = useState([]);

    const handleEdit = (id) => {
        actions.edit(id); 
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cet élément ?")) return;
        await deletePlacesApi(id);
        setPlaces(prev => ({ ...prev, data: prev.data.filter(p => p.id !== id) }));
    };
    
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const data = await getPlacesApi();
                setPlaces(data.data);
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
                    data={places}
                    onRowClick={place => console.log(place)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        </>
    );
}