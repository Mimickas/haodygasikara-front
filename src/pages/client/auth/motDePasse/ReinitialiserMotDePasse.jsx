import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { reinitialiserMotDePasseApi } from "../../../../api/authApi";
import { messageErreurApi } from "../../../../utils/auth";
import CadreAuthCentre, { BoutonAuth, ChampAuth, MessageAuth } from "../../../../components/client/auth/CadreAuthCentre";

// ── Choisir un nouveau mot de passe — /reinitialiser-mot-de-passe?jeton=… ──
//
// On arrive ici depuis le lien de l'e-mail. Deux saisies identiques de 8
// caractères au moins — la règle de l'inscription —, puis retour à la
// connexion avec un message qui confirme le changement.

const MINIMUM = 8;

export default function ReinitialiserMotDePasse() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const jeton = params.get("jeton") ?? "";

    const [motDePasse, setMotDePasse] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const [perime, setPerime] = useState(false);

    const tropCourt = motDePasse.length > 0 && motDePasse.length < MINIMUM;
    const different = confirmation.length > 0 && confirmation !== motDePasse;
    const valide = motDePasse.length >= MINIMUM && confirmation === motDePasse;

    const envoyer = async (e) => {
        e.preventDefault();
        if (!valide || envoi) return;
        setErreur("");
        setEnvoi(true);
        try {
            const reponse = await reinitialiserMotDePasseApi({ token: jeton, password: motDePasse });
            navigate("/login", {
                replace: true,
                state: { message: reponse?.message ?? "Votre mot de passe est modifié. Vous pouvez vous connecter.", ton: "succes" },
            });
        } catch (error) {
            setPerime(error?.response?.status === 410);
            setErreur(messageErreurApi(error, "Le mot de passe n'a pas pu être changé. Réessayez."));
        } finally {
            setEnvoi(false);
        }
    };

    if (!jeton) {
        return (
            <CadreAuthCentre surTitre="Mot de passe" titre={<>Lien<br />incomplet.</>}>
                <p className="mt-9 font-body text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                    Ouvrez le lien reçu par e-mail tel quel, ou demandez-en un nouveau.
                </p>
                <Link to="/mot-de-passe-oublie" className="mt-10 inline-block font-body-strong text-[11px] uppercase tracking-[0.1em]"
                    style={{ color: "var(--brand-terre)", textDecoration: "underline", textUnderlineOffset: "5px" }}>
                    Recevoir un nouveau lien
                </Link>
            </CadreAuthCentre>
        );
    }

    return (
        <CadreAuthCentre surTitre="Mot de passe" titre={<>Choisissez-en<br />un nouveau.</>}>
            <form onSubmit={envoyer} className="mt-12 flex flex-col gap-9" noValidate>
                <ChampAuth id="password" label="Nouveau mot de passe" type="password" value={motDePasse}
                    autoComplete="new-password" onChange={(e) => setMotDePasse(e.target.value)}
                    aide={tropCourt ? `Encore ${MINIMUM - motDePasse.length} caractère(s) au moins.` : `${MINIMUM} caractères au moins.`} />
                <ChampAuth id="confirmation" label="Confirmez-le" type="password" value={confirmation}
                    autoComplete="new-password" onChange={(e) => setConfirmation(e.target.value)}
                    aide={different ? "Les deux saisies ne sont pas identiques." : undefined} />

                <MessageAuth>{erreur}</MessageAuth>
                {perime && (
                    <Link to="/mot-de-passe-oublie" className="self-start font-body-strong text-[11px] uppercase tracking-[0.1em]"
                        style={{ color: "var(--brand-terre)", textDecoration: "underline", textUnderlineOffset: "5px" }}>
                        Recevoir un nouveau lien
                    </Link>
                )}

                <BoutonAuth type="submit" actif={valide} enCours={envoi}>Enregistrer le mot de passe</BoutonAuth>
            </form>
        </CadreAuthCentre>
    );
}
