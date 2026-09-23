import { useEffect, useMemo, useState } from "react";
import {
    createCircuitTarifConditionApi, findAllCircuitTarifConditionsApi,
    updateCircuitTarifConditionApi, deleteCircuitTarifConditionApi,
} from "../../../api/admin/circuitTarifConditionApi";
import { findAllCircuitTarifsApi } from "../../../api/admin/circuitTarifApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCircuitTarifCondition } from "../../../hooks/admin/useCircuitTarifCondition";
import { apiErrorMessage } from "../../../utils/apiError";
import { formatCircuitTarif } from "../../../utils/format";

// ← pas d'endpoint /stats ici : les KPI sont dérivés de la liste déjà chargée
const moyenneFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export default function CircuitTarifConditions() {
    const { open, setOpen, actions, fields } = useCircuitTarifCondition();
    const [circuitTarifConditions, setCircuitTarifConditions] = useState([]);
    const [circuitTarifs, setCircuitTarifs] = useState([]);   // ← sert uniquement au libellé lisible de la colonne Tarif
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCircuitTarifConditions: true });

    const loadCircuitTarifConditions = async () => {
        try {
            const response = await findAllCircuitTarifConditionsApi();
            setCircuitTarifConditions(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des liaisons tarif / condition :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCircuitTarifConditions: false }));
        }
    };

    const loadCircuitTarifs = async () => {
        try {
            const response = await findAllCircuitTarifsApi();
            setCircuitTarifs(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des tarifs de circuit :", error);
        }
    };

    useEffect(() => {
        loadCircuitTarifConditions();
        loadCircuitTarifs();
    }, []);

    const kpiItems = useMemo(() => {
        const list = circuitTarifConditions ?? [];
        const tarifIds     = new Set(list.map(l => l.circuitTarifId).filter(Boolean));
        const conditionIds = new Set(list.map(l => l.conditionTarif?.id).filter(Boolean));
        const moyenne      = tarifIds.size ? moyenneFormatter.format(list.length / tarifIds.size) : "—";

        return [
            { label: "Total liaisons",       value: list.length,        hint: list.length > 1 ? "liaisons enregistrées" : "liaison enregistrée", accent: "var(--brand-lagune)" },
            { label: "Tarifs concernés",     value: tarifIds.size,      hint: "tarifs ayant au moins une condition",                             accent: "var(--brand-nature)" },
            { label: "Conditions utilisées", value: conditionIds.size,  hint: "conditions rattachées à un tarif",                                accent: "var(--brand-ocre)"   },
            { label: "Moy. par tarif",       value: moyenne,            hint: "conditions par tarif concerné",                                   accent: "var(--brand-terre)"  },
        ];
    }, [circuitTarifConditions]);

    // ← la réponse ne porte que circuitTarifId : on reconstruit un libellé lisible pour la table
    const rows = useMemo(() => {
        const tarifsById = new Map(circuitTarifs.map(t => [t.id, t]));
        return circuitTarifConditions.map(l => ({
            ...l,
            circuitTarifLibelle: tarifsById.has(l.circuitTarifId)
                ? formatCircuitTarif(tarifsById.get(l.circuitTarifId))
                : `Tarif #${l.circuitTarifId}`,
        }));
    }, [circuitTarifConditions, circuitTarifs]);

    const handleEdit = async (id) => {
        const liaison = circuitTarifConditions?.find(l => l.id === id);
        // ← on aplatit la réponse imbriquée vers les noms de champs du formulaire,
        //   sinon les <select> s'ouvrent vides en modification
        setValue({
            id:                liaison?.id,
            circuitTarifId:    liaison?.circuitTarifId,
            conditionTarifId:  liaison?.conditionTarif?.id,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette liaison ?")) return;
        try {
            await deleteCircuitTarifConditionApi(id);
            await loadCircuitTarifConditions();
        } catch (error) {
            console.error("Erreur lors de la suppression de la liaison :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : référence encore utilisée
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite et numérique : les <select> renvoient des chaînes.
        //   Un select vide part en null (→ 400 lisible) plutôt qu'en 0 (→ 404 « introuvable : 0 »).
        const payload = {
            circuitTarifId:   data.circuitTarifId ? Number(data.circuitTarifId) : null,
            conditionTarifId: data.conditionTarifId ? Number(data.conditionTarifId) : null,
        };

        try {
            if (value?.id) {
                await updateCircuitTarifConditionApi(value.id, payload);
            } else {
                await createCircuitTarifConditionApi(payload);
            }
            await loadCircuitTarifConditions();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la liaison :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.circuitTarifConditions} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCircuitTarifConditions} />

            <DataTable
                columns={dataTableConstant.circuitTarifConditionColumns}
                data={rows}
                loading={loadingFetch.loadingCircuitTarifConditions}
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
                title={value?.id ? "Modifier la liaison" : "Nouvelle liaison tarif / condition"}
            />
        </div>
    </>;
}
