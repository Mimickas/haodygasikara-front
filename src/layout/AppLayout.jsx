import { Outlet } from "react-router-dom";
import HeaderClient from "../components/client/layout/header/HeaderClient";
import FooterClient from "../components/client/layout/footer/FooterClient";
import RetourEnHaut from "../components/client/layout/RetourEnHaut";
import { useSmoothScroll } from "../hooks/design/useSmoothScroll";

export default function AppLayout() {
    useSmoothScroll();
    return (
        <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
            <RetourEnHaut />
            <HeaderClient />

            {/* Pas de retrait ici, et c'est un choix mesuré.

                La barre est en `fixed` : sans retrait, les 85 premiers pixels
                d'une page passent dessous. Mais trois pages sur quatre ouvrent
                sur un héro plein écran — accueil, liste des circuits, fiche
                circuit — et ce recouvrement est VOULU : c'est lui qui rend la
                barre transparente sur la photographie.

                Un retrait global réparerait la seule page sans héro en cassant
                les trois autres. C'est donc l'inverse : les pages qui ouvrent
                sur du contenu demandent le retrait, avec `.cx-sous-entete`. */}
            <main className="pb-10">
                <Outlet />
            </main>

            <FooterClient />
        </div>
    );
}