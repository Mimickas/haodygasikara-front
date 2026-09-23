import { useEffect, useMemo, useState } from "react";
import {
    createDeviseApi, findAllDevisesApi,
    updateDeviseApi, deleteDeviseApi,
} from "../../../api/admin/deviseApi";
import { findAllCircuitTarifsApi } from "../../../api/admin/circuitTarifApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useDevise } from "../../../hooks/admin/useDevise";
import { apiErrorMessage } from "../../../utils/apiError";

// ← pas d'endpoint /stats ici : les KPI sont dérivés des listes déjà chargées

export default function Devises() {
    const { open, setOpen, actions, fields } = useDevise();
    const [devises, setDevises] = useState([]);
    const [circuitTarifs, setCircuitTarifs] = useState([]);   // ← sert uniquement aux KPI d'utilisation
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingDevises: true, loadingCircuitTarifs: true });

    const loadDevises = async () => {
        try {
            const response = await findAllDevisesApi();
            setDevises(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des devises :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingDevises: false }));
        }
    };

    const loadCircuitTarifs = async () => {
        try {
            const response = await findAllCircuitTarifsApi();
            setCircuitTarifs(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des tarifs de circuit :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCircuitTarifs: false }));
        }
    };

    useEffect(() => {
        loadDevises();
        loadCircuitTarifs();
    }, []);

    const kpiItems = useMemo(() => {
        const list   = devises ?? [];
        const tarifs = circuitTarifs ?? [];
        // ← une devise est « utilisée » dès qu'un tarif de circuit la référence
        const usedIds     = new Set(tarifs.map(t => t.devise?.id).filter(Boolean));
        const utilisees   = list.filter(d => usedIds.has(d.id)).length;
        const inutilisees = list.length - utilisees;
        const rattaches   = tarifs.filter(t => t.devise?.id).length;

        return [
            { label: "Total devises",    value: list.length, hint: list.length > 1 ? "devises enregistrées" : "devise enregistrée", accent: "var(--brand-lagune)" },
            { label: "Utilisées",        value: utilisees,   hint: "référencées par au moins un tarif",                             accent: "var(--brand-nature)" },
            { label: "Inutilisées",      value: inutilisees, hint: "supprimables sans impact",                                      accent: "var(--brand-ocre)"   },
            { label: "Tarifs rattachés", value: rattaches,   hint: "tarifs de circuit libellés dans une devise",                    accent: "var(--brand-terre)"  },
        ];
    }, [devises, circuitTarifs]);

    const handleEdit = async (id) => {
        const devise = devises?.find(d => d.id === id);
        // ← objet plat : exactement les noms de champs du formulaire + l'id
        setValue({
            id:   devise?.id,
            name: devise?.name,
            code: devise?.code,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette devise ?")) return;
        try {
            await deleteDeviseApi(id);
            await loadDevises();
        } catch (error) {
            console.error("Erreur lors de la suppression de la devise :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : devise encore utilisée
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite : le backend normalise lui-même le code en majuscules
        const payload = {
            name: data.name,
            code: data.code,
        };

        try {
            if (value?.id) {
                await updateDeviseApi(value.id, payload);
            } else {
                await createDeviseApi(payload);
            }
            await loadDevises();
            await loadCircuitTarifs();   // ← les KPI d'utilisation dépendent aussi des tarifs
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la devise :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 doublon, 400 validation (code ≠ 3 lettres…)
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.devises} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingDevises || loadingFetch.loadingCircuitTarifs} />

            <DataTable
                columns={dataTableConstant.deviseColumns}
                data={devises}
                loading={loadingFetch.loadingDevises}
                onRowClick={devise => console.log(devise)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier la devise" : "Nouvelle devise"}
            />
        </div>
    </>;
}
