import { useEffect, useMemo, useState } from "react";
import {
    createPoiApi, findAllPoisApi,
    updatePoiApi, deletePoiApi, changerDisponibilitePoiApi,
} from "../../../api/admin/poiApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import { usePoi } from "../../../hooks/admin/usePoi";
import { parDate, parNombre, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { useSuppressionAdmin } from "../../../hooks/admin/useSuppressionAdmin";
import { apiErrorMessage } from "../../../utils/apiError";

// ── Les points d'intérêt : visites, activités, hébergements ───────────────
// Un hébergement se retire de la vente d'un clic : il disparaît de tous les
// choix proposés aux voyageurs, sans toucher aux programmes.

const FILTRES = [
    { cle: "TOUS", libelle: "Tous", garde: () => true },
    { cle: "HEBERGEMENTS", libelle: "Hébergements", garde: (p) => p.categoryPoi?.isHebergement },
    { cle: "VISITES", libelle: "Visites et activités", garde: (p) => !p.categoryPoi?.isHebergement },
    { cle: "RETIRES", libelle: "Retirés de la vente", garde: (p) => p.categoryPoi?.isHebergement && p.disponible === false },
];

const TRIS = [
    { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("nom") },
    { cle: "RECENTS", libelle: "Plus récents", comparer: parDate("createdAt") },
    { cle: "ETOILES", libelle: "Mieux notés", comparer: parNombre("stars") },
];

export default function Pois() {
    const { open, setOpen, actions, fields } = usePoi();
    const [pois, setPois] = useState([]);
    const [value, setValue] = useState({});
    const [erreur, setErreur] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState({ loadingPois: true });

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
        loadPois();
    }, []);

    const kpiItems = useMemo(() => {
        const destinationIds = new Set(pois.map(p => p.destinationId).filter(Boolean));
        const hebergements   = pois.filter(p => p.categoryPoi?.isHebergement).length;
        const retires        = pois.filter(p => p.categoryPoi?.isHebergement && p.disponible === false).length;
        const avecPhoto      = pois.filter(p => p.imageUrls?.length).length;
        return [
            { label: "Total POI",              value: pois.length,         hint: pois.length > 1 ? "points d'intérêt enregistrés" : "point d'intérêt enregistré", accent: "var(--brand-lagune)" },
            { label: "Destinations couvertes", value: destinationIds.size, hint: "destinations ayant au moins un POI",                                           accent: "var(--brand-nature)" },
            { label: "Hébergements",           value: hebergements,        hint: retires ? `${retires} retiré(s) de la vente` : "tous proposés aux voyageurs",   accent: "var(--brand-ocre)"   },
            { label: "Avec photos",            value: avecPhoto,           hint: `${pois.length - avecPhoto} sans photo`,                                        accent: "var(--brand-terre)"  },
        ];
    }, [pois]);

    const basculerDisponibilite = async (poi, disponible) => {
        try {
            const response = await changerDisponibilitePoiApi(poi.id, disponible);
            setPois(list => list.map(p => (p.id === poi.id ? response?.data ?? p : p)));
            setErreur(null);
        } catch (error) {
            setErreur(apiErrorMessage(error, "La disponibilité n'a pas pu être changée."));
        }
    };

    const columns = useMemo(() => dataTableConstant.poiColumns.flatMap(col => col.key !== "stars" ? [col] : [col, {
        key: "disponible",
        label: "En vente",
        render: (val, row) => row?.categoryPoi?.isHebergement
            ? <BasculeDisponibilite disponible={val !== false} onBasculer={() => basculerDisponibilite(row, val === false)} />
            : "—",
        texte: (val, row) => row?.categoryPoi?.isHebergement ? (val !== false ? "Disponible" : "Indisponible") : "",
    }]), []);   // eslint-disable-line react-hooks/exhaustive-deps

    const liste = useListeAdmin(pois, {
        recherche: (p) => [p.nom, p.destinationNom, p.categoryPoi?.name, p.description],
        filtres: FILTRES,
        tris: TRIS,
        export: { nom: "points-d-interet", colonnes: columns },
    });

    const suppression = useSuppressionAdmin({
        supprimer: deletePoiApi,
        apres: loadPois,
        titre: "Supprimer ce point d'intérêt ?",
        texte: "Ses photos et sa vidéo partent avec lui. Un point d'intérêt encore au programme d'un circuit ne peut pas être supprimé.",
    });

    const handleEdit = async (id) => {
        const poi = pois.find(p => p.id === id);
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

    // Un refus du serveur (POI au programme, champ invalide) s'affiche dans la fenêtre
    const handleSubmit = async (data) => {
        const payload = {
            destinationId: data.destinationId ? Number(data.destinationId) : null,
            categoryPoiId: data.categoryPoiId ? Number(data.categoryPoiId) : null,
            nom:           data.nom,
            stars:         data.stars === "" ? null : Number(data.stars),
            description:   data.description || null,
            lat:           data.lat === "" ? null : Number(data.lat),
            lng:           data.lng === "" ? null : Number(data.lng),
            imageUrls:     data.imageUrls ?? [],    // ← déjà envoyées par FormModal : la première est la couverture
            videoUrl:      data.videoUrl || null,
        };
        if (value?.id) await updatePoiApi(value.id, payload);
        else await createPoiApi(payload);
        await loadPois();
        setValue({});
    };

    return <>
        <Toolbar liste={liste} placeholder="Rechercher un lieu, une destination…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Nouveau point d'intérêt", onClick: () => { setValue({}); actions.create(); }, primaire: true },
        ]} />

        <BandeauErreur message={suppression.erreur ?? erreur} onFermer={() => { suppression.setErreur(null); setErreur(null); }} />
        <KpiCard items={kpiItems} loading={loadingFetch.loadingPois} />

        <DataTable
            columns={columns}
            data={liste.lignes}
            loading={loadingFetch.loadingPois}
            onRowClick={(p) => handleEdit(p.id)}
            onEdit={handleEdit}
            onDelete={suppression.demander}
            aucunResultat={liste.aucunResultat}
            vide={{ titre: "Aucun point d'intérêt", texte: "Hôtels, lodges, visites, activités : ils composent le programme des circuits." }}
        />

        <FormModal
            open={open}
            onClose={() => { setOpen(false); setValue({}); }}
            onSubmit={handleSubmit}
            fields={fields}
            value={value}
            title={value?.id ? "Modifier le point d'intérêt" : "Nouveau point d'intérêt"}
        />
        {suppression.modale}
    </>;
}

// Un hébergement indisponible n'est plus proposé aux voyageurs (fiches et
// demandes de devis) mais reste au programme des circuits, prêt à revenir.
function BasculeDisponibilite({ disponible, onBasculer }) {
    const [enCours, setEnCours] = useState(false);
    const couleur = disponible ? "var(--brand-nature)" : "var(--text-muted)";
    return (
        <button
            type="button"
            disabled={enCours}
            title={disponible ? "Retirer de la vente" : "Remettre en vente"}
            onClick={async (e) => {
                e.stopPropagation();
                setEnCours(true);
                try { await onBasculer(); } finally { setEnCours(false); }
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 font-body-strong text-[10px] uppercase cursor-pointer transition-opacity"
            style={{ letterSpacing: "0.1em", color: couleur, border: `1px solid ${disponible ? "var(--brand-nature)" : "var(--border-strong)"}`, opacity: enCours ? 0.5 : 1 }}
        >
            <span style={{ width: 6, height: 6, backgroundColor: couleur }} />
            {disponible ? "Disponible" : "Indisponible"}
        </button>
    );
}
