import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthProvider from "../providers/AuthProvider";
import AppLayout from "../layout/AppLayout";
import AdminLayout from "../layout/AdminLayout";
import PageNotFound from "../pages/PageNotFound";

// L'accueil reste chargé avec l'application : c'est la porte d'entrée du site,
// et le découper ferait attendre un second aller-retour à la page que tout le
// monde ouvre en premier. Toutes les AUTRES partent à la demande.
import Home from "../pages/client/home/Home";

// Chargées à la demande. Le créateur embarque Mapbox (1,8 Mo) et
// l'administration ne concerne que l'équipe : personne ne devrait les
// télécharger pour lire l'accueil. Le même raisonnement vaut pour chaque page
// du site — qui regarde les circuits n'a pas besoin du code de « Mon compte »,
// de la demande de devis ni des écrans de mot de passe. Le routeur attend le
// module avant de quitter la page courante, sans écran intermédiaire.
const page = (charger) => async () => ({ Component: (await charger()).default });

const router = createBrowserRouter([
{
    // Route sans chemin : elle enveloppe tout le reste pour restaurer la
    // session une seule fois. AuthProvider utilise useNavigate, il doit donc
    // vivre a l'interieur du routeur — pas autour de RouterProvider.
    element: <AuthProvider />,
    // Premier affichage d'une page chargée à la demande : rien, le temps du module.
    hydrateFallbackElement: null,
    children: [

    // ── Totalement public ─────────────────────────────────────────────────
    { path: "/login",    lazy: page(() => import("../pages/client/auth/login/LoginClient")) },
    { path: "/register", lazy: page(() => import("../pages/client/auth/login/LoginClient")) },
    { path: "/verification", lazy: page(() => import("../pages/client/auth/verification/VerificationEmail")) },
    { path: "/mot-de-passe-oublie", lazy: page(() => import("../pages/client/auth/motDePasse/MotDePasseOublie")) },
    { path: "/reinitialiser-mot-de-passe", lazy: page(() => import("../pages/client/auth/motDePasse/ReinitialiserMotDePasse")) },
    { path: "/admin/haodygasikara/login", lazy: page(() => import("../pages/admin/login/LoginAdmin")) },
    // Première installation seulement (aucun administrateur) ; ensuite, la
    // création passe par Administration → Utilisateurs
    { path: "/admin/haodygasikara/re", lazy: page(() => import("../pages/admin/register/RegisterAdmin")) },

    // ── Layout public (header + footer) ──────────────────────────────────
    {
        path: "/",
        element: <AppLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "/circuit", lazy: page(() => import("../pages/client/viewCircuit/ViewCircuit")) },
            { path: "/circuit/:id", lazy: page(() => import("../pages/client/circuitDetail/CircuitDetail")) },

            // Le devis est IMBRIQUE sous le circuit : l'URL dit de quel voyage on
            // parle. Pas de ProtectedRoute : on remplit sans compte, on se
            // connecte au moment d'envoyer, et le brouillon survit au detour.
            { path: "/circuit/:id/devis", lazy: page(() => import("../pages/client/demandeDevis/DemandeDevis")) },
            { path: "/mes-devis", lazy: page(() => import("../pages/client/mesDevis/MesDevis")) },

            // Le createur de circuit s'ouvre sans compte : on compose librement,
            // et on ne se connecte qu'au moment d'enregistrer.
            { path: "/composer", lazy: page(() => import("../pages/client/composer/Composer")) },
            { path: "/composer/:id", lazy: page(() => import("../pages/client/composer/Composer")) },
            { path: "/mes-circuits", lazy: page(() => import("../pages/client/mesCircuits/MesCircuits")) },

            // Pas de ProtectedRoute : la page se charge sans compte et invite
            // a se connecter.
            { path: "/mon-compte", lazy: page(() => import("../pages/client/monCompte/MonCompte")) },
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
            { index: true, lazy: page(() => import("../pages/admin/dashboard/Dashboard")) },
            { path: "devis", lazy: page(() => import("../pages/admin/devis/DemandesDevis")) },
            { path: "circuits-voyageurs", lazy: page(() => import("../pages/admin/circuitsVoyageurs/CircuitsVoyageurs")) },
            { path: "utilisateurs", lazy: page(() => import("../pages/admin/utilisateurs/Utilisateurs")) },
            { path: "circuits", lazy: page(() => import("../pages/admin/circuit/Circuits")) },
            { path: "circuits/create", lazy: page(() => import("../pages/admin/circuit/CircuitsCreate")) },
            { path: "circuits/edit/:id", lazy: page(() => import("../pages/admin/circuit/CircuitEdit")) },
            { path: "destinations", lazy: page(() => import("../pages/admin/destinations/Destinations")) },
            { path: "destinations/create", lazy: page(() => import("../pages/admin/destinations/DestinationCreate")) },
            { path: "destinations/edit/:id", lazy: page(() => import("../pages/admin/destinations/DestinationEdit")) },
            { path: "tags", lazy: page(() => import("../pages/admin/tags/Tags")) },
            { path: "tags-groups", lazy: page(() => import("../pages/admin/tags/TagsGroup")) },
            { path: "pois", lazy: page(() => import("../pages/admin/poi/Pois")) },
            { path: "pois/categories", lazy: page(() => import("../pages/admin/poi/CategoryPois")) },
            { path: "*", lazy: page(() => import("../pages/admin/PageAdminNotFound")) },
        ]
    },

    { path: "*", element: <PageNotFound /> },
    ],
},
]);

export default router;
