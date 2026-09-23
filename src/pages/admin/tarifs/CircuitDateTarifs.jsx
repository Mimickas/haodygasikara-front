import { useEffect, useMemo, useState } from "react";
import {
    createCircuitDateTarifApi, findAllCircuitDateTarifsApi,
    updateCircuitDateTarifApi, deleteCircuitDateTarifApi,
} from "../../../api/admin/circuitDateTarifApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCircuitDateTarif } from "../../../hooks/admin/useCircuitDateTarif";
import { apiErrorMessage } from "../../../utils/apiError";

// ← pas d'endpoint /stats ici : les KPI sont dérivés de la liste déjà chargée

export default function CircuitDateTarifs() {
    const { open, setOpen, actions, fields } = useCircuitDateTarif();
    const [circuitDateTarifs, setCircuitDateTarifs] = useState([]);
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCircuitDateTarifs: true });

    const loadCircuitDateTarifs = async () => {
        try {
            const response = await findAllCircuitDateTarifsApi();
            setCircuitDateTarifs(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des dates de départ :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCircuitDateTarifs: false }));
        }
    };

    useEffect(() => {
        loadCircuitDateTarifs();
    }, []);

    const kpiItems = useMemo(() => {
        const list = circuitDateTarifs ?? [];
        const aujourdhui = new Date().toISOString().slice(0, 10);   // ← comparaison directe : le back renvoie des dates ISO
        const circuitIds = new Set(list.map(d => d.circuitId).filter(Boolean));
        const aVenir     = list.filter(d => d.dateDebut >= aujourdhui).length;
        const sansTarif  = list.filter(d => !d.circuitTarifs?.length).length;

        return [
            { label: "Total départs",     value: list.length,     hint: list.length > 1 ? "dates enregistrées" : "date enregistrée", accent: "var(--brand-lagune)" },
            { label: "Circuits couverts", value: circuitIds.size, hint: "circuits ayant au moins une date",                          accent: "var(--brand-nature)" },
            { label: "À venir",           value: aVenir,          hint: `${list.length - aVenir} déjà passés`,                       accent: "var(--brand-ocre)"   },
            { label: "Sans tarif",        value: sansTarif,       hint: "départs sans prix : invendables",                           accent: "var(--brand-terre)"  },
        ];
    }, [circuitDateTarifs]);

    const handleEdit = async (id) => {
        const circuitDateTarif = circuitDateTarifs?.find(d => d.id === id);
        // ← objet plat : exactement les noms de champs du formulaire + l'id.
        //   La date de retour n'est pas reprise : elle se recalcule à l'enregistrement
        setValue({
            id:        circuitDateTarif?.id,
            circuitId: circuitDateTarif?.circuitId,
            dateDebut: circuitDateTarif?.dateDebut,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette date de départ ? Ses tarifs seront supprimés avec elle.")) return;
        try {
            await deleteCircuitDateTarifApi(id);
            await loadCircuitDateTarifs();
        } catch (error) {
            console.error("Erreur lors de la suppression de la date :", error);
            alert(error.response?.data?.message || "Suppression impossible.");
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite : le <select> renvoie une chaîne, la date arrive en AAAA-MM-JJ.
        //   Pas de date de retour : le back la déduit de la durée du programme
        const payload = {
            circuitId: data.circuitId ? Number(data.circuitId) : null,
            dateDebut: data.dateDebut || null,
        };

        try {
            if (value?.id) {
                await updateCircuitDateTarifApi(value.id, payload);
            } else {
                await createCircuitDateTarifApi(payload);
            }
            await loadCircuitDateTarifs();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la date :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 date déjà prise, 400 circuit sans programme
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.circuitDateTarifs} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCircuitDateTarifs} />

            <DataTable
                columns={dataTableConstant.circuitDateTarifColumns}
                data={circuitDateTarifs}
                loading={loadingFetch.loadingCircuitDateTarifs}
                onRowClick={circuitDateTarif => console.log(circuitDateTarif)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier la date de départ" : "Nouvelle date de départ"}
            />
        </div>
    </>;
}
