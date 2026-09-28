import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motDePasseOublieApi } from "../../../../api/authApi";
import { messageErreurApi } from "../../../../utils/auth";
import CadreAuthCentre, { BoutonAuth, ChampAuth, MessageAuth } from "../../../../components/client/auth/CadreAuthCentre";

// ── Mot de passe oublié — /mot-de-passe-oublie ─────────────────────────────
//
// Une adresse, un lien par e-mail. La réponse du serveur est la même que le
// compte existe ou non : la page ne peut pas servir à tester qui est inscrit.

export default function MotDePasseOublie() {
    const { state } = useLocation();
    const [email, setEmail] = useState(state?.email ?? "");
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const [envoye, setEnvoye] = useState("");

    const envoyer = async (e) => {
        e.preventDefault();
        if (envoi) return;
        setErreur("");
        setEnvoi(true);
        try {
            const reponse = await motDePasseOublieApi(email.trim());
            setEnvoye(reponse?.message ?? "Si un compte existe pour cette adresse, un lien vient de partir.");
        } catch (error) {
            setErreur(messageErreurApi(error, "La demande n'a pas pu partir. Réessayez."));
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <CadreAuthCentre surTitre="Mot de passe oublié" titre={<>Un nouveau<br />mot de passe.</>}>
            <p className="mt-9 font-body text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                Indiquez l'adresse de votre compte : nous vous envoyons un lien, valable 30 minutes, pour en choisir un autre.
            </p>

            {envoye ? (
                <div className="mt-12 flex flex-col gap-8">
                    <MessageAuth ton="succes">{envoye}</MessageAuth>
                    <button type="button" onClick={() => setEnvoye("")}
                        className="self-start font-body-strong text-[11px] uppercase tracking-[0.1em] cursor-pointer"
                        style={{ color: "var(--text-primary)", textDecoration: "underline", textUnderlineOffset: "5px" }}>
                        Utiliser une autre adresse
                    </button>
                </div>
            ) : (
                <form onSubmit={envoyer} className="mt-12 flex flex-col gap-9" noValidate>
                    <ChampAuth id="email" label="Adresse e-mail" type="email" value={email} autoComplete="email" required
                        onChange={(e) => setEmail(e.target.value)} />
                    <MessageAuth>{erreur}</MessageAuth>
                    <BoutonAuth type="submit" actif={/\S+@\S+\.\S+/.test(email)} enCours={envoi}>
                        Recevoir le lien
                    </BoutonAuth>
                </form>
            )}
        </CadreAuthCentre>
    );
}
