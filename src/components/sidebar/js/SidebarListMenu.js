import {
    FaGauge,
    FaMapLocationDot,
    FaRoute,
    FaFileInvoice,
    FaTags,
    FaTag,
    FaMoneyBillWave,
    FaSliders,
    FaFileInvoiceDollar,
    FaLink,
    FaUsers,
    FaGear,
    FaLocationDot,
    FaLayerGroup,
    FaCalendarDays,
    FaPersonHiking,
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
            { name: "Points d'intérêt", icon: FaLocationDot, link: `${B}/pois` },
            { name: "Catégories de POI", icon: FaLayerGroup, link: `${B}/pois/categories` },
            { name: "Étiquettes", icon: FaTags, link: `${B}/tags` },
            { name: "Groupes d'Étiquettes", icon: FaTags, link: `${B}/tags-groups` },
        ],
    },
    {
        name: "Programme",
        items: [
            { name: "Jour par jour", icon: FaCalendarDays, link: `${B}/programme/jours` },
            { name: "Visites et activités", icon: FaPersonHiking, link: `${B}/programme/visites` },
        ],
    },
    {
        name: "Tarification",
        items: [
            { name: "Dates de départ", icon: FaCalendarDays, link: `${B}/tarifs/dates` },
            { name: "Catégories de tarif", icon: FaTag, link: `${B}/tarifs/categories` },
            { name: "Devises", icon: FaMoneyBillWave, link: `${B}/tarifs/devises` },
            { name: "Conditions", icon: FaSliders, link: `${B}/tarifs/conditions` },
            { name: "Tarifs par circuit", icon: FaFileInvoiceDollar, link: `${B}/tarifs/circuits` },
            { name: "Conditions par tarif", icon: FaLink, link: `${B}/tarifs/circuits-conditions` },
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