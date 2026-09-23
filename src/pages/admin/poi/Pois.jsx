import { useEffect, useMemo, useState } from "react";
import {
    createPoiApi, findAllPoisApi,
    updatePoiApi, deletePoiApi,
} from "../../../api/admin/poiApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { usePoi } from "../../../hooks/admin/usePoi";
import { apiErrorMessage } from "../../../utils/apiError";

// ← pas d'endpoint /stats ici : les KPI sont dérivés de la liste déjà chargée

export default function Pois() {
    const { open, setOpen, actions, fields } = usePoi();
    const [pois, setPois] = useState([]);
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingPois: true });

    const loadPois = async () => {
        try {
            const response = await findAllPoisApi();
            setPois(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des points d'intérêt :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingPois: false }));
        }
    };

    useEffect(() => {
        loadPois();
    }, []);

    const kpiItems = useMemo(() => {
        const list = pois ?? [];
        const destinationIds = new Set(list.map(p => p.destinationId).filter(Boolean));
        const hebergements   = list.filter(p => p.categoryPoi?.isHebergement).length;
        const avecPhoto      = list.filter(p => p.imageUrls?.length).length;
        const avecVideo      = list.filter(p => p.videoUrl).length;

        return [
            { label: "Total POI",              value: list.length,         hint: list.length > 1 ? "points d'intérêt enregistrés" : "point d'intérêt enregistré", accent: "var(--brand-lagune)" },
            { label: "Destinations couvertes", value: destinationIds.size, hint: "destinations ayant au moins un POI",                                           accent: "var(--brand-nature)" },
            { label: "Hébergements",           value: hebergements,        hint: "POI où l'on peut passer la nuit",                                              accent: "var(--brand-ocre)"   },
            { label: "Avec photos",            value: avecPhoto,           hint: `${list.length - avecPhoto} sans photo · ${avecVideo} avec vidéo`,              accent: "var(--brand-terre)"  },
        ];
    }, [pois]);

    const handleEdit = async (id) => {
        const poi = pois?.find(p => p.id === id);
        // ← on aplatit la réponse imbriquée vers les noms de champs du formulaire ;
        //   images et vidéo sont déjà des URLs : les champs upload les affichent telles quelles
        setValue({
            id:            poi?.id,
            destinationId: poi?.destinationId,
            categoryPoiId: poi?.categoryPoi?.id,
            nom:           poi?.nom,
            stars:         poi?.stars,
            description:   poi?.description,
            lat:           poi?.lat,
            lng:           poi?.lng,
            imageUrls:     poi?.imageUrls ?? [],
            videoUrl:      poi?.videoUrl ?? "",
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce point d'intérêt ? Ses photos et sa vidéo seront supprimées avec lui.")) return;
        try {
            await deletePoiApi(id);
            await loadPois();
        } catch (error) {
            console.error("Erreur lors de la suppression du point d'intérêt :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : POI encore au programme
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite et numérique : les <select> et les inputs number renvoient des chaînes.
        //   Un champ vide part en null : Number("") vaudrait 0 et placerait le POI sur l'équateur
        const payload = {
            destinationId: data.destinationId ? Number(data.destinationId) : null,
            categoryPoiId: data.categoryPoiId ? Number(data.categoryPoiId) : null,
            nom:           data.nom,
            stars:         data.stars === "" ? null : Number(data.stars),
            description:   data.description || null,
            lat:           data.lat === "" ? null : Number(data.lat),
            lng:           data.lng === "" ? null : Number(data.lng),
            imageUrls:     data.imageUrls ?? [],    // ← FormModal a déjà uploadé : URLs dans l'ordre, la première est la couverture
            videoUrl:      data.videoUrl || null,   // ← idem pour la vidéo ; retirée = null
        };

        try {
            if (value?.id) {
                await updatePoiApi(value.id, payload);
            } else {
                await createPoiApi(payload);
            }
            await loadPois();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du point d'intérêt :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 POI au programme, 400 validation
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.pois} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingPois} />

            <DataTable
                columns={dataTableConstant.poiColumns}
                data={pois}
                loading={loadingFetch.loadingPois}
                onRowClick={poi => console.log(poi)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier le point d'intérêt" : "Nouveau point d'intérêt"}
            />
        </div>
    </>;
}
