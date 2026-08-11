import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/admin/layout/header/Header";

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const toggle = () => setCollapsed((c) => !c);

    return (
        <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
            <Sidebar collapsed={collapsed} onToggle={toggle} />

            {/* Le contenu glisse selon l'état du menu */}
            <div
                style={{
                    marginLeft: collapsed ? "5rem" : "17rem",
                    transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="max-lg:!ml-0"
            >
                <Header collapsed={collapsed} onToggle={toggle} />
                <main className="px-6 lg:px-8 pb-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}