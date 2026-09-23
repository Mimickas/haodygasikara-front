import { useState } from "react";
import { FaBell, FaBars, FaMagnifyingGlass } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../../../../store/authStore";

const TITLES = {
    "/admin/haodygasikara": "Tableau de bord",
    "/admin/haodygasikara/circuits": "Circuits",
    "/admin/haodygasikara/devis": "Demandes de devis",
    "/admin/haodygasikara/destinations": "Destinations",
    "/admin/haodygasikara/destinations/create": "Création de destination",  // ← 
    "/admin/haodygasikara/tags": "Étiquettes",
    "/admin/haodygasikara/tags-groups": "Groupes d'Étiquettes",
    "/admin/haodygasikara/tags/create": "Création d'étiquette",  // ←
    "/admin/haodygasikara/tarifs/categories": "Catégories de tarif",
    "/admin/haodygasikara/tarifs/devises": "Devises",
    "/admin/haodygasikara/tarifs/conditions": "Conditions de tarif",
    "/admin/haodygasikara/tarifs/circuits": "Tarifs par circuit",
    "/admin/haodygasikara/tarifs/circuits-conditions": "Conditions par tarif",
    "/admin/haodygasikara/utilisateurs": "Utilisateurs",
    "/admin/haodygasikara/parametres": "Paramètres",
};

export default function Header({ collapsed, onToggle }) {
    const [search, setSearch] = useState("");
    const location = useLocation();
    const title = TITLES[location.pathname] || "Administration";
    const { user } = useAuthStore();

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
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors lg:hidden"
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
                <h1
                    
                >
                    
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* ← recherche soulignée : le filet passe en terre à la saisie (.field-line, cf. index.css) */}
                <label className="field-line hidden md:flex items-center gap-3 h-9 w-72">
                    <FaMagnifyingGlass className="text-sm" style={{ color: "var(--text-muted)" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un circuit, un client…"
                        className="field-input w-full bg-transparent outline-none font-body text-sm"
                        style={{ color: "var(--text-primary)" }}
                    />
                </label>

                {/* Notifications */}
                <button
                    className="relative w-9 h-9 flex items-center justify-center transition-colors flex-shrink-0"
                    style={{
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg)",  // ← manquait
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg)")}
                >
                    <FaBell />
                    <span
                        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--brand-terre)" }}
                    />
                </button>

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