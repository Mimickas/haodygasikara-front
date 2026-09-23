import { useEffect, useMemo, useState } from "react";
import {
    createCategoryPoiApi, findAllCategoryPoisApi,
    updateCategoryPoiApi, deleteCategoryPoiApi,
} from "../../../api/admin/categoryPoiApi";
import { findAllPoisApi } from "../../../api/admin/poiApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCategoryPoi } from "../../../hooks/admin/useCategoryPoi";
import { apiErrorMessage } from "../../../utils/apiError";

// ← pas d'endpoint /stats ici : les KPI sont dérivés des listes déjà chargées

export default function CategoryPois() {
    const { open, setOpen, actions, fields } = useCategoryPoi();
    const [categoryPois, setCategoryPois] = useState([]);
    const [pois, setPois] = useState([]);   // ← sert uniquement aux KPI d'utilisation
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCategoryPois: true, loadingPois: true });

    const loadCategoryPois = async () => {
        try {
            const response = await findAllCategoryPoisApi();
            setCategoryPois(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des catégories de POI :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCategoryPois: false }));
        }
    };

    const loadPois = async () => {
        try {
            const response = await findAllPoisApi();
            setPois(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des points d'intérêt :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingPois: false }));
        }
    };

    useEffect(() => {
        loadCategoryPois();
        loadPois();
    }, []);

    const kpiItems = useMemo(() => {
        const list    = categoryPois ?? [];
        const points  = pois ?? [];
        // ← une catégorie est « utilisée » dès qu'un point d'intérêt la référence
        const usedIds      = new Set(points.map(p => p.categoryPoi?.id).filter(Boolean));
        const utilisees    = list.filter(c => usedIds.has(c.id)).length;
        const hebergements = list.filter(c => c.isHebergement).length;
        const rattaches    = points.filter(p => p.categoryPoi?.id).length;

        return [
            { label: "Total catégories", value: list.length,   hint: list.length > 1 ? "catégories enregistrées" : "catégorie enregistrée", accent: "var(--brand-lagune)" },
            { label: "Utilisées",        value: utilisees,     hint: `${list.length - utilisees} supprimable(s) sans impact`,                accent: "var(--brand-nature)" },
            { label: "Hébergements",     value: hebergements,  hint: "catégories où l'on passe la nuit",                                     accent: "var(--brand-ocre)"   },
            { label: "POI rattachés",    value: rattaches,     hint: "points d'intérêt classés par catégorie",                              accent: "var(--brand-terre)"  },
        ];
    }, [categoryPois, pois]);

    const handleEdit = async (id) => {
        const categoryPoi = categoryPois?.find(c => c.id === id);
        // ← objet plat : exactement les noms de champs du formulaire + l'id.
        //   Le booléen repasse en chaîne pour que le <select> Oui / Non s'ouvre au bon choix
        setValue({
            id:            categoryPoi?.id,
            name:          categoryPoi?.name,
            code:          categoryPoi?.code,
            isHebergement: String(categoryPoi?.isHebergement ?? false),
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette catégorie de POI ?")) return;
        try {
            await deleteCategoryPoiApi(id);
            await loadCategoryPois();
        } catch (error) {
            console.error("Erreur lors de la suppression de la catégorie :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : catégorie encore utilisée
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite : on n'envoie jamais l'objet brut du formulaire
        const payload = {
            name:          data.name,
            code:          data.code,
            isHebergement: data.isHebergement === "true",
        };

        try {
            if (value?.id) {
                await updateCategoryPoiApi(value.id, payload);
            } else {
                await createCategoryPoiApi(payload);
            }
            await loadCategoryPois();
            await loadPois();   // ← les KPI d'utilisation dépendent aussi des POI
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la catégorie :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 doublon ou hébergement utilisé, 400 validation
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.categoryPois} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCategoryPois || loadingFetch.loadingPois} />

            <DataTable
                columns={dataTableConstant.categoryPoiColumns}
                data={categoryPois}
                loading={loadingFetch.loadingCategoryPois}
                onRowClick={categoryPoi => console.log(categoryPoi)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier la catégorie" : "Nouvelle catégorie de POI"}
            />
        </div>
    </>;
}
