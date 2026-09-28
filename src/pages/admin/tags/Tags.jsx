import { useEffect, useState } from "react";
import { createTagsApi, deleteTagApi, findAllTags, getTagStatsApi, updateTagApi } from "../../../api/admin/tag";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import { useTags } from "../../../hooks/admin/useTags";
import { parDate, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { useSuppressionAdmin } from "../../../hooks/admin/useSuppressionAdmin";
import { slugifier } from "../../../utils/format";

// ── Les étiquettes : thématique, région, type d'activité… ────────────────
// Elles filtrent le créateur de circuit, nourrissent les suggestions « même
// esprit » et les envies des voyageurs.

const emptyStat = { value: 0, trend: "" };

const TRIS = [
    { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("name") },
    { cle: "RECENTES", libelle: "Plus récentes", comparer: parDate("createdAt") },
];

export default function Tags() {
    const { open, setOpen, actions, fields } = useTags();
    const [tags, setTags] = useState([]);
    const [value, setValue] = useState({});
    const [stats, setStats] = useState({
        total: emptyStat, used: emptyStat, orphans: emptyStat, grouped: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingTags: true });

    const loadTags = async () => {
        try {
            const response = await findAllTags();
            setTags(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des étiquettes :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingTags: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await getTagStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats étiquettes :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        loadTags();
        loadStats();
    }, []);

    const recharger = async () => { await loadTags(); await loadStats(); };

    const groupes = [...new Set(tags.map((t) => t.tagGroup?.name).filter(Boolean))];
    const liste = useListeAdmin(tags, {
        recherche: (t) => [t.name, t.slug, t.tagGroup?.name],
        filtres: [{ cle: "TOUS", libelle: "Toutes", garde: () => true },
            ...groupes.map((g) => ({ cle: g, libelle: g, garde: (t) => t.tagGroup?.name === g }))],
        tris: TRIS,
        export: { nom: "etiquettes", colonnes: dataTableConstant.tagColumns },
    });

    const suppression = useSuppressionAdmin({
        supprimer: deleteTagApi,
        apres: recharger,
        titre: "Supprimer cette étiquette ?",
        texte: "Une étiquette encore portée par une destination ne peut pas être supprimée.",
    });

    const kpiItems = [
        { label: "Total des étiquettes", value: stats.total.value,   hint: stats.total.trend,   accent: "var(--brand-lagune)" },
        { label: "Utilisées",            value: stats.used.value,    hint: stats.used.trend,    accent: "var(--brand-nature)" },
        { label: "Orphelines",           value: stats.orphans.value, hint: stats.orphans.trend, accent: "var(--brand-ocre)"   },
        { label: "Groupées",             value: stats.grouped.value, hint: stats.grouped.trend, accent: "var(--brand-terre)"  },
    ];

    const handleEdit = async (id) => {
        const tag = tags.find(t => t.id === id);
        setValue({ id: tag?.id, name: tag?.name, slug: tag?.slug, idTagGroup: tag?.tagGroup?.id });
        await actions.edit();
    };

    const handleSubmit = async (data) => {
        const payload = { ...data, slug: data.slug?.trim() || slugifier(data.name) };
        if (value?.id) await updateTagApi(value.id, payload);
        else await createTagsApi(payload);
        await recharger();
        setValue({});
    };

    return <>
        <Toolbar liste={liste} placeholder="Rechercher une étiquette…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Nouvelle étiquette", onClick: () => { setValue({}); actions.create(); }, primaire: true },
        ]} />

        <BandeauErreur message={suppression.erreur} onFermer={() => suppression.setErreur(null)} />
        <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

        <DataTable
            columns={dataTableConstant.tagColumns}
            data={liste.lignes}
            loading={loadingFetch.loadingTags}
            onRowClick={(t) => handleEdit(t.id)}
            onEdit={handleEdit}
            onDelete={suppression.demander}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucune étiquette", texte: "Les étiquettes décrivent les destinations : thématique, région, activité." }}
        />

        <FormModal
            open={open}
            onClose={() => { setOpen(false); setValue({}); }}
            onSubmit={handleSubmit}
            fields={fields}
            value={value}
            title={value?.id ? "Modifier l'étiquette" : "Nouvelle étiquette"}
        />
        {suppression.modale}
    </>;
}
