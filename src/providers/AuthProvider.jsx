// src/providers/AuthProvider.jsx
import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store/authStore";

/**
 * Restaure la session une seule fois, a la racine de l'application.
 *
 * Le jeton vit en memoire — c'est voulu, un jeton dans localStorage est
 * lisible par n'importe quelle injection — donc il dispararait a chaque
 * rechargement. Sans cette restauration au niveau racine, seul ProtectedRoute
 * le reconstruisait : le header, monte sur toutes les pages y compris
 * publiques, affichait « Se connecter » alors que la session etait valide.
 *
 * On ne bloque pas l'affichage : les pages publiques n'ont aucune raison
 * d'attendre un aller-retour reseau. Les pages protegees, elles, patientent
 * via `sessionRestauree`.
 */
export default function AuthProvider() {
    const { restoreSession } = useAuth();
    const finRestauration = useAuthStore((s) => s.finRestauration);
    const lance = useRef(false);

    useEffect(() => {
        // StrictMode monte deux fois en developpement : sans ce garde, deux
        // appels de rafraichissement partent en parallele.
        if (lance.current) return;
        lance.current = true;

        restoreSession().finally(finRestauration);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Outlet />;
}
