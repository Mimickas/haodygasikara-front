import { useEffect, useMemo, useState } from "react";
import {
    createCircuitTarifApi, findAllCircuitTarifsApi,
    updateCircuitTarifApi, deleteCircuitTarifApi,
} from "../../../api/admin/circuitTarifApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCircuitTarif } from "../../../hooks/admin/useCircuitTarif";
import { apiErrorMessage } from "../../../utils/apiError";
import { formatPrice } from "../../../utils/format";

// ← pas d'endpoint /stats ici : les KPI sont dérivés de la liste déjà chargée

export default function CircuitTarifs() {
    const { open, setOpen, actions, fields } = useCircuitTarif();
    const [circuitTarifs, setCircuitTarifs] = useState([]);
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCircuitTarifs: true });

    const loadCircuitTarifs = async () => {
        try {
            const response = await findAllCircuitTarifsApi();
            setCircuitTarifs(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération des tarifs :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCircuitTarifs: false }));
        }
    };

    useEffect(() => {
        loadCircuitTarifs();
    }, []);

    const kpiItems = useMemo(() => {
        const list = circuitTarifs ?? [];
        // ← un tarif porte désormais sur une DATE de départ : c'est elle qu'on compte
        const dateIds     = new Set(list.map(t => t.circuitDateTarifId).filter(Boolean));
        const circuitIds  = new Set(list.map(t => t.circuitId).filter(Boolean));
        const deviseCodes = new Set(list.map(t => t.devise?.code).filter(Boolean));
        const somme       = list.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
        // ← une moyenne n'a de sens que dans une seule devise : sinon on n'affiche rien plutôt qu'un chiffre faux
        const uneDevise   = deviseCodes.size === 1;
        const prixMoyen   = list.length && uneDevise ? `${formatPrice(Math.round(somme / list.length))} ${[...deviseCodes][0]}` : "—";

        return [
            { label: "Total tarifs",      value: list.length,      hint: list.length > 1 ? "tarifs enregistrés" : "tarif enregistré",           accent: "var(--brand-lagune)" },
            { label: "Dates tarifées",    value: dateIds.size,     hint: `sur ${circuitIds.size} circuit(s)`,                                   accent: "var(--brand-nature)" },
            { label: "Devises utilisées", value: deviseCodes.size, hint: [...deviseCodes].join(", ") || "aucune devise",                        accent: "var(--brand-ocre)"   },
            { label: "Prix moyen",        value: prixMoyen,        hint: uneDevise || !list.length ? "sur l'ensemble des tarifs" : "plusieurs devises : non calculé",                                   accent: "var(--brand-terre)"  },
        ];
    }, [circuitTarifs]);

    const handleEdit = async (id) => {
        const circuitTarif = circuitTarifs?.find(t => t.id === id);
        // ← on aplatit la réponse imbriquée vers les noms de champs du formulaire,
        //   sinon les <select> s'ouvrent vides en modification
        setValue({
            id:                 circuitTarif?.id,
            price:              circuitTarif?.price,
            circuitDateTarifId: circuitTarif?.circuitDateTarifId,
            categoryTarifId:    circuitTarif?.categoryTarif?.id,
            deviseId:           circuitTarif?.devise?.id,
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce tarif ? Les conditions rattachées seront supprimées avec lui.")) return;
        try {
            await deleteCircuitTarifApi(id);
            await loadCircuitTarifs();
        } catch (error) {
            console.error("Erreur lors de la suppression du tarif :", error);
            alert(error.response?.data?.message || "Suppression impossible.");   // ← 409 : référence encore utilisée
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite et numérique : les <select> renvoient des chaînes.
        //   Un champ vide part en null (→ 400 lisible) : Number("") vaudrait 0 et créerait un tarif gratuit.
        const payload = {
            price:              data.price === "" ? null : Number(data.price),
            circuitDateTarifId: data.circuitDateTarifId ? Number(data.circuitDateTarifId) : null,
            categoryTarifId:    data.categoryTarifId ? Number(data.categoryTarifId) : null,
            deviseId:           data.deviseId ? Number(data.deviseId) : null,
        };

        try {
            if (value?.id) {
                await updateCircuitTarifApi(value.id, payload);
            } else {
                await createCircuitTarifApi(payload);
            }
            await loadCircuitTarifs();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du tarif :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.circuitTarifs} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCircuitTarifs} />

            <DataTable
                columns={dataTableConstant.circuitTarifColumns}
                data={circuitTarifs}
                loading={loadingFetch.loadingCircuitTarifs}
                onRowClick={circuitTarif => console.log(circuitTarif)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier le tarif" : "Nouveau tarif"}
            />
        </div>
    </>;
}
