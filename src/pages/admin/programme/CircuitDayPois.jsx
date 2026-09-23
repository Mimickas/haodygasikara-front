import { useEffect, useMemo, useState } from "react";
import {
    createCircuitDayPoiApi, findAllCircuitDayPoisApi,
    updateCircuitDayPoiApi, deleteCircuitDayPoiApi,
} from "../../../api/admin/circuitDayPoiApi";
import { findAllCircuitDaysApi } from "../../../api/admin/circuitDayApi";
import { findAllCircuitApi } from "../../../api/admin/circuit";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCircuitDayPoi } from "../../../hooks/admin/useCircuitDayPoi";
import { apiErrorMessage } from "../../../utils/apiError";
import { formatCircuitDay } from "../../../utils/format";

// ← pas d'endpoint /stats ici : les KPI sont dérivés de la liste déjà chargée

export default function CircuitDayPois() {
    const { open, setOpen, actions, fields } = useCircuitDayPoi();
    const [circuitDayPois, setCircuitDayPois] = useState([]);
    const [circuitDays, setCircuitDays] = useState([]);   // ← sert uniquement au libellé lisible de la colonne Jour
    const [circuits, setCircuits] = useState([]);         // ← et à la numérotation du jour sur tout le circuit
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCircuitDayPois: true });

    const loadCircuitDayPois = async () => {
        try {
            const response = await findAllCircuitDayPoisApi();
            setCircuitDayPois(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des visites :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCircuitDayPois: false }));
        }
    };

    const loadCircuitDays = async () => {
        try {
            const response = await findAllCircuitDaysApi();
            setCircuitDays(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération du programme :", error);
        }
    };

    const loadCircuits = async () => {
        try {
            const response = await findAllCircuitApi();
            setCircuits(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des circuits :", error);
        }
    };

    useEffect(() => {
        loadCircuitDayPois();
        loadCircuitDays();
        loadCircuits();
    }, []);

    const kpiItems = useMemo(() => {
        const list = circuitDayPois ?? [];
        const incluses = list.filter(l => l.inclus).length;
        const dayIds   = new Set(list.map(l => l.circuitDayId).filter(Boolean));

        return [
            { label: "Total visites",   value: list.length,             hint: list.length > 1 ? "visites et activités programmées" : "visite ou activité programmée", accent: "var(--brand-lagune)" },
            { label: "Incluses",        value: incluses,                hint: "comprises dans le prix du circuit",                                                     accent: "var(--brand-nature)" },
            { label: "En option",       value: list.length - incluses,  hint: "proposées en supplément",                                                               accent: "var(--brand-ocre)"   },
            { label: "Jours concernés", value: dayIds.size,             hint: "jours ayant au moins une visite",                                                       accent: "var(--brand-terre)"  },
        ];
    }, [circuitDayPois]);

    // ← la réponse ne porte que circuitDayId : on reconstruit un libellé lisible pour la table
    const rows = useMemo(() => {
        const daysById     = new Map(circuitDays.map(d => [d.id, d]));
        const circuitsById = new Map(circuits.map(c => [c.id, c]));
        return circuitDayPois.map(l => {
            const day = daysById.get(l.circuitDayId);
            return {
                ...l,
                circuitDayLibelle: day
                    ? formatCircuitDay(day, circuitsById.get(day.circuitId))
                    : `Jour #${l.circuitDayId}`,
            };
        });
    }, [circuitDayPois, circuitDays, circuits]);

    const handleEdit = async (id) => {
        const liaison = circuitDayPois?.find(l => l.id === id);
        // ← on aplatit la réponse imbriquée vers les noms de champs du formulaire,
        //   sinon les <select> s'ouvrent vides en modification
        setValue({
            id:           liaison?.id,
            circuitDayId: liaison?.circuitDayId,
            poiId:        liaison?.poi?.id,
            inclus:       String(liaison?.inclus ?? true),
            note:         liaison?.note,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Retirer cette visite du programme ?")) return;
        try {
            await deleteCircuitDayPoiApi(id);
            await loadCircuitDayPois();
        } catch (error) {
            console.error("Erreur lors de la suppression de la visite :", error);
            alert(error.response?.data?.message || "Suppression impossible.");
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite et numérique : les <select> renvoient des chaînes.
        //   Un select vide part en null (→ 400 lisible) plutôt qu'en 0 (→ 404 « introuvable : 0 »)
        const payload = {
            circuitDayId: data.circuitDayId ? Number(data.circuitDayId) : null,
            poiId:        data.poiId ? Number(data.poiId) : null,
            inclus:       data.inclus === "true",
            note:         data.note || null,
        };

        try {
            if (value?.id) {
                await updateCircuitDayPoiApi(value.id, payload);
            } else {
                await createCircuitDayPoiApi(payload);
            }
            await loadCircuitDayPois();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la visite :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 déjà au programme, 400 hors destination
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.circuitDayPois} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCircuitDayPois} />

            <DataTable
                columns={dataTableConstant.circuitDayPoiColumns}
                data={rows}
                loading={loadingFetch.loadingCircuitDayPois}
                onRowClick={liaison => console.log(liaison)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier la visite" : "Nouvelle visite ou activité"}
            />
        </div>
    </>;
}
