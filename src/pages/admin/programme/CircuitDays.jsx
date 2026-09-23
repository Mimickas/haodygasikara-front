import { useEffect, useMemo, useState } from "react";
import {
    createCircuitDayApi, findAllCircuitDaysApi,
    updateCircuitDayApi, deleteCircuitDayApi,
} from "../../../api/admin/circuitDayApi";
import { findAllCircuitApi } from "../../../api/admin/circuit";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useCircuitDay } from "../../../hooks/admin/useCircuitDay";
import { apiErrorMessage } from "../../../utils/apiError";
import { circuitDayNumber, formatRepas } from "../../../utils/format";

// ← pas d'endpoint /stats ici : les KPI sont dérivés de la liste déjà chargée

export default function CircuitDays() {
    const { open, setOpen, actions, fields } = useCircuitDay();
    const [circuitDays, setCircuitDays] = useState([]);
    const [circuits, setCircuits] = useState([]);   // ← sert uniquement à numéroter les jours sur tout le circuit
    const [value, setValue] = useState({});
    const [loadingFetch, setLoadingFetch] = useState({ loadingCircuitDays: true });

    const loadCircuitDays = async () => {
        try {
            const response = await findAllCircuitDaysApi();
            setCircuitDays(response?.data ?? []);   // ← l'API renvoie l'ApiResponse, la liste est dans .data
        } catch (error) {
            console.error("Erreur lors de la récupération du programme :", error);
        } finally {
            setLoadingFetch(prev => ({ ...prev, loadingCircuitDays: false }));
        }
    };

    const loadCircuits = async () => {
        try {
            const response = await findAllCircuitApi();
            setCircuits(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des circuits :", error);
        }
    };

    useEffect(() => {
        loadCircuitDays();
        loadCircuits();
    }, []);

    const kpiItems = useMemo(() => {
        const list = circuitDays ?? [];
        const circuitIds = new Set(list.map(d => d.circuitId).filter(Boolean));
        const nuitees    = list.filter(d => d.hebergement).length;
        const repas      = list.reduce((acc, d) => acc + [d.petitDejeuner, d.dejeuner, d.diner].filter(Boolean).length, 0);

        return [
            { label: "Jours programmés",  value: list.length,     hint: list.length > 1 ? "jours détaillés" : "jour détaillé",  accent: "var(--brand-lagune)" },
            { label: "Circuits couverts", value: circuitIds.size, hint: "circuits ayant au moins un jour détaillé",             accent: "var(--brand-nature)" },
            { label: "Nuitées",           value: nuitees,         hint: "nuits avec un hébergement choisi",                     accent: "var(--brand-ocre)"   },
            { label: "Repas inclus",      value: repas,           hint: "petits-déjeuners, déjeuners et dîners",                accent: "var(--brand-terre)"  },
        ];
    }, [circuitDays]);

    // ← la réponse porte le jour DANS l'étape : on reconstruit le jour du circuit entier,
    //   puis on range la table dans l'ordre du voyage
    const rows = useMemo(() => {
        const circuitsById = new Map(circuits.map(c => [c.id, c]));
        return circuitDays
            .map(d => {
                const circuit = circuitsById.get(d.circuitId);
                const numero  = circuit ? circuitDayNumber(circuit, d.stepPosition, d.jour) : d.jour;
                return {
                    ...d,
                    numero,
                    jourLibelle:  `Jour ${numero} · ${d.destinationNom}`,
                    repasLibelle: formatRepas(d),
                };
            })
            .sort((a, b) => (a.circuitNom ?? "").localeCompare(b.circuitNom ?? "", "fr") || a.numero - b.numero);
    }, [circuitDays, circuits]);

    const handleEdit = async (id) => {
        const day = circuitDays?.find(d => d.id === id);
        // ← on aplatit la réponse imbriquée vers les noms de champs du formulaire ;
        //   les repas repassent en chaîne pour que les <select> Inclus / Non inclus s'ouvrent au bon choix
        setValue({
            id:            day?.id,
            circuitStepId: day?.circuitStepId,
            jour:          day?.jour,
            titre:         day?.titre,
            description:   day?.description,
            hebergementId: day?.hebergement?.id,
            petitDejeuner: String(day?.petitDejeuner ?? false),
            dejeuner:      String(day?.dejeuner ?? false),
            diner:         String(day?.diner ?? false),
        });
        await actions.edit();
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce jour ? Les visites rattachées seront supprimées avec lui.")) return;
        try {
            await deleteCircuitDayApi(id);
            await loadCircuitDays();
        } catch (error) {
            console.error("Erreur lors de la suppression du jour :", error);
            alert(error.response?.data?.message || "Suppression impossible.");
        }
    };

    const handleSubmit = async (data) => {
        // ← payload explicite : les <select> et l'input number renvoient des chaînes.
        //   Un select vide part en null (→ 400 lisible), un repas non choisi vaut « non inclus »
        const payload = {
            circuitStepId: data.circuitStepId ? Number(data.circuitStepId) : null,
            jour:          data.jour === "" ? null : Number(data.jour),
            titre:         data.titre || null,
            description:   data.description || null,
            hebergementId: data.hebergementId ? Number(data.hebergementId) : null,
            petitDejeuner: data.petitDejeuner === "true",
            dejeuner:      data.dejeuner === "true",
            diner:         data.diner === "true",
        };

        try {
            if (value?.id) {
                await updateCircuitDayApi(value.id, payload);
            } else {
                await createCircuitDayApi(payload);
            }
            await loadCircuitDays();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du jour :", error);
            alert(apiErrorMessage(error, "Enregistrement impossible."));   // ← 409 jour déjà programmé, 400 jour hors étape
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.circuitDays} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={loadingFetch.loadingCircuitDays} />

            <DataTable
                columns={dataTableConstant.circuitDayColumns}
                data={rows}
                loading={loadingFetch.loadingCircuitDays}
                onRowClick={day => console.log(day)}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title={value?.id ? "Modifier le jour" : "Programmer un jour"}
            />
        </div>
    </>;
}
