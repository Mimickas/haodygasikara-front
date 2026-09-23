import { useState } from "react";
import { changerIdentiteApi } from "../../../../api/client/compteApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import { useAuth } from "../../../../hooks/useAuth";
import Champ from "./Champ";
import Avis from "./Avis";

/**
 * Nom, prénom, téléphone.
 *
 * Aucun mot de passe demandé, et c'est délibéré : ces trois champs ne donnent
 * accès à rien. Exiger le mot de passe pour corriger une faute de frappe dans
 * son prénom, c'est apprendre aux gens à le saisir sans y penser — exactement
 * ce qu'on ne veut pas le jour où il protège vraiment quelque chose.
 */
export default function BlocIdentite({ compte, onMaj }) {
    const { majUser } = useAuth();

    const [form, setForm] = useState({
        nom: compte.nom ?? "",
        prenom: compte.prenom ?? "",
        telephone: compte.telephone ?? "",
    });
    const [envoi, setEnvoi] = useState(false);
    const [avis, setAvis] = useState(null);

    const saisir = (champ) => (e) => {
        setForm((f) => ({ ...f, [champ]: e.target.value }));
        setAvis(null);
    };

    const soumettre = async (e) => {
        e.preventDefault();
        setEnvoi(true);
        setAvis(null);
        try {
            const reponse = await changerIdentiteApi(form);
            onMaj(reponse.data);
            // La barre d'en-tête affiche le prénom : elle doit suivre tout de
            // suite, sinon l'écran donne l'impression de n'avoir rien fait.
            majUser({ nom: reponse.data.nom, prenom: reponse.data.prenom });
            setAvis({ ton: "succes", texte: "Vos informations sont à jour." });
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
                    id="prenom" label="Prénom" value={form.prenom}
                    onChange={saisir("prenom")} autoComplete="given-name" required
                />
                <Champ
                    id="nom" label="Nom" value={form.nom}
                    onChange={saisir("nom")} autoComplete="family-name" required
                />
                <Champ
                    id="telephone" label="Téléphone" type="tel" value={form.telephone}
                    onChange={saisir("telephone")} autoComplete="tel" large
                    aide="Utilisé uniquement pour vous joindre au sujet d'un voyage."
                />
            </div>

            <Avis ton={avis?.ton}>{avis?.texte}</Avis>

            <div className="cx-param__actions">
                <button type="submit" disabled={envoi} className="cx-devis__bouton font-body-strong">
                    {envoi ? "Enregistrement…" : "Enregistrer"}
                </button>
            </div>
        </form>
    );
}
