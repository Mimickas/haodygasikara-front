import { useEffect, useMemo, useState } from "react";
import {
    createConditionTarifApi, findAllConditionTarifsApi,
    updateConditionTarifApi, deleteConditionTarifApi,
} from "../../../api/admin/conditionTarifApi";
import { findAllCircuitTarifConditionsApi } from "../../../api/admin/circuitTarifConditionApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useConditionTarif } from "../../../hooks/admin/useConditionTarif";
import { apiErrorMessage } from "../../../utils/apiError";

// ← pas d'endpoint /stats ici : les KPI sont dérivés des listes déjà chargées

export default function ConditionTarifs() {
    const { open, setOpen, actions, fields } = useConditionTarif();
    const [conditionTarifs, setConditionTarifs] = useState([]);
    const [circuitTarifConditions, setCircuitTarifConditions] = useState([]);   // ← sert uniquement aux KPI d'utilisation
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingConditionTarifs: true, loadingLiaisons: true });

    const loadConditionTarifs = async () => {
        try {
            const response = await findAllConditionTarifsApi();
            setConditionTarifs(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des conditions de tarif :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingConditionTarifs: false }));
        }
    };

    const loadCircuitTarifConditions = async () => {
        try {
            const response = await findAllCircuitTarifConditionsApi();
            setCircuitTarifConditions(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des liaisons tarif / condition :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingLiaisons: false }));
        }
    };

    useEffect(() => {
        loadConditionTarifs();
        loadCircuitTarifConditions();
    }, []);

    const kpiItems = useMemo(() => {
        const list     = conditionTarifs ?? [];
        const liaisons = circuitTarifConditions ?? [];
        // ← une condition est « rattachée » dès qu'une liaison tarif / condition la référence
        const usedIds        = new Set(liaisons.map(l => l.conditionTarif?.id).filter(Boolean));
        const typesDistincts = new Set(list.map(c => c.type).filter(Boolean));
        const rattachees     = list.filter(c => usedIds.has(c.id)).length;
        const libres         = list.length - rattachees;

        return [
            { label: "Total conditions",      value: list.length,         hint: list.length > 1 ? "conditions enregistrées" : "condition enregistrée", accent: "var(--brand-lagune)" },
            { label: "Types distincts",       value: typesDistincts.size, hint: "critères différents couverts",                                        accent: "var(--brand-nature)" },
            { label: "Rattachées à un tarif", value: rattachees,          hint: "utilisées par au moins un tarif",                                     accent: "var(--brand-ocre)"   },
            { label: "Libres",                value: libres,              hint: "supprimables sans impact",                                            accent: "var(--brand-terre)"  },
        ];
    }, [conditionTarifs, circuitTarifConditions]);

    const handleEdit = async (id) => {
        const conditionTarif = conditionTarifs?.find(c => c.id === id);
        // ← la réponse contient déjà type et operator sous forme de NOM d'enum : reprise directe
        setValue({
            id:       conditionTarif?.id,
            type:     conditionTarif?.type,
            operator: conditionTarif?.operator,
            value:    conditionTarif?.value,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette condition de tarif ?")) return;
        try {
            await deleteConditionTarifApi(id);
            await loadConditionTarifs();
        } catch (error) {
            console.error("Erreur lors de la suppression de la condition :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : condition encore rattachée
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite : les <select> et l'input number renvoient des chaînes.
        //   Un champ vide part en null (→ 400 @NotNull lisible) : "" ferait échouer la
        //   désérialisation de l'enum en 500, et Number("") vaudrait 0 sans prévenir.
        const payload = {
            type:     data.type || null,
            operator: data.operator || null,
            value:    data.value === "" ? null : Number(data.value),
        };

        try {
            if (value?.id) {
                await updateConditionTarifApi(value.id, payload);
            } else {
                await createConditionTarifApi(payload);
            }
            await loadConditionTarifs();
            await loadCircuitTarifConditions();   // ← les KPI d'utilisation dépendent aussi des liaisons
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la condition :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 doublon, 400 validation
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.conditionTarifs} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingConditionTarifs || loadingFetch.loadingLiaisons} />

            <DataTable
                columns={dataTableConstant.conditionTarifColumns}
                data={conditionTarifs}
                loading={loadingFetch.loadingConditionTarifs}
                onRowClick={conditionTarif => console.log(conditionTarif)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier la condition" : "Nouvelle condition de tarif"}
            />
        </div>
    </>;
}
