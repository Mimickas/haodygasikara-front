// src/route/route.jsx
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthProvider from "../providers/AuthProvider";

// Pages publiques
import PageNotFound from "../pages/PageNotFound";
import LoginAdmin from "../pages/admin/login/LoginAdmin";
import RegisterAdmin from "../pages/admin/register/RegisterAdmin";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import Circuits from "../pages/admin/circuit/Circuits";
import Destinations from "../pages/admin/destinations/Destinations";
import Tags from "../pages/admin/tags/Tags";
import CreateModal from "../components/admin/crud/createModal/CreateModal";
import TagsGroup from "../pages/admin/tags/TagsGroup";
import PageAdminNotFound from "../pages/admin/PageAdminNotFound";
import DestinationCreate from "../pages/admin/destinations/DestinationCreate";
import CircuitsCreate from "../pages/admin/circuit/CircuitsCreate";
import DestinationEdit from "../pages/admin/destinations/DestinationEdit";
import CircuitEdit from "../pages/admin/circuit/CircuitEdit";
import CategoryTarifs from "../pages/admin/tarifs/CategoryTarifs";
import Devises from "../pages/admin/tarifs/Devises";
import ConditionTarifs from "../pages/admin/tarifs/ConditionTarifs";
import CircuitTarifs from "../pages/admin/tarifs/CircuitTarifs";
import CircuitTarifConditions from "../pages/admin/tarifs/CircuitTarifConditions";
import CircuitDateTarifs from "../pages/admin/tarifs/CircuitDateTarifs";
import CategoryPois from "../pages/admin/poi/CategoryPois";
import Pois from "../pages/admin/poi/Pois";
import CircuitDays from "../pages/admin/programme/CircuitDays";
import CircuitDayPois from "../pages/admin/programme/CircuitDayPois";
import Reservations from "../pages/admin/reservations/Reservations";
import AppLayout from "../layout/AppLayout";
import Home from "../pages/client/home/Home";
import ViewCircuit from "../pages/client/viewCircuit/ViewCircuit";
import LoginClient from "../pages/client/auth/login/LoginClient";
import VerificationEmail from "../pages/client/auth/verification/VerificationEmail";
import CircuitDetail from "../pages/client/circuitDetail/CircuitDetail";
import CircuitConfirmBooking from "../pages/client/circuitConfirmBooking/CircuitConfirmBooking";
import MesReservations from "../pages/client/mesReservations/MesReservations";
import MonCompte from "../pages/client/monCompte/MonCompte";
// import Home from "../pages/Home";
// import Register from "../pages/Register";
// import PageNotFound from "../pages/PageNotFound";

// // Pages admin
// import AdminLayout from "../layout/AdminLayout";
// import Dashboard from "../pages/admin/Dashboard";

const router = createBrowserRouter([
{
    // Route sans chemin : elle enveloppe tout le reste pour restaurer la
    // session une seule fois. AuthProvider utilise useNavigate, il doit donc
    // vivre a l'interieur du routeur — pas autour de RouterProvider.
    element: <AuthProvider />,
    children: [

    // ── Totalement public ─────────────────────────────────────────────────
    { path: "/login",    element: <LoginClient /> },
    { path: "/register", element: <LoginClient /> },
    { path: "/verification", element: <VerificationEmail /> },
    // { path: "/register", element: <Register /> },
    { path: "/admin/haodygasikara/login", element: <LoginAdmin /> },
    { path: "/admin/haodygasikara/re", element: <RegisterAdmin /> },

    // ── Layout public (header + footer) ──────────────────────────────────
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true,          element: <Home /> },
            { path:"/circuit",          element: <ViewCircuit /> },
            { path: "/circuit/:id", element: <CircuitDetail /> },

            // La reservation est IMBRIQUEE sous le circuit, et ce n'est pas
            // cosmetique : l'URL dit que ce depart appartient a ce circuit.
            // La page revalide ce lien cote serveur — un visiteur qui tape
            // /circuit/1/reservation/999 tombe sur un refus, pas sur un
            // formulaire qui reserverait le depart d'un autre voyage.
            { path: "/circuit/:id/reservation/:dateId", element: <CircuitConfirmBooking /> },

            // Pas de ProtectedRoute : la page se charge sans compte et invite
            // a se connecter. Une redirection seche vers /login ferait perdre
            // l'adresse qu'on vient de partager a quelqu'un.
            { path: "/mes-reservations", element: <MesReservations /> },

            // Meme raison qu'au-dessus : pas de ProtectedRoute. La page se
            // charge sans compte et invite a se connecter.
            { path: "/mon-compte", element: <MonCompte /> }

            // { path: "destinations", element: <Destinations /> },
            // { path: "destination/:id", element: <DestinationDetail /> },

            // // ── Pages user connecté ───────────────────────────────────────
            // {
            //     path: "favoris",
            //     element: (
            //         <ProtectedRoute role="USER">
            //             <Favoris />
            //         </ProtectedRoute>
            //     )
            // },
            // {
            //     path: "mes-circuits",
            //     element: (
            //         <ProtectedRoute role="USER">
            //             <MesCircuits />
            //         </ProtectedRoute>
            //     )
            // },
            // {
            //     path: "profil",
            //     element: (
            //         <ProtectedRoute role="USER">
            //             <Profil />
            //         </ProtectedRoute>
            //     )
            // },
        ]
    },

    // ── Admin ─────────────────────────────────────────────────────────────
    {
        path: "/admin/haodygasikara",
        element: (
            <ProtectedRoute role="ADMIN">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Dashboard /> },
            { path: "reservations", element: <Reservations /> },
            { path: "circuits", element: <Circuits /> },
            { path: "circuits/create", element: <CircuitsCreate /> },
            { path: "circuits/edit/:id", element: <CircuitEdit /> },
            { path: "destinations", element: <Destinations /> },
            { path: "destinations/create", element: <DestinationCreate /> },
            { path: "destinations/edit/:id", element: <DestinationEdit /> },
            { path: "tags", element: <Tags /> },
            { path: "tags-groups", element: <TagsGroup /> },
            { path: "tags/create", element: <CreateModal /> },
            { path: "tarifs/dates", element: <CircuitDateTarifs /> },
            { path: "tarifs/categories", element: <CategoryTarifs /> },
            { path: "tarifs/devises", element: <Devises /> },
            { path: "tarifs/conditions", element: <ConditionTarifs /> },
            { path: "tarifs/circuits", element: <CircuitTarifs /> },
            { path: "tarifs/circuits-conditions", element: <CircuitTarifConditions /> },
            { path: "pois", element: <Pois /> },
            { path: "pois/categories", element: <CategoryPois /> },
            { path: "programme/jours", element: <CircuitDays /> },
            { path: "programme/visites", element: <CircuitDayPois /> },
            { path: "*", element: <PageAdminNotFound /> }
        ]
    },

    { path: "*", element: <PageNotFound /> },
    ],
},
]);

export default router;