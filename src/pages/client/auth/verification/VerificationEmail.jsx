import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { resendCodeApi, verifyCodeApi } from "../../../../api/authApi";
import { codeErreurApi, messageErreurApi, secondesAvantReessai } from "../../../../utils/auth";
import { CODES_ERREUR } from "../../../../constants/client/erreursAuth";
import { formaterAttente, useCompteARebours } from "../../../../hooks/useCompteARebours";

const LONGUEUR_CODE = 6;

// Le back impose 60 s entre deux envois. On lance le decompte des le succes
// plutot que d'attendre le 429 : l'utilisateur voit pourquoi le lien est
// eteint au lieu de cliquer dans le vide puis de lire un refus.
const SECONDES_ENTRE_ENVOIS = 60;

export default function VerificationEmail() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const email = state?.email ?? "";
    const contexte = state?.message;

    const [chiffres, setChiffres] = useState(Array(LONGUEUR_CODE).fill(""));
    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const [succes, setSucces] = useState("");
    const cases = useRef([]);

    // Deux decomptes distincts : le compte peut etre bloque (codes faux)
    // pendant que le renvoi, lui, est simplement en periode de repos.
    const blocage = useCompteARebours();
    const repos = useCompteARebours();

    const code = chiffres.join("");
    const bloque = blocage.restant > 0;
    const complet = code.length === LONGUEUR_CODE && !bloque;

    useEffect(() => { cases.current[0]?.focus(); }, []);

    const saisir = (i, valeur) => {
        if (bloque) return;
        const chiffre = valeur.replace(/\D/g, "").slice(-1);
        setChiffres((c) => {
            const suivant = [...c];
            suivant[i] = chiffre;
            return suivant;
        });
        if (chiffre && i < LONGUEUR_CODE - 1) cases.current[i + 1]?.focus();
    };

    // Retour arrière sur une case vide : on remonte à la précédente
    const clavier = (i, e) => {
        if (e.key === "Backspace" && !chiffres[i] && i > 0) cases.current[i - 1]?.focus();
        if (e.key === "ArrowLeft" && i > 0) cases.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < LONGUEUR_CODE - 1) cases.current[i + 1]?.focus();
    };

    // Coller le code entier depuis le mail doit remplir les six cases
    const coller = (e) => {
        const colle = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LONGUEUR_CODE);
        if (!colle) return;
        e.preventDefault();
        const suivant = Array(LONGUEUR_CODE).fill("");
        [...colle].forEach((d, i) => { suivant[i] = d; });
        setChiffres(suivant);
        cases.current[Math.min(colle.length, LONGUEUR_CODE - 1)]?.focus();
    };

    const valider = async (e) => {
        e.preventDefault();
        if (!complet || envoi) return;

        setErreur("");
        setSucces("");
        setEnvoi(true);
        try {
            await verifyCodeApi({ email, code });
            navigate("/login", { replace: true, state: { message: "Votre email est vérifié. Vous pouvez vous connecter." } });
        } catch (error) {
            setErreur(messageErreurApi(error));
            setChiffres(Array(LONGUEUR_CODE).fill(""));

            // 429 : le back dit combien de temps patienter, on le montre au
            // lieu de laisser l'utilisateur marteler un bouton qui refusera.
            const attente = secondesAvantReessai(error);
            if (attente > 0) {
                if (codeErreurApi(error) === CODES_ERREUR.TOO_MANY_ATTEMPTS) blocage.lancer(attente);
                else repos.lancer(attente);
            } else {
                cases.current[0]?.focus();
            }
        } finally {
            setEnvoi(false);
        }
    };

    const renvoyer = async () => {
        if (envoi || repos.restant > 0 || bloque) return;
        setErreur("");
        setSucces("");
        setEnvoi(true);
        try {
            await resendCodeApi({ email });
            setSucces("Un nouveau code vient de partir.");
            setChiffres(Array(LONGUEUR_CODE).fill(""));
            repos.lancer(SECONDES_ENTRE_ENVOIS);
            cases.current[0]?.focus();
        } catch (error) {
            setErreur(messageErreurApi(error));
            const attente = secondesAvantReessai(error);
            if (attente > 0) {
                if (codeErreurApi(error) === CODES_ERREUR.TOO_MANY_ATTEMPTS) blocage.lancer(attente);
                else repos.lancer(attente);
            }
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: "var(--bg-territoires)" }}>
            {/* ── Barre haute, discrète ───────────────────────────────────── */}
            <div className="flex items-center justify-between px-12 py-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3.5 cursor-pointer"
                    style={{ color: "var(--text-primary)" }}
                >
                    <FaArrowLeft className="text-[11px] transition-transform duration-500 ease-out group-hover:-translate-x-1.5" />
                    <span className="font-body-strong text-[10px] uppercase tracking-[0.35em]">Retour</span>
                </button>

                <span className="font-abhaya-bold text-xl" style={{ color: "var(--text-primary)" }}>
                    HaodyGasikara
                </span>
            </div>

            {/* ── Le code, seul au centre ─────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-8 pb-24">
                <div className="w-full text-center" style={{ maxWidth: "560px" }}>
                    <p className="font-body-strong text-[10px] uppercase tracking-[0.5em] mb-8" style={{ color: "var(--brand-terre)" }}>
                        Vérification
                    </p>

                    <h1
                        className="font-title leading-[0.95]"
                        style={{ color: "var(--text-primary)", fontSize: "clamp(2.5rem, 4.5vw, 4rem)" }}
                    >
                        Votre code
                        <br />
                        à six chiffres.
                    </h1>

                    <p className="mt-9 font-body text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                        Nous venons de l'envoyer à
                        {email ? <strong className="font-body-strong"> {email}</strong> : " votre adresse"}.
                    </p>

                    {contexte && (
                        <p className="mt-8 font-body text-sm leading-relaxed px-6 py-4" style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning-text)" }}>
                            {contexte}
                        </p>
                    )}

                    <form onSubmit={valider}>
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-14">
                            {chiffres.map((chiffre, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { cases.current[i] = el; }}
                                    value={chiffre}
                                    onChange={(e) => saisir(i, e.target.value)}
                                    onKeyDown={(e) => clavier(i, e)}
                                    onPaste={coller}
                                    onFocus={(e) => e.target.select()}
                                    inputMode="numeric"
                                    disabled={bloque}
                                    autoComplete={i === 0 ? "one-time-code" : "off"}
                                    aria-label={`Chiffre ${i + 1}`}
                                    className="field-line bg-transparent outline-none text-center font-title transition-all duration-500 disabled:cursor-not-allowed"
                                    style={{
                                        width: "clamp(44px, 7vw, 64px)",
                                        height: "clamp(64px, 9vw, 88px)",
                                        fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                                        color: "var(--text-primary)",
                                        borderBottomWidth: "2px",
                                        opacity: bloque ? 0.35 : 1,
                                    }}
                                />
                            ))}
                        </div>

                        {(erreur || succes) && (
                            <p
                                role="status"
                                className="mt-10 font-body text-sm leading-relaxed px-6 py-4"
                                style={
                                    erreur
                                        ? { backgroundColor: "var(--error-bg)", color: "var(--error-text)" }
                                        : { backgroundColor: "var(--success-bg)", color: "var(--success-text)" }
                                }
                            >
                                {erreur || succes}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!complet || envoi}
                            className="mt-12 w-full py-5 font-body-strong text-[11px] uppercase tracking-[0.3em] transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: complet && !envoi ? "var(--cta-bg)" : "var(--cta-disabled-bg)",
                                color: complet && !envoi ? "var(--cta-text)" : "var(--cta-disabled-text)",
                            }}
                            onMouseEnter={(e) => { if (complet && !envoi) e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)"; }}
                            onMouseLeave={(e) => { if (complet && !envoi) e.currentTarget.style.backgroundColor = "var(--cta-bg)"; }}
                        >
                            {bloque
                                ? `Réessayez dans ${formaterAttente(blocage.restant)}`
                                : envoi
                                    ? "Un instant…"
                                    : "Vérifier mon email"}
                        </button>
                    </form>

                    <div className="mt-10 flex items-center justify-center gap-3 font-body text-sm" style={{ color: "var(--text-muted)" }}>
                        <span>Le code expire dans 15 minutes.</span>
                        {repos.restant > 0 || bloque ? (
                            <span className="font-body-strong" style={{ color: "var(--text-muted)" }}>
                                {bloque
                                    ? "Renvoi indisponible"
                                    : `Nouveau code dans ${formaterAttente(repos.restant)}`}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={renvoyer}
                                disabled={envoi || !email}
                                className="font-body-strong transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed"
                                style={{ color: "var(--text-primary)", textDecoration: "underline", textUnderlineOffset: "4px" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                            >
                                En recevoir un nouveau
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Pied ────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-12 py-8">
                <span className="font-body text-[10px] uppercase tracking-[0.35em]" style={{ color: "var(--text-muted)" }}>
                    Devis sur mesure sous 48 heures
                </span>
                <Link
                    to="/login"
                    className="group flex items-center gap-3 font-body-strong text-[10px] uppercase tracking-[0.3em] transition-colors duration-300"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                >
                    Se connecter
                    <FaArrowRight className="text-[10px] transition-transform duration-500 ease-out group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
