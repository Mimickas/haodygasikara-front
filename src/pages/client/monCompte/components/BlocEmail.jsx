import { useState } from "react";
import {
    annulerChangementEmailApi,
    confirmerChangementEmailApi,
    demanderChangementEmailApi,
} from "../../../../api/client/compteApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import { useAuth } from "../../../../hooks/useAuth";
import Champ from "./Champ";
import Avis from "./Avis";

/**
 * L'adresse e-mail, en deux temps.
 *
 * ── Pourquoi deux temps ──────────────────────────────────────────────────
 * Le code part vers la NOUVELLE adresse, et c'est tout l'intérêt : c'est la
 * seule façon de savoir que celui qui la saisit la relève vraiment. Une adresse
 * acceptée sur parole, c'est un compte dont les confirmations de voyage partent
 * chez un inconnu — et dont le propriétaire ne peut plus rien récupérer, parce
 * que l'adresse de reprise n'est plus la sienne.
 *
 * Tant que le code n'est pas saisi, le compte continue de vivre sur l'ancienne
 * adresse. L'écran le dit explicitement : une procédure à moitié faite qui ne
 * s'annonce pas laisse le voyageur persuadé que c'est réglé.
 *
 * ── Pourquoi le mot de passe ─────────────────────────────────────────────
 * Un jeton de session prouve qu'on s'est connecté, pas qu'on est encore devant
 * l'écran. Changer l'adresse de reprise est la première chose qu'on ferait en
 * trouvant un portable resté ouvert.
 *
 * ── La subtilité de la confirmation ──────────────────────────────────────
 * L'adresse EST le sujet du JWT : à l'instant où elle change, le jeton en main
 * et le cookie de renouvellement désignent un compte qui n'existe plus sous ce
 * nom. Le serveur renvoie donc une paire de jetons neufs, et il faut les
 * installer — sinon le voyageur est déconnecté au prochain appel, sur une page
 * qui vient de lui dire « c'est enregistré ».
 */
export default function BlocEmail({ compte, onMaj }) {
    const { setAuth, user } = useAuth();

    const enAttente = Boolean(compte.emailEnAttente);

    const [demande, setDemande] = useState({ email: "", motDePasse: "" });
    const [code, setCode] = useState("");
    const [envoi, setEnvoi] = useState(false);
    const [avis, setAvis] = useState(null);

    const saisir = (champ) => (e) => {
        setDemande((d) => ({ ...d, [champ]: e.target.value }));
        setAvis(null);
    };

    const demander = async (e) => {
        e.preventDefault();
        setEnvoi(true);
        setAvis(null);
        try {
            const reponse = await demanderChangementEmailApi(demande);
            onMaj(reponse.data);
            setDemande({ email: "", motDePasse: "" });
            setAvis({ ton: "succes", texte: reponse.message });
        } catch (error) {
            setAvis({ ton: "erreur", texte: apiErrorMessage(error, "Demande impossible.") });
        } finally {
            setEnvoi(false);
        }
    };

    const confirmer = async (e) => {
        e.preventDefault();
        setEnvoi(true);
        setAvis(null);
        try {
            const reponse = await confirmerChangementEmailApi({ code });
            const { token, email, nom, prenom, role, photoUrl } = reponse.data;

            // Les jetons neufs, installés immédiatement : voir l'en-tête.
            setAuth(token, { email, nom, prenom, role, photoUrl });

            onMaj({ ...compte, email, emailEnAttente: null });
            setCode("");
            setAvis({ ton: "succes", texte: `Votre adresse est maintenant ${email}.` });
        } catch (error) {
            setAvis({ ton: "erreur", texte: apiErrorMessage(error, "Code refusé.") });
        } finally {
            setEnvoi(false);
        }
    };

    const annuler = async () => {
        setEnvoi(true);
        setAvis(null);
        try {
            const reponse = await annulerChangementEmailApi();
            onMaj(reponse.data);
            setCode("");
            setAvis({ ton: "succes", texte: "Demande annulée. Votre adresse n'a pas changé." });
        } catch (error) {
            setAvis({ ton: "erreur", texte: apiErrorMessage(error, "Annulation impossible.") });
        } finally {
            setEnvoi(false);
        }
    };

    // ── Une demande est en cours : on attend le code ─────────────────────
    if (enAttente) {
        return (
            <form onSubmit={confirmer}>
                <p className="cx-param__texte font-body">
                    Un code à six chiffres est parti vers{" "}
                    <strong className="cx-param__accent">{compte.emailEnAttente}</strong>.
                    Saisissez-le pour confirmer. En attendant, votre compte continue
                    de fonctionner avec <strong>{compte.email}</strong>.
                </p>

                <div className="cx-param__champs">
                    <Champ
                        id="code-email" label="Le code reçu" value={code}
                        onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setAvis(null); }}
                        inputMode="numeric" maxLength={6} autoComplete="one-time-code" required
                        aide="Il expire au bout de quinze minutes."
                    />
                </div>

                <Avis ton={avis?.ton}>{avis?.texte}</Avis>

                <div className="cx-param__actions">
                    <button
                        type="submit"
                        disabled={envoi || code.length < 6}
                        className="cx-devis__bouton font-body-strong"
                    >
                        {envoi ? "Vérification…" : "Confirmer l'adresse"}
                    </button>
                    <button
                        type="button"
                        onClick={annuler}
                        disabled={envoi}
                        className="cx-param__lien font-body-strong"
                    >
                        Annuler la demande
                    </button>
                </div>
            </form>
        );
    }

    // ── Compte ouvert avec Google : pas de mot de passe pour garantir ────
    // le changement. Il faut d'abord en ajouter un (réglage suivant).
    if (compte.motDePasse === false) {
        return (
            <p className="cx-param__texte font-body">
                Votre compte se connecte avec Google. Changer d'adresse demande un mot de
                passe, qui prouve que c'est bien vous : ajoutez-en un dans le réglage
                « Mot de passe » ci-dessous, puis revenez ici.
            </p>
        );
    }

    // ── Cas nominal : on demande le changement ──────────────────────────
    return (
        <form onSubmit={demander}>
            <p className="cx-param__texte font-body">
                Nous enverrons un code à la nouvelle adresse pour vérifier qu'elle est
                bien la vôtre. Votre adresse actuelle reste active jusqu'à ce que ce
                code soit saisi.
            </p>

            <div className="cx-param__champs">
                <Champ
                    id="nouvel-email" label="Nouvelle adresse" type="email"
                    value={demande.email} onChange={saisir("email")}
                    autoComplete="email" required
                />
                <Champ
                    id="mdp-email" label="Votre mot de passe" type="password"
                    value={demande.motDePasse} onChange={saisir("motDePasse")}
                    autoComplete="current-password" required
                    aide="Demandé parce que cette adresse sert à reprendre la main sur le compte."
                />
            </div>

            <Avis ton={avis?.ton}>{avis?.texte}</Avis>

            <div className="cx-param__actions">
                <button type="submit" disabled={envoi} className="cx-devis__bouton font-body-strong">
                    {envoi ? "Envoi du code…" : "Envoyer le code"}
                </button>
                <span className="cx-param__note font-body">
                    Connecté avec {user?.email}
                </span>
            </div>
        </form>
    );
}
