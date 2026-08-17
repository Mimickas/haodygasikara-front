import { Outlet } from "react-router-dom";
import HeaderClient from "../components/client/layout/header/HeaderClient";

export default function AppLayout(params) {
    return <>
        <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
            <HeaderClient/>
            <div
                
            >
                <main className="px-6 lg:px-8 pb-10">
                    <Outlet />
                </main>
            </div>
        </div>
    </>
}