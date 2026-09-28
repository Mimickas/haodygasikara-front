import { useEffect, useState } from "react";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import createConstant from "../../../constants/admin/createConstant";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import { useTagsGroup } from "../../../hooks/admin/useTagsGroup";
import { parDate, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { useSuppressionAdmin } from "../../../hooks/admin/useSuppressionAdmin";
import {
    createTagsGroupsApi, deleteTagGroupApi, getTagGroupStatsApi, getTagsGroupsApi, updateTagsGroupsApi,
} from "../../../api/admin/tagGroupApi";
import { slugifier } from "../../../utils/format";

// ── Les groupes d'étiquettes : thématique, région, type d'activité ───────
// Ils rangent les filtres du créateur de circuit et les envies des voyageurs.

const emptyStat = { value: 0, trend: "" };

const TRIS = [
    { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("name") },
    { cle: "RECENTS", libelle: "Plus récents", comparer: parDate("createdAt") },
];

export default function TagsGroup() {
    const { open, setOpen, actions } = useTagsGroup();
    const [groupes, setGroupes] = useState([]);
    const [value, setValue] = useState({});
    const [stats, setStats] = useState({
        total: emptyStat, withTags: emptyStat, empty: emptyStat, createdThisMonth: emptyStat,
    });
    const [loadingFetch, setLoadingFetch] = useState({ loadingStats: true, loadingGroups: true });

    const loadGroupes = async () => {
        try {
            const response = await getTagsGroupsApi();
            setGroupes(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des groupes d'étiquettes :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingGroups: false }));
        }
    };

    const loadStats = async () => {
        try {
            const response = await getTagGroupStatsApi();
            setStats(response.data.data);
        } catch (error) {
            console.error("Erreur stats groupes :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingStats: false }));
        }
    };

    useEffect(() => {
        loadGroupes();
        loadStats();
    }, []);

    const recharger = async () => { await loadGroupes(); await loadStats(); };

    const liste = useListeAdmin(groupes, {
        recherche: (g) => [g.name, g.slug],
        tris: TRIS,
        export: { nom: "groupes-etiquettes", colonnes: dataTableConstant.tagsGroupColumns },
    });

    const suppression = useSuppressionAdmin({
        supprimer: deleteTagGroupApi,
        apres: recharger,
        titre: "Supprimer ce groupe ?",
        texte: "Un groupe qui contient encore des étiquettes ne peut pas être supprimé.",
    });

    const kpiItems = [
        { label: "Total des groupes", value: stats.total.value,            hint: stats.total.trend,            accent: "var(--brand-lagune)" },
        { label: "Avec étiquettes",   value: stats.withTags.value,         hint: stats.withTags.trend,         accent: "var(--brand-nature)" },
        { label: "Vides",             value: stats.empty.value,            hint: stats.empty.trend,            accent: "var(--brand-ocre)"   },
        { label: "Créés ce mois",     value: stats.createdThisMonth.value, hint: stats.createdThisMonth.trend, accent: "var(--brand-terre)"  },
    ];

    const handleEdit = (id) => {
        const groupe = groupes.find(g => g.id === id);
        setValue({ id: groupe?.id, name: groupe?.name, slug: groupe?.slug });
        actions.edit();
    };

    const handleSubmit = async (data) => {
        const payload = { name: data.name, slug: data.slug?.trim() || slugifier(data.name) };
        if (value?.id) await updateTagsGroupsApi(value.id, payload);
        else await createTagsGroupsApi(payload);
        await recharger();
        setValue({});
    };

    return <>
        <Toolbar liste={liste} placeholder="Rechercher un groupe…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Nouveau groupe", onClick: () => { setValue({}); actions.create(); }, primaire: true },
        ]} />

        <BandeauErreur message={suppression.erreur} onFermer={() => suppression.setErreur(null)} />
        <KpiCard items={kpiItems} loading={loadingFetch.loadingStats} />

        <DataTable
            columns={dataTableConstant.tagsGroupColumns}
            data={liste.lignes}
            loading={loadingFetch.loadingGroups}
            onRowClick={(g) => handleEdit(g.id)}
            onEdit={handleEdit}
            onDelete={suppression.demander}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucun groupe", texte: "Un groupe range les étiquettes : thématique, région, type d'activité." }}
        />

        <FormModal
            open={open}
            onClose={() => { setOpen(false); setValue({}); }}
            onSubmit={handleSubmit}
            fields={createConstant.tagsGroups}
            value={value}
            title={value?.id ? "Modifier le groupe" : "Nouveau groupe d'étiquettes"}
        />
        {suppression.modale}
    </>;
}
