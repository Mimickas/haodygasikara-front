import { useEffect, useState } from "react";
import { FaBell, FaBars } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../../store/authStore";
import { findStatsDevisApi } from "../../../../api/admin/demandeDevisApi";

const TITLES = {
    "/admin/haodygasikara": "Tableau de bord",
    "/admin/haodygasikara/circuits": "Circuits",
    "/admin/haodygasikara/devis": "Demandes de devis",
    "/admin/haodygasikara/circuits-voyageurs": "Circuits des voyageurs",
    "/admin/haodygasikara/destinations": "Destinations",
    "/admin/haodygasikara/destinations/create": "Nouvelle destination",
    "/admin/haodygasikara/tags": "Étiquettes",
    "/admin/haodygasikara/tags-groups": "Groupes d'étiquettes",
    "/admin/haodygasikara/utilisateurs": "Utilisateurs",
    "/admin/haodygasikara/circuits/create": "Nouveau circuit",
    "/admin/haodygasikara/pois": "Points d'intérêt",
    "/admin/haodygasikara/pois/categories": "Catégories de POI",
};

// Les pages à identifiant : /circuits/edit/12 → « Modifier le circuit »
const PREFIXES = [
    ["/admin/haodygasikara/circuits/edit/", "Modifier le circuit"],
    ["/admin/haodygasikara/destinations/edit/", "Modifier la destination"],
];

const titreDe = (chemin) => {
    const net = chemin.replace(/\/+$/, "") || "/";
    return TITLES[net] ?? PREFIXES.find(([prefixe]) => net.startsWith(prefixe))?.[1] ?? "Administration";
};

// La cloche dit une seule chose : des demandes de devis attendent une réponse.
// Relue à chaque changement de page, et chaque minute.
function useDemandesEnAttente(pathname) {
    const [enAttente, setEnAttente] = useState(0);
    useEffect(() => {
        let actif = true;
        const lire = () => findStatsDevisApi()
            .then((r) => actif && setEnAttente((r?.data?.aTraiter ?? 0) + (r?.data?.enCours ?? 0)))
            .catch(() => {});
        lire();
        const minuterie = setInterval(lire, 60_000);
        return () => { actif = false; clearInterval(minuterie); };
    }, [pathname]);
    return enAttente;
}

export default function Header({ collapsed, onToggle }) {
    const location = useLocation();
    const title = titreDe(location.pathname);
    const { user } = useAuthStore();
    const enAttente = useDemandesEnAttente(location.pathname);

    return (
        <header
            className="sticky top-0 z-10 h-17 flex items-center justify-between px-6 lg:px-8 "
            style={{ backgroundColor: "var(--bg)", borderBottom: "1px solid var(--border)" }}
        >
            <div className="flex items-center gap-3">
                {/* Repli visible aussi sur tablette/mobile */}
                <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
                    className="w-9 h-9 flex items-center justify-center transition-colors lg:hidden"
                    style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-card)" }}
                >
                    <FaBars />
                </button>
                <div className="flex flex-col gap-1.5">
                    <span
                        className="font-body-strong text-[10px] uppercase leading-none"
                        style={{ color: "var(--brand-terre)", letterSpacing: "0.1em" }}
                    >
                        Haodygasikara · Administration
                    </span>
                    <h1
                        className="font-title text-2xl lg:text-3xl leading-none"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Les demandes qui attendent : la cloche mène à la liste « À traiter » */}
                <Link
                    to="/admin/haodygasikara/devis"
                    title={enAttente ? `${enAttente} demande${enAttente > 1 ? "s" : ""} de devis à traiter` : "Aucune demande en attente"}
                    aria-label={enAttente ? `${enAttente} demandes de devis à traiter` : "Demandes de devis"}
                    className="relative w-9 h-9 flex items-center justify-center transition-colors flex-shrink-0"
                    style={{
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg)")}
                >
                    <FaBell />
                    {enAttente > 0 && (
                        <span
                            className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center font-body-strong text-[10px] leading-none"
                            style={{ backgroundColor: "var(--brand-terre)", color: "#FFFFFF" }}
                        >
                            {enAttente}
                        </span>
                    )}
                </Link>

                {/* Avatar */}
                <div
                    className="w-9 h-9 flex items-center justify-center font-body-strong text-xs flex-shrink-0"
                    style={{
                        backgroundColor: "var(--brand-terre)",
                        color: "#FFFFFF",
                    }}
                    title={user ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : undefined}
                >
                    {/* ← initiales de l'admin connecté, "HR" en repli */}
                    {user?.prenom || user?.nom ? `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase() : "HR"}
                </div>
            </div>
        </header>
    );
}