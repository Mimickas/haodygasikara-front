// src/route/route.jsx
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages publiques
import Login from "../pages/login/Login";
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
// import Home from "../pages/Home";
// import Register from "../pages/Register";
// import PageNotFound from "../pages/PageNotFound";

// // Pages admin
// import AdminLayout from "../layout/AdminLayout";
// import Dashboard from "../pages/admin/Dashboard";

const router = createBrowserRouter([

    // ── Totalement public ─────────────────────────────────────────────────
    { path: "/login",    element: <Login /> },
    // { path: "/register", element: <Register /> },
    { path: "/admin/haodygasikara/login", element: <LoginAdmin /> },
    { path: "/admin/haodygasikara/re", element: <RegisterAdmin /> },

    // // ── Layout public (header + footer) ──────────────────────────────────
    // {
    //     path: "/",
    //     element: <AppLayout />,
    //     children: [
    //         { index: true,          element: <Home /> },
    //         { path: "destinations", element: <Destinations /> },
    //         { path: "destination/:id", element: <DestinationDetail /> },

    //         // ── Pages user connecté ───────────────────────────────────────
    //         {
    //             path: "favoris",
    //             element: (
    //                 <ProtectedRoute role="USER">
    //                     <Favoris />
    //                 </ProtectedRoute>
    //             )
    //         },
    //         {
    //             path: "mes-circuits",
    //             element: (
    //                 <ProtectedRoute role="USER">
    //                     <MesCircuits />
    //                 </ProtectedRoute>
    //             )
    //         },
    //         {
    //             path: "profil",
    //             element: (
    //                 <ProtectedRoute role="USER">
    //                     <Profil />
    //                 </ProtectedRoute>
    //             )
    //         },
    //     ]
    // },

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
            { path: "circuits", element: <Circuits /> },
            { path: "circuits/create", element: <CircuitsCreate /> },
            { path: "circuits/edit/:id", element: <CircuitEdit /> },
            { path: "destinations", element: <Destinations /> },
            { path: "destinations/create", element: <DestinationCreate /> },
            { path: "destinations/edit/:id", element: <DestinationEdit /> },
            { path: "tags", element: <Tags /> },
            { path: "tags-groups", element: <TagsGroup /> },
            { path: "tags/create", element: <CreateModal /> },
            { path: "*", element: <PageAdminNotFound /> }
        ]
    },

    { path: "*", element: <PageNotFound /> }
]);

export default router;