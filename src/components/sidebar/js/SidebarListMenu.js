import {
    FaGauge,
    FaMapLocationDot,
    FaRoute,
    FaFileInvoice,
    FaTags,
    FaUsers,
    FaLocationDot,
    FaLayerGroup,
    FaSuitcaseRolling,
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
            { name: "Circuits des voyageurs", icon: FaSuitcaseRolling, link: `${B}/circuits-voyageurs` },
        ],
    },
    {
        name: "Catalogue",
        items: [
            { name: "Destinations", icon: FaMapLocationDot, link: `${B}/destinations` },
            { name: "Points d'intérêt", icon: FaLocationDot, link: `${B}/pois` },
            { name: "Catégories de POI", icon: FaLayerGroup, link: `${B}/pois/categories` },
            { name: "Étiquettes", icon: FaTags, link: `${B}/tags` },
            { name: "Groupes d'étiquettes", icon: FaTags, link: `${B}/tags-groups` },
        ],
    },
    {
        name: "Administration",
        items: [
            { name: "Utilisateurs", icon: FaUsers, link: `${B}/utilisateurs` },
        ],
    },
];

export default SidebarListMenu;