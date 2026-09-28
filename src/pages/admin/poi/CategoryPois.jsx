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
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import { useCategoryPoi } from "../../../hooks/admin/useCategoryPoi";
import { parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { useSuppressionAdmin } from "../../../hooks/admin/useSuppressionAdmin";

// ── Les catégories de points d'intérêt ─────────────────────────────────────
// « Hébergement : oui » pour celles où l'on dort : elles seules se proposent
// comme hébergement du soir dans les programmes.

const FILTRES = [
    { cle: "TOUTES", libelle: "Toutes", garde: () => true },
    { cle: "HEBERGEMENTS", libelle: "Hébergements", garde: (c) => c.isHebergement },
    { cle: "AUTRES", libelle: "Visites et activités", garde: (c) => !c.isHebergement },
];

export default function CategoryPois() {
    const { open, setOpen, actions, fields } = useCategoryPoi();
    const [categoryPois, setCategoryPois] = useState([]);
    const [pois, setPois] = useState([]);   // ← sert uniquement aux indicateurs d'utilisation
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCategoryPois: true, loadingPois: true });

    const loadCategoryPois = async () => {
        try {
            const response = await findAllCategoryPoisApi();
            setCategoryPois(response?.data ?? []);
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

    const recharger = async () => { await loadCategoryPois(); await loadPois(); };

    const kpiItems = useMemo(() => {
        const usedIds      = new Set(pois.map(p => p.categoryPoi?.id).filter(Boolean));
        const utilisees    = categoryPois.filter(c => usedIds.has(c.id)).length;
        const hebergements = categoryPois.filter(c => c.isHebergement).length;
        const rattaches    = pois.filter(p => p.categoryPoi?.id).length;
        return [
            { label: "Total catégories", value: categoryPois.length, hint: categoryPois.length > 1 ? "catégories enregistrées" : "catégorie enregistrée", accent: "var(--brand-lagune)" },
            { label: "Utilisées",        value: utilisees,           hint: `${categoryPois.length - utilisees} supprimable(s) sans impact`,                    accent: "var(--brand-nature)" },
            { label: "Hébergements",     value: hebergements,        hint: "catégories où l'on passe la nuit",                                                 accent: "var(--brand-ocre)"   },
            { label: "POI rattachés",    value: rattaches,           hint: "points d'intérêt classés par catégorie",                                          accent: "var(--brand-terre)"  },
        ];
    }, [categoryPois, pois]);

    const liste = useListeAdmin(categoryPois, {
        recherche: (c) => [c.name, c.code],
        filtres: FILTRES,
        tris: [{ cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("name") }],
        export: { nom: "categories-poi", colonnes: dataTableConstant.categoryPoiColumns },
    });

    const suppression = useSuppressionAdmin({
        supprimer: deleteCategoryPoiApi,
        apres: recharger,
        titre: "Supprimer cette catégorie ?",
        texte: "Une catégorie encore utilisée par un point d'intérêt ne peut pas être supprimée.",
    });

    const handleEdit = async (id) => {
        const categoryPoi = categoryPois.find(c => c.id === id);
        setValue({
            id:            categoryPoi?.id,
            name:          categoryPoi?.name,
            code:          categoryPoi?.code,
            isHebergement: String(categoryPoi?.isHebergement ?? false),
        });
        await actions.edit();
    };

    // Un refus du serveur (doublon, hébergement déjà utilisé) s'affiche dans la fenêtre
    const handleSubmit = async (data) => {
        const payload = {
            name:          data.name,
            code:          data.code,
            isHebergement: data.isHebergement === "true",
        };
        if (value?.id) await updateCategoryPoiApi(value.id, payload);
        else await createCategoryPoiApi(payload);
        await recharger();
        setValue({});
    };

    return <>
        <Toolbar liste={liste} placeholder="Rechercher une catégorie…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Nouvelle catégorie", onClick: () => { setValue({}); actions.create(); }, primaire: true },
        ]} />

        <BandeauErreur message={suppression.erreur} onFermer={() => suppression.setErreur(null)} />
        <KpiCard items={kpiItems} loading={loadingFetch.loadingCategoryPois || loadingFetch.loadingPois} />

        <DataTable
            columns={dataTableConstant.categoryPoiColumns}
            data={liste.lignes}
            loading={loadingFetch.loadingCategoryPois}
            onRowClick={(c) => handleEdit(c.id)}
            onEdit={handleEdit}
            onDelete={suppression.demander}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucune catégorie", texte: "Hôtel, lodge, visite, activité : les catégories classent les points d'intérêt." }}
        />

        <FormModal
            open={open}
            onClose={() => { setOpen(false); setValue({}); }}
            onSubmit={handleSubmit}
            fields={fields}
            value={value}
            title={value?.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
        />
        {suppression.modale}
    </>;
}
