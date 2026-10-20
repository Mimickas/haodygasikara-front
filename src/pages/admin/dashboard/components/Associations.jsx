import { useState } from "react";
import { recalculerAssociationsApi } from "../../../../api/admin/suggestionsApi";
import { formatDate } from "../../../../utils/format";
import { apiErrorMessage } from "../../../../utils/apiError";
import Squelette from "./Squelette";

// ── Les paires « souvent associées » et leur recalcul ─────────────────────

export default function Associations({ efficacite, chargement, onRecalcul }) {
    const [enCours, setEnCours] = useState(false);
    const [message, setMessage] = useState(null);
    const paires = efficacite?.associations ?? [];

    const recalculer = async () => {
        setEnCours(true);
        setMessage(null);
        try {
            const r = await recalculerAssociationsApi();
            onRecalcul(r?.data ?? null);
            setMessage({ ton: "succes", texte: "Associations recalculées sur l'ensemble des circuits." });
        } catch (error) {
            setMessage({ ton: "erreur", texte: apiErrorMessage(error, "Le recalcul a échoué. Réessayez dans un instant.") });
        } finally {
            setEnCours(false);
        }
    };

    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Souvent associées</p>
                    <h2 className="ad-tb-titre font-title">Les destinations qui vont ensemble</h2>
                </div>
            </header>
            <p className="ad-tb-aide font-body">
                Calculées sur tous les circuits, ceux de l'agence comme ceux des voyageurs : chaque nuit à 3 h,
                et autour d'un circuit dès qu'il est enregistré.
            </p>
            {chargement ? <Squelette lignes={4} /> : paires.length === 0 ? (
                <p className="ad-tb-vide font-body">Pas encore assez de circuits pour dégager des paires.</p>
            ) : (
                <ul className="ad-tb-paires">
                    {paires.map((p) => (
                        <li key={`${p.a}-${p.b}`} className="ad-tb-paire">
                            <span className="font-body-strong">{p.a} <span className="ad-tb-muet">+</span> {p.b}</span>
                            <span className="ad-tb-muet font-body">
                                ensemble dans {p.circuits} circuit{p.circuits > 1 ? "s" : ""} · confiance {p.confiance} % · lift {String(p.lift).replace(".", ",")}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            <div className="ad-tb-pied">
                <span className="ad-tb-muet font-body">
                    Dernier calcul : {efficacite?.dernierCalcul ? formatDate(efficacite.dernierCalcul) : "jamais"}
                </span>
                <button type="button" className="ad-bouton font-body-strong" onClick={recalculer} disabled={enCours || chargement}>
                    {enCours ? "Calcul en cours…" : "Recalculer maintenant"}
                </button>
            </div>
            {message && (
                <p className={message.ton === "erreur" ? "ad-erreur" : "ad-tb-succes font-body"} role="status">{message.texte}</p>
            )}
        </section>
    );
}
