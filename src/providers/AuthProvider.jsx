// src/providers/AuthProvider.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthProvider({ children }) {
    const { restoreSession } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Au reload → essaie de récupérer un nouveau access token via le cookie
        restoreSession().finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span>Chargement...</span>
            </div>
        );
    }

    return children;
}