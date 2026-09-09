import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaGoogle } from "react-icons/fa6";
import { useAuthTransition, modeDepuisUrl } from "../../../../hooks/design/animations/login/useAuthTransition";
import ChampTelephone from "../../../../components/client/form/ChampTelephone";
import ChampDateNaissance from "../../../../components/client/form/ChampDateNaissance";
import { INDICATIF_DEFAUT } from "../../../../constants/client/indicatifs";
import { construirePayloadAuth, messageErreurApi, codeErreurApi } from "../../../../utils/auth";
import { REDIRECTIONS_AUTH } from "../../../../constants/client/erreursAuth";
import { useAuthStore } from "../../../../store/authStore";
import { useAuth } from "../../../../hooks/useAuth";
import { registerApi } from "../../../../api/authApi";

const IMG = "/img/login/elle-leontiev-Wtv8wbxk-M4-unsplash.jpg";
const LARGEUR_FORMULAIRE = 450;

const TEXTES = {
    login: {
        titre: ["Bon retour", "parmi nous."],
        intro: "Retrouvez vos devis en cours, vos itinéraires favoris et les circuits que vous avez commencé à composer.",
        action: "Se connecter",
        bascule: { question: "Pas encore de compte ?", lien: "Créer un compte", vers: "register" },
    },
    register: {
        titre: ["Ouvrez votre", "carnet de voyage."],
        intro: "Quelques instants suffisent. Vous pourrez ensuite composer vos circuits, les mettre de côté et suivre vos devis.",
        action: "Créer mon compte",
        bascule: { question: "Déjà un compte ?", lien: "Se connecter", vers: "login" },
    },
};

function Champ({ id, label, type, value, onChange, autoComplete }) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block font-body-strong text-[10px] uppercase tracking-[0.35em] mb-4"
                style={{ color: "var(--text-muted)" }}
            >
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required
                className="field-line w-full bg-transparent outline-none pb-3 font-body text-base"
                style={{ color: "var(--text-primary)" }}
            />
        </div>
    );
}

export default function LoginClient() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const { scopeRef, contenu, basculer, enTransition } = useAuthTransition(
        modeDepuisUrl(window.location.pathname)
    );

    const [form, setForm] = useState({
        prenom: "", nom: "", email: "", password: "",
        indicatif: INDICATIF_DEFAUT.indicatif, telephone: "",
        naissance: { jour: "", mois: "", annee: "" },
    });
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const [envoi, setEnvoi] = useState(false);
    const [erreur, setErreur] = useState("");
    const [succes, setSucces] = useState("");

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const majChamp = (cle) => (v) => setForm((f) => ({ ...f, [cle]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur("");
        setSucces("");
        setEnvoi(true);

        try {
            if (inscription) {
                await registerApi(construirePayloadAuth(contenu, form));
                // Le compte existe, le code est parti : la suite se joue sur /verification
                navigate("/verification", {
                    replace: true,
                    state: { email: form.email },
                });
                return;
            } else {
                // login remplit le store puis redirige lui-meme : soit vers la
                // page d'ou l'utilisateur a ete refoule, soit vers l'accueil.
                await login(construirePayloadAuth(contenu, form), location.state?.from);
                return;
            }
        } catch (error) {
            const message = messageErreurApi(error);
            const redirection = REDIRECTIONS_AUTH[codeErreurApi(error)];

            if (redirection) {
                if (redirection.purgeSession) clearAuth();
                // le message voyage avec : la page d'arrivee explique pourquoi
                // l'utilisateur atterrit la
                navigate(redirection.vers, {
                    replace: true,
                    state: { message, email: form.email },
                });
                return;
            }

            // Code inconnu ou absent : on reste sur place et on affiche
            setErreur(message);
        } finally {
            setEnvoi(false);
        }
    };

    const t = TEXTES[contenu];
    const inscription = contenu === "register";

    const retour = (
        <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3.5 cursor-pointer"
        >
            <FaArrowLeft className="text-[11px] transition-transform duration-500 ease-out group-hover:-translate-x-1.5" />
            <span className="font-body-strong text-[10px] uppercase tracking-[0.35em]">Retour</span>
        </button>
    );

    return (
        <div ref={scopeRef} className="min-h-screen w-full flex" style={{ backgroundColor: "var(--bg)" }}>
            {/* ── Volet photographique — il ne bouge pas d'un mode à l'autre ─ */}
            <div data-volet className="relative hidden lg:block shrink-0 z-0 overflow-hidden" style={{ width: "52%" }}>
                <img src={IMG} alt="" className="absolute inset-0 w-full h-full object-cover" data-img />
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(16,14,11,0.85) 0%, rgba(16,14,11,0.15) 55%, rgba(16,14,11,0.5) 100%)" }}
                />

                <div data-retour className="absolute top-11 left-12 z-10" style={{ color: "var(--text-inverse)" }}>
                    {retour}
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 px-12 pb-12">
                    <span className="block overflow-hidden mb-7">
                        <span data-photo-kicker className="block font-body-strong text-[10px] uppercase tracking-[0.5em]" style={{ color: "var(--brand-ocre)" }}>
                            Haodygasikara — Madagascar
                        </span>
                    </span>

                    <h2 className="font-title leading-[0.95]" style={{ color: "var(--text-inverse)", fontSize: "clamp(2.25rem, 3.3vw, 3.75rem)" }}>
                        <span className="block overflow-hidden">
                            <span data-photo-line className="block pb-[0.06em]">Chaque voyage commence</span>
                        </span>
                        <span className="block overflow-hidden">
                            <span data-photo-line className="block pb-[0.06em]">par une conversation.</span>
                        </span>
                    </h2>

                    <div className="mt-9">
                        <div data-photo-rule style={{ borderTop: "1px solid rgba(247,245,240,0.25)" }} />
                        <p data-photo-foot className="font-body text-[10px] uppercase tracking-[0.35em] pt-6" style={{ color: "rgba(247,245,240,0.7)" }}>
                            Devis sur mesure sous 48 heures
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Volet formulaire — c'est lui seul qui bascule ────────────── */}
            <div className="flex-1 flex items-center justify-center px-8 py-16 z-10">
                <div className="w-full" style={{ maxWidth: LARGEUR_FORMULAIRE }}>
                    <div data-swap data-text-item className="lg:hidden mb-12" style={{ color: "var(--text-primary)" }}>
                        {retour}
                    </div>

                    <div data-swap>
                        <span className="block overflow-hidden mb-6">
                            <span data-form-kicker className="block font-body-strong text-[10px] uppercase tracking-[0.45em]" style={{ color: "var(--brand-terre)" }}>
                                Espace voyageur
                            </span>
                        </span>
                    </div>

                    <h1
                        data-swap
                        className="font-title leading-[0.95]"
                        style={{ color: "var(--text-primary)", fontSize: "clamp(2.25rem, 3vw, 3.25rem)" }}
                    >
                        {t.titre.map((ligne) => (
                            <span key={ligne} className="block overflow-hidden">
                                <span data-form-line className="block pb-[0.06em]">{ligne}</span>
                            </span>
                        ))}
                    </h1>

                    <p data-swap data-text-item className="mt-7 font-body text-[15px] leading-[1.85]" style={{ color: "var(--text-secondary)" }}>
                        {t.intro}
                    </p>

                    <div data-swap data-text-item>
                        <button
                            type="button"
                            className="mt-11 w-full flex items-center justify-center gap-4 py-4 font-body-strong text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 cursor-pointer"
                            style={{ border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-terre)"; e.currentTarget.style.color = "var(--brand-terre)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        >
                            <FaGoogle className="text-sm" />
                            Continuer avec Google
                        </button>
                    </div>

                    <div data-swap data-text-item className="flex items-center gap-6 my-11">
                        <span className="flex-1" style={{ borderTop: "1px solid var(--border)" }} />
                        <span className="font-body text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                            ou
                        </span>
                        <span className="flex-1" style={{ borderTop: "1px solid var(--border)" }} />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-9">
                        {inscription && (
                            <div data-swap data-text-item className="grid grid-cols-2 gap-6">
                                <Champ id="prenom" label="Prénom" type="text" value={form.prenom} onChange={handleChange} autoComplete="given-name" />
                                <Champ id="nom" label="Nom" type="text" value={form.nom} onChange={handleChange} autoComplete="family-name" />
                            </div>
                        )}

                        {inscription && (
                            <div data-swap data-text-item>
                                <ChampDateNaissance
                                    valeur={form.naissance}
                                    onChange={majChamp("naissance")}
                                />
                            </div>
                        )}

                        <div data-swap data-text-item>
                            <Champ
                                id="email"
                                label="Adresse e-mail"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        {inscription && (
                            <div data-swap data-text-item>
                                <ChampTelephone
                                    indicatif={form.indicatif}
                                    numero={form.telephone}
                                    onIndicatif={majChamp("indicatif")}
                                    onNumero={majChamp("telephone")}
                                />
                            </div>
                        )}

                        <div data-swap data-text-item>
                            <Champ
                                id="password"
                                label="Mot de passe"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete={inscription ? "new-password" : "current-password"}
                            />
                            {!inscription && (
                                <div className="flex justify-end mt-4">
                                    <Link
                                        to="/mot-de-passe-oublie"
                                        className="font-body text-[11px] transition-colors duration-300"
                                        style={{ color: "var(--text-muted)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {(erreur || succes) && (
                            <p
                                role="status"
                                className="font-body text-sm leading-relaxed px-5 py-4"
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
                            data-swap
                            data-text-item
                            type="submit"
                            disabled={envoi}
                            className="w-full py-5 font-body-strong text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 cursor-pointer disabled:cursor-wait"
                            style={{
                                backgroundColor: envoi ? "var(--cta-bg-hover)" : "var(--cta-bg)",
                                color: "var(--cta-text)",
                            }}
                            onMouseEnter={(e) => { if (!envoi) e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)"; }}
                            onMouseLeave={(e) => { if (!envoi) e.currentTarget.style.backgroundColor = "var(--cta-bg)"; }}
                        >
                            {envoi ? "Un instant…" : t.action}
                        </button>
                    </form>

                    <div data-swap data-text-item className="mt-12 pt-8 flex items-center justify-between gap-6" style={{ borderTop: "1px solid var(--border)" }}>
                        <span className="font-body text-sm" style={{ color: "var(--text-muted)" }}>
                            {t.bascule.question}
                        </span>
                        <button
                            type="button"
                            onClick={() => basculer(t.bascule.vers)}
                            disabled={enTransition}
                            className="group flex items-center gap-3 font-body-strong text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 cursor-pointer disabled:cursor-default"
                            style={{ color: "var(--text-primary)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                        >
                            {t.bascule.lien}
                            <FaArrowRight className="text-[10px] transition-transform duration-500 ease-out group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
