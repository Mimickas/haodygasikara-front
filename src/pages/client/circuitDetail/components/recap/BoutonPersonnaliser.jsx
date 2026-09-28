import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { personnaliserModeleApi } from "../../../../../api/client/composerApi";
import { useAuth } from "../../../../../hooks/useAuth";
import { messageErreurApi } from "../../../../../utils/auth";

// « Personnaliser ce circuit » : une copie du circuit de l'agence, en
// brouillon, ouverte dans le créateur. L'original n'est jamais touché. Sans
// compte, on passe d'abord par la connexion et on revient ici.

export default function BoutonPersonnaliser({ circuitId }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [etat, setEtat] = useState({ enCours: false, erreur: null });

    const personnaliser = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        setEtat({ enCours: true, erreur: null });
        try {
            const r = await personnaliserModeleApi(circuitId);
            navigate(`/composer/${r.data.id}`);
        } catch (e) {
            setEtat({ enCours: false, erreur: messageErreurApi(e, "La copie n'a pas pu être créée.") });
        }
    };

    return (
        <>
            <button type="button" className="cx-devis__personnaliser font-body-strong" onClick={personnaliser} disabled={etat.enCours}>
                {etat.enCours ? "Préparation…" : "Personnaliser ce circuit"}
            </button>
            {etat.erreur && <p className="cx-devis__mention font-body" role="alert">{etat.erreur}</p>}
        </>
    );
}
