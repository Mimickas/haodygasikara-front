import {
    FaGauge,
    FaMapLocationDot,
    FaRoute,
    FaFileInvoice,
    FaTags,
    FaUsers,
    FaGear,
} from "react-icons/fa6";


// Base admin : /admin/haodygasikara
const B = "/admin/haodygasikara";

const SidebarListMenu = [
    {
        name: "Pilotage",
        items: [
            { name: "Tableau de bord", icon: FaGauge, link: B },
            { name: "Circuits", icon: FaRoute, link: `${B}/circuits` },
            { name: "Demandes de devis", icon: FaFileInvoice, link: `${B}/devis` },
        ],
    },
    {
        name: "Catalogue",
        items: [
            { name: "Destinations", icon: FaMapLocationDot, link: `${B}/destinations` },
            { name: "Étiquettes", icon: FaTags, link: `${B}/tags` },
            { name: "Groupes d'Étiquettes", icon: FaTags, link: `${B}/tags-groups` },
        ],
    },
    {
        name: "Administration",
        items: [
            { name: "Utilisateurs", icon: FaUsers, link: `${B}/utilisateurs` },
            { name: "Paramètres", icon: FaGear, link: `${B}/parametres` },
        ],
    },
];

export default SidebarListMenu;