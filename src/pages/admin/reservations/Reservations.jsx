import { useEffect, useMemo, useState } from "react";
import {
    findAllReservationsApi,
    changerStatutReservationApi,
} from "../../../api/admin/reservationApi";
import FormModal from "../../../components/admin/crud/form/FormModal";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import dataTableConstant from "../../../constants/admin/dataTableConstant";
import toolbar from "../../../constants/admin/toolbar";
import { useReservation } from "../../../hooks/admin/useReservation";
import { apiErrorMessage } from "../../../utils/apiError";
import { formatDate } from "../../../utils/format";

// ── Les réservations, côté agence ─────────────────────────────────────────
// Un écran de traitement, pas un CRUD.
//
//   * PAS DE CRÉATION. Une réservation naît d'une demande du visiteur ; en
//     inventer une depuis le back-office ferait une ligne que personne n'a
//     demandée.
//   * PAS DE SUPPRESSION. Elle s'ANNULE, et l'annulation laisse une trace.
//     Un dossier effacé est un dossier qu'on ne peut plus expliquer — et un
//     litige se plaide sur des traces.
//
// La seule action est donc le changement de statut, qui ALLONGE l'historique
// au lieu de le réécrire. C'est ce qui permettra de répondre un jour à
// « quand cette réservation a-t-elle été confirmée ? ».
//
// Les KPI sont dérivés de la liste déjà chargée, comme les autres écrans du
// back-office : pas d'appel /stats supplémentaire pour quatre chiffres.
export default function Reservations() {
    const { open, setOpen, actions, fields } = useReservation();
    const [reservations, setReservations] = useState([]);
    const [value, setValue] = useState({});
    const [chargement, setChargement] = useState(true);

    const loadReservations = async () => {
        try {
            const response = await findAllReservationsApi();
            setReservations(response?.data ?? []);
        } catch (error) {
            console.error("Erreur lors de la récupération des réservations :", error);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { loadReservations(); }, []);

    const kpiItems = useMemo(() => {
        const list = reservations ?? [];
        const parStatut = (nom) => list.filter(r => r.statut === nom).length;

        // Les voyageurs attendus : les annulées ne partent pas, elles ne
        // comptent donc pas dans ce que l'agence doit encadrer.
        const voyageurs = list
            .filter(r => r.statut !== "ANNULEE")
            .reduce((total, r) => total + (r.voyageurs ?? 0), 0);

        const aTraiter = parStatut("ENVOYEE");

        return [
            { label: "Réservations", value: list.length, hint: list.length > 1 ? "dossiers reçus" : "dossier reçu",       accent: "var(--brand-lagune)" },
            { label: "À traiter",    value: aTraiter,    hint: aTraiter > 0 ? "le client attend une réponse" : "rien en attente", accent: "var(--brand-terre)"  },
            { label: "Confirmées",   value: parStatut("CONFIRMEE"), hint: `${parStatut("ANNULEE")} annulée(s)`,           accent: "var(--brand-nature)" },
            { label: "Voyageurs",    value: voyageurs,   hint: "hors réservations annulées",                              accent: "var(--brand-ocre)"   },
        ];
    }, [reservations]);

    // « Modifier » ouvre le changement de statut : c'est le seul geste.
    const handleEdit = async (id) => {
        const reservation = reservations?.find(r => r.id === id);
        setValue({
            id: reservation?.id,
            // Le statut courant n'est PAS pré-rempli : le reproposer inviterait
            // à valider sans choisir, et le back refuse de toute façon un
            // statut déjà atteint.
            statut: "",
            note: "",
        });
        await actions.edit();
    };

    const handleSubmit = async (data) => {
        try {
            await changerStatutReservationApi(value.id, {
                statut: data.statut,
                note: data.note?.trim() || null,
            });
            await loadReservations();
            setOpen(false);
            setValue({});
        } catch (error) {
            console.error("Erreur lors du changement de statut :", error);
            alert(apiErrorMessage(error, "Changement de statut impossible."));
            throw error;   // ← laisse FormModal garder la modale ouverte
        }
    };

    // Le clic sur une ligne déplie le dossier dans la console : le détail
    // complet (message du client, historique daté) y est déjà.
    const handleRowClick = (reservation) => {
        console.log("Réservation", reservation.id, {
            message: reservation.message,
            historique: (reservation.historique ?? []).map(e =>
                `${formatDate(e.atteintLe)} — ${e.libelle ?? e.statut}${e.note ? ` (${e.note})` : ""}`),
        });
    };

    return <>
        <div>
            <Toolbar toolbarConfigs={toolbar.reservations} actions={actions} />
        </div>

        <div>
            <KpiCard items={kpiItems} loading={chargement} />

            <DataTable
                columns={dataTableConstant.reservationColumns}
                data={reservations}
                loading={chargement}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                // Pas d'onDelete : une réservation s'annule, elle ne s'efface pas.
            />

            <FormModal
                open={open}
                onClose={() => { setOpen(false); setValue({}); }}
                onSubmit={handleSubmit}
                fields={fields}
                value={value}
                title="Faire avancer la réservation"
            />
        </div>
    </>;
}
