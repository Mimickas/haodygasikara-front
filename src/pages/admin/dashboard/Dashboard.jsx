import { useEffect, useMemo, useState } from "react";
import { findAllDemandesDevisApi, findStatsDevisApi } from "../../../api/admin/demandeDevisApi";
import { findEfficaciteSuggestionsApi } from "../../../api/admin/suggestionsApi";
import { findChoixVoyageursApi } from "../../../api/admin/statistiquesApi";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import { useAuthStore } from "../../../store/authStore";
import { apiErrorMessage } from "../../../utils/apiError";
import Accueil from "./components/Accueil";
import Associations from "./components/Associations";
import CircuitsDemandes from "./components/CircuitsDemandes";
import DemandesEnAttente from "./components/DemandesEnAttente";
import DestinationsChoisies from "./components/DestinationsChoisies";
import EfficaciteSources from "./components/EfficaciteSources";
import SuggestionsParDestination from "./components/SuggestionsParDestination";
import { HEURES_PROMESSE, pourcent } from "./components/outils";

// ── Le tableau de bord — /admin/haodygasikara ─────────────────────────────
//
// Trois questions, dans cet ordre :
//
//   1. QUI ATTEND UNE RÉPONSE ? Les demandes de devis non traitées, les plus
//      anciennes d'abord — la promesse faite au voyageur est de 48 h.
//   2. LES SUGGESTIONS DU CRÉATEUR SERVENT-ELLES ? Sur ce que l'écran a
//      montré, combien de destinations le voyageur a ajoutées, par source et
//      par destination ; et les paires « souvent associées » du moment.
//   3. QUE CHOISISSENT LES VOYAGEURS ? Les destinations qu'ils mettent dans
//      leurs voyages, et les circuits de l'agence qui font naître des devis.
//
// Cette page charge les données et place les blocs ; chaque bloc vit dans
// components/, les pièces communes des graphiques dans components/graphe/.

export default function Dashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [devis, setDevis] = useState([]);
    const [efficacite, setEfficacite] = useState(null);
    const [choix, setChoix] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    useEffect(() => {
        let actif = true;
        // Chaque bloc vit sa vie : une panne des suggestions ne doit pas
        // masquer les devis à traiter.
        Promise.allSettled([findStatsDevisApi(), findAllDemandesDevisApi(), findEfficaciteSuggestionsApi(), findChoixVoyageursApi()])
            .then(([s, d, e, c]) => {
                if (!actif) return;
                if (s.status === "fulfilled") setStats(s.value?.data ?? null);
                if (d.status === "fulfilled") setDevis(d.value?.data ?? []);
                if (e.status === "fulfilled") setEfficacite(e.value?.data ?? null);
                if (c.status === "fulfilled") setChoix(c.value?.data ?? null);
                const echec = [s, d, e, c].find((r) => r.status === "rejected");
                if (echec) setErreur(apiErrorMessage(echec.reason, "Une partie du tableau de bord n'a pas pu être chargée."));
            })
            .finally(() => actif && setChargement(false));
        return () => { actif = false; };
    }, []);

    const kpiItems = useMemo(() => [
        {
            label: "À traiter",
            value: (stats?.aTraiter ?? 0) + (stats?.enCours ?? 0),
            hint: `${stats?.aTraiter ?? 0} nouvelle${(stats?.aTraiter ?? 0) > 1 ? "s" : ""}, ${stats?.enCours ?? 0} à l'étude`,
            accent: "var(--brand-terre)",
        },
        {
            label: "Délai de réponse",
            value: stats?.delaiMoyenHeures == null ? "—" : `${stats.delaiMoyenHeures} h`,
            hint: stats?.delaiMoyenHeures == null ? "aucun devis encore proposé"
                : stats.delaiMoyenHeures <= HEURES_PROMESSE ? "dans la promesse des 48 h" : "au-delà de la promesse des 48 h",
            accent: "var(--brand-ocre)",
        },
        {
            label: "Taux d'acceptation",
            value: pourcent(stats?.tauxAcceptation),
            hint: `${stats?.acceptes ?? 0} accepté${(stats?.acceptes ?? 0) > 1 ? "s" : ""} sur ${stats?.total ?? 0} demande${(stats?.total ?? 0) > 1 ? "s" : ""}`,
            accent: "var(--brand-nature)",
        },
        {
            label: "Suggestions ajoutées",
            value: pourcent(efficacite?.taux),
            hint: efficacite?.vues
                ? `${efficacite.ajouts} ajout${efficacite.ajouts > 1 ? "s" : ""} sur ${efficacite.vues} suggestion${efficacite.vues > 1 ? "s" : ""} montrée${efficacite.vues > 1 ? "s" : ""}`
                : "aucune suggestion encore montrée",
            accent: "var(--brand-lagune)",
        },
    ], [stats, efficacite]);

    const enAttente = (stats?.aTraiter ?? 0) + (stats?.enCours ?? 0);

    return <>
        <Accueil prenom={user?.prenom} chargement={chargement} enAttente={enAttente} />

        <KpiCard items={kpiItems} loading={chargement} />

        {erreur && <p className="ad-erreur" style={{ marginTop: 0, marginBottom: 24 }}>{erreur}</p>}

        <div className="ad-tb-grille">
            <DemandesEnAttente devis={devis} chargement={chargement} />
            <EfficaciteSources efficacite={efficacite} chargement={chargement} />
        </div>

        <div className="ad-tb-grille">
            <DestinationsChoisies choix={choix} chargement={chargement} />
            <CircuitsDemandes choix={choix} chargement={chargement} />
        </div>

        <div className="ad-tb-grille">
            <SuggestionsParDestination efficacite={efficacite} chargement={chargement} />
            <Associations efficacite={efficacite} chargement={chargement} onRecalcul={setEfficacite} />
        </div>
    </>;
}
