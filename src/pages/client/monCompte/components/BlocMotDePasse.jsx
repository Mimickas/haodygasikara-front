import { useState } from "react";
import { changerMotDePasseApi } from "../../../../api/client/compteApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import Champ from "./Champ";
import Avis from "./Avis";

/** Le minimum imposé par le serveur. Répété ici pour le dire AVANT l'envoi. */
const LONGUEUR_MINIMALE = 8;

/**
 * Le mot de passe.
 *
 * L'actuel est exigé même si la session est valide : un jeton prouve qu'on
 * s'est connecté, pas qu'on est encore devant l'écran.
 *
 * La confirmation n'existe QUE côté écran, et c'est normal : le serveur n'a pas
 * à recevoir deux fois la même valeur pour vérifier qu'on n'a pas fait de faute
 * de frappe. La faute de frappe est un problème d'écran, pas de serveur.
 *
 * ── Ce que ce formulaire ne fait pas, et il faut le savoir ───────────────
 * Changer son mot de passe NE DÉCONNECTE PAS les autres appareils déjà
 * ouverts. Les jetons de renouvellement sont des JWT sans état : rien en base
 * ne les recense, on ne peut donc pas en révoquer un en particulier. Les
 * fermer demanderait une colonne de version de jeton vérifiée à chaque
 * renouvellement — un chantier en soi. L'écran ne le promet donc pas.
 */
export default function BlocMotDePasse() {
    const [form, setForm] = useState({ actuel: "", nouveau: "", confirmation: "" });
    const [envoi, setEnvoi] = useState(false);
    const [avis, setAvis] = useState(null);

    const saisir = (champ) => (e) => {
        setForm((f) => ({ ...f, [champ]: e.target.value }));
        setAvis(null);
    };

    const soumettre = async (e) => {
        e.preventDefault();

        // Vérifié ici pour ne pas faire un aller-retour réseau qui dirait la
        // même chose. Le serveur revérifie de toute façon : un contrôle
        // d'écran n'est jamais une garantie.
        if (form.nouveau !== form.confirmation) {
            setAvis({ ton: "erreur", texte: "Les deux saisies ne correspondent pas." });
            return;
        }
        if (form.nouveau.length < LONGUEUR_MINIMALE) {
            setAvis({ ton: "erreur", texte: `Minimum ${LONGUEUR_MINIMALE} caractères.` });
            return;
        }

        setEnvoi(true);
        setAvis(null);
        try {
            await changerMotDePasseApi({ actuel: form.actuel, nouveau: form.nouveau });
            setForm({ actuel: "", nouveau: "", confirmation: "" });
            setAvis({
                ton: "succes",
                texte: "Mot de passe modifié. Un e-mail de confirmation vient de partir.",
            });
        } catch (error) {
            setAvis({ ton: "erreur", texte: apiErrorMessage(error, "Modification impossible.") });
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <form onSubmit={soumettre}>
            <div className="cx-param__champs">
                <Champ
                    id="mdp-actuel" label="Mot de passe actuel" type="password"
                    value={form.actuel} onChange={saisir("actuel")}
                    autoComplete="current-password" required large
                />
                <Champ
                    id="mdp-nouveau" label="Nouveau mot de passe" type="password"
                    value={form.nouveau} onChange={saisir("nouveau")}
                    autoComplete="new-password" required
                    aide={`${LONGUEUR_MINIMALE} caractères au minimum.`}
                />
                <Champ
                    id="mdp-confirmation" label="Confirmez" type="password"
                    value={form.confirmation} onChange={saisir("confirmation")}
                    autoComplete="new-password" required
                />
            </div>

            <Avis ton={avis?.ton}>{avis?.texte}</Avis>

            <div className="cx-param__actions">
                <button type="submit" disabled={envoi} className="cx-devis__bouton font-body-strong">
                    {envoi ? "Modification…" : "Modifier le mot de passe"}
                </button>
                <span className="cx-param__note font-body">
                    Un e-mail vous confirmera le changement.
                </span>
            </div>
        </form>
    );
}
