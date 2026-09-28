import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/admin/layout/header/Header";
import BandeauMail from "../components/admin/ui/erreur/BandeauMail";

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const toggle = () => setCollapsed((c) => !c);

    // Sous 1024 px la colonne est cachée : le bouton ☰ de l'en-tête l'ouvre
    // par-dessus la page, et chaque navigation la referme.
    const [menuMobile, setMenuMobile] = useState(false);
    const { pathname } = useLocation();
    useEffect(() => { setMenuMobile(false); }, [pathname]);

    return (
        <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
            <Sidebar collapsed={collapsed} onToggle={toggle}
                ouvertMobile={menuMobile} onFermerMobile={() => setMenuMobile(false)} />

            {/* Le contenu glisse selon l'état du menu */}
            <div
                style={{
                    marginLeft: collapsed ? "5rem" : "17rem",
                    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="max-lg:!ml-0"
            >
                <Header collapsed={collapsed} onToggle={() => setMenuMobile((o) => !o)} />
                {/* pt- : la respiration sous l'en-tête collant, pour toutes les pages à la fois */}
                <main className="px-6 lg:px-8 pt-7 lg:pt-9 pb-10">
                    <BandeauMail />
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
