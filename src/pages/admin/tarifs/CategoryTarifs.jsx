import { useEffect, useMemo, useState } from "react";
import {
    createCategoryTarifApi, findAllCategoryTarifsApi,
    updateCategoryTarifApi, deleteCategoryTarifApi,
} from "../../../api/admin/categoryTarifApi";
import { findAllCircuitTarifsApi } from "../../../api/admin/circuitTarifApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCategoryTarif } from "../../../hooks/admin/useCategoryTarif";
import { apiErrorMessage } from "../../../utils/apiError";

// ← pas d'endpoint /stats ici : les KPI sont dérivés des listes déjà chargées

export default function CategoryTarifs() {
    const { open, setOpen, actions, fields } = useCategoryTarif();
    const [categoryTarifs, setCategoryTarifs] = useState([]);
    const [circuitTarifs, setCircuitTarifs] = useState([]);   // ← sert uniquement aux KPI d'utilisation
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCategoryTarifs: true, loadingCircuitTarifs: true });

    const loadCategoryTarifs = async () => {
        try {
            const response = await findAllCategoryTarifsApi();
            setCategoryTarifs(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des catégories de tarif :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCategoryTarifs: false }));
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
        loadCategoryTarifs();
        loadCircuitTarifs();
    }, []);

    const kpiItems = useMemo(() => {
        const list   = categoryTarifs ?? [];
        const tarifs = circuitTarifs ?? [];
        // ← une catégorie est « utilisée » dès qu'un tarif de circuit la référence
        const usedIds     = new Set(tarifs.map(t => t.categoryTarif?.id).filter(Boolean));
        const utilisees   = list.filter(c => usedIds.has(c.id)).length;
        const inutilisees = list.length - utilisees;
        const rattaches   = tarifs.filter(t => t.categoryTarif?.id).length;

        return [
            { label: "Total catégories", value: list.length,  hint: list.length > 1 ? "catégories enregistrées" : "catégorie enregistrée", accent: "var(--brand-lagune)" },
            { label: "Utilisées",        value: utilisees,    hint: "référencées par au moins un tarif",                                   accent: "var(--brand-nature)" },
            { label: "Inutilisées",      value: inutilisees,  hint: "supprimables sans impact",                                            accent: "var(--brand-ocre)"   },
            { label: "Tarifs rattachés", value: rattaches,    hint: "tarifs de circuit classés par catégorie",                             accent: "var(--brand-terre)"  },
        ];
    }, [categoryTarifs, circuitTarifs]);

    const handleEdit = async (id) => {
        const categoryTarif = categoryTarifs?.find(c => c.id === id);
        // ← objet plat : exactement les noms de champs du formulaire + l'id
        setValue({
            id:   categoryTarif?.id,
            name: categoryTarif?.name,
            code: categoryTarif?.code,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette catégorie de tarif ?")) return;
        try {
            await deleteCategoryTarifApi(id);
            await loadCategoryTarifs();
        } catch (error) {
            console.error("Erreur lors de la suppression de la catégorie :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : catégorie encore utilisée
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite : on n'envoie jamais l'objet brut du formulaire
        const payload = {
            name: data.name,
            code: data.code,
        };

        try {
            if (value?.id) {
                await updateCategoryTarifApi(value.id, payload);
            } else {
                await createCategoryTarifApi(payload);
            }
            await loadCategoryTarifs();
            await loadCircuitTarifs();   // ← les KPI d'utilisation dépendent aussi des tarifs
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la catégorie :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 doublon, 400 validation
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.categoryTarifs} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCategoryTarifs || loadingFetch.loadingCircuitTarifs} />

            <DataTable
                columns={dataTableConstant.categoryTarifColumns}
                data={categoryTarifs}
                loading={loadingFetch.loadingCategoryTarifs}
                onRowClick={categoryTarif => console.log(categoryTarif)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier la catégorie" : "Nouvelle catégorie de tarif"}
            />
        </div>
    </>;
}
