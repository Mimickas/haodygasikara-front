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
                <div className="flex gap-1 items-center">
                    <h1
                        className="font-abhaya-bold text-2xl lg:text-3xl"
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
                <div
                    className={`w-full px-4 py-2.5 rounded-md text-sm outline-none transition-all hidden md:flex items-center gap-4 h-9 px-4 rounded-md`}
                    style={{
                        boxShadow: "var(--shadow-normal)",
                        color: "var(--text-secondary)",
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = "var(--brand-terre)"
                        e.currentTarget.style.boxShadow = "0 0 8px rgba(217, 78, 43, 0.35)"
                        e.currentTarget.style.backgroundColor = "var(--bg-card)"
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = "none"
                        e.currentTarget.style.boxShadow = "var(--shadow-normal)"
                        e.currentTarget.style.backgroundColor = "transparent"
                    }}
                >
                    <FaMagnifyingGlass className="text-sm" style={{ color: "var(--text-muted)" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un circuit, un client…"
                        className=" outline-none text-sm w-56"
                        style={{ color: "var(--text-primary)" }}
                    />
                </div>

                {/* Notifications */}
                <button
                    className="relative w-9 h-9 flex items-center justify-center transition-colors flex-shrink-0"
                    style={{
                        boxShadow: "var(--shadow-normal)",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg)",  // ← manquait
                        borderRadius: "50%",               // ← inline, plus fiable
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg)")}
                >
                    <FaBell />
                    <span
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: "var(--brand-terre)" }}
                    />
                </button>

                {/* Avatar */}
                <div
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                        backgroundColor: "var(--brand-terre)",
                        color: "#FFFFFF",
                        borderRadius: "50%",  // ← inline, plus fiable
                    }}
                >
                    HR
                </div>
            </div>
        </header>
    );
}