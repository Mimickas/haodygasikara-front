import { Outlet } from "react-router-dom";
import HeaderClient from "../components/client/layout/header/HeaderClient";
import FooterClient from "../components/client/layout/footer/FooterClient";
import { useSmoothScroll } from "../hooks/design/useSmoothScroll";

export default function AppLayout() {
    useSmoothScroll();
    return (
        <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
            <HeaderClient />
            <main className="pb-10">
                <Outlet />
            </main>
            <FooterClient />
        </div>
    );
}