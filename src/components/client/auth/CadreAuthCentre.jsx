import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import VoilePage from "../layout/VoilePage";
import { useChargementPage } from "../../../hooks/design/useChargementPage";

// Le cadre des pages d'authentification « au centre » : fond sable, une barre
// haute discrète (retour, marque), le contenu seul au milieu, un pied qui
// ramène à la connexion. Celui de la vérification du code, partagé.

export default function CadreAuthCentre({ surTitre, titre, children, lienPied = { vers: "/login", libelle: "Se connecter" } }) {
    const navigate = useNavigate();

    // Le voile de la maison, ici pour toutes les pages qui portent ce cadre :
    // elles n'ont pas de serveur à attendre, mais elles ont des POLICES — et un
    // titre d'affiche qui se repose après coup se voit autant qu'une image.
    const { progression, pret } = useChargementPage({ images: [] });

    return (
        <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: "var(--bg-territoires)" }}>
            <VoilePage progression={progression} pret={pret} />
            <div className="flex items-center justify-between px-6 sm:px-12 py-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3.5 cursor-pointer"
                    style={{ color: "var(--text-primary)" }}
                >
                    <FaArrowLeft className="text-[11px] transition-transform duration-500 ease-out group-hover:-translate-x-1.5" />
                    <span className="font-body-strong text-[11px] uppercase tracking-[0.1em]">Retour</span>
                </button>

                <Link to="/" className="font-title text-xl" style={{ color: "var(--text-primary)" }}>
                    HaodyGasikara
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 sm:px-8 pb-24">
                <div className="w-full" style={{ maxWidth: "480px" }}>
                    <p className="font-body-strong text-[11px] uppercase tracking-[0.1em] mb-8" style={{ color: "var(--brand-terre)" }}>
                        {surTitre}
                    </p>
                    <h1 className="font-title leading-[0.95]" style={{ color: "var(--text-primary)", fontSize: "clamp(2.5rem, 4.5vw, 4rem)" }}>
                        {titre}
                    </h1>
                    {children}
                </div>
            </div>

            <div className="flex items-center justify-between gap-6 px-6 sm:px-12 py-8">
                <span className="font-body text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                    Devis sur mesure sous 48 heures
                </span>
                <Link
                    to={lienPied.vers}
                    className="group flex items-center gap-3 font-body-strong text-[11px] uppercase tracking-[0.1em] transition-colors duration-300"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                >
                    {lienPied.libelle}
                    <FaArrowRight className="text-[10px] transition-transform duration-500 ease-out group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}

// Le message d'état commun aux formulaires d'authentification.
export function MessageAuth({ ton = "erreur", children }) {
    if (!children) return null;
    const styles = {
        erreur: { backgroundColor: "var(--error-bg)", color: "var(--error-text)" },
        succes: { backgroundColor: "var(--success-bg)", color: "var(--success-text)" },
        info: { backgroundColor: "var(--warning-bg)", color: "var(--warning-text)" },
    };
    return (
        <p role={ton === "erreur" ? "alert" : "status"} className="font-body text-sm leading-relaxed px-5 py-4" style={styles[ton] ?? styles.erreur}>
            {children}
        </p>
    );
}

// Le bouton plein de marque, désactivé pendant l'envoi.
export function BoutonAuth({ actif = true, enCours = false, children, ...props }) {
    const possible = actif && !enCours;
    return (
        <button
            {...props}
            disabled={!possible}
            className="w-full py-5 font-body-strong text-[11px] uppercase tracking-[0.1em] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed"
            style={{
                backgroundColor: possible ? "var(--cta-bg)" : "var(--cta-disabled-bg)",
                color: possible ? "var(--cta-text)" : "var(--cta-disabled-text)",
            }}
            onMouseEnter={(e) => { if (possible) e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)"; }}
            onMouseLeave={(e) => { if (possible) e.currentTarget.style.backgroundColor = "var(--cta-bg)"; }}
        >
            {enCours ? "Un instant…" : children}
        </button>
    );
}

// Un champ souligné, comme ceux de la connexion.
export function ChampAuth({ id, label, aide, ...props }) {
    return (
        <div>
            <label htmlFor={id} className="block font-body-strong text-[11px] uppercase tracking-[0.1em] mb-4" style={{ color: "var(--text-muted)" }}>
                {label}
            </label>
            <input id={id} name={id} {...props}
                className="field-line w-full bg-transparent outline-none pb-3 font-body text-base"
                style={{ color: "var(--text-primary)" }} />
            {aide && <p className="mt-3 font-body text-xs" style={{ color: "var(--text-muted)" }}>{aide}</p>}
        </div>
    );
}
