import { useEffect, useState } from "react";
import { findEtatMailApi, verifierMailApi } from "../../../../api/admin/mailApi";
import { formatDate } from "../../../../utils/format";

// Les e-mails ne partent plus — mot de passe SMTP révoqué, serveur
// injoignable : l'agence doit le savoir tout de suite, sur toutes les pages.
// Sans ce bandeau, elle croyait ses devis envoyés alors que les voyageurs
// n'en recevaient aucun (l'échec ne se lisait que dans les journaux).
export default function BandeauMail() {
    const [etat, setEtat] = useState(null);
    const [enCours, setEnCours] = useState(false);

    useEffect(() => {
        let vivant = true;
        findEtatMailApi()
            .then((r) => { if (vivant) setEtat(r?.data ?? null); })
            .catch(() => { /* sans état connu, pas de bandeau */ });
        return () => { vivant = false; };
    }, []);

    if (etat?.statut !== "EN_ECHEC") return null;

    const verifier = async () => {
        setEnCours(true);
        try {
            setEtat((await verifierMailApi())?.data ?? null);
        } catch {
            /* le dernier état connu reste affiché */
        } finally {
            setEnCours(false);
        }
    };

    return (
        <div className="ad-erreur ad-mail" role="alert">
            <div>
                <p className="font-body-strong">
                    Les e-mails ne partent pas{etat.depuis ? ` (constaté le ${formatDate(etat.depuis)})` : ""}.
                </p>
                <p className="font-body">
                    {etat.raison} D'ici là, les voyageurs ne reçoivent ni accusés ni devis, et l'agence ne reçoit plus
                    les alertes : les demandes restent visibles ici, et chaque dossier peut renvoyer son e-mail.
                </p>
            </div>
            <button type="button" className="ad-bouton font-body-strong" onClick={verifier} disabled={enCours}>
                {enCours ? "Vérification…" : "Vérifier à nouveau"}
            </button>
        </div>
    );
}
