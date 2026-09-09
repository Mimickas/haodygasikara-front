import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { initiales } from "../../../../constants/client/compte";
import { useAuth } from "../../../../hooks/useAuth";

/**
 * Espace voyageur.
 *
 * Le panneau occupe exactement la place du hero de l'accueil : il devait en
 * reprendre la grammaire, sinon la marque s'effondre au moment ou l'on entre
 * chez soi. D'ou la photo qui saigne jusqu'aux bords, le prenom compose comme
 * un titre de une, et les lignes filetees des « trois gestes ».
 */

// Volet image a gauche : c'est lui qui porte l'identite, le reste travaille.
const VOLET_IMAGE = "44%";

const IMAGE_VOYAGEUR =
    "/img/home/ctaSection/tropical-beach-landscape-with-deckchair-parasol-from-nosy-be-madagascar-vintage-light-filter.jpg";
const IMAGE_INVITE = "/img/home/firstHero/baoba.jpg";

// Les endpoints devis et favoris n'existent pas encore cote API. Tant qu'ils
// ne sont pas la, les deux listes restent vides — plutot que d'afficher des
// donnees inventees qui feraient croire a un espace deja alimente.
const DEVIS = [];
const FAVORIS = [];

// Repris du panneau menu : ce sont les memes coordonnees, une seule verite.
const CONSEILLER = {
    email: "contact@haodygasikara.com",
    tel: "+261 34 27 013 74",
    telHref: "+261342701374",
};

const ATOUTS = [
    { titre: "Vos devis", desc: "Suivez chaque demande, de l'envoi à la confirmation." },
    { titre: "Vos favoris", desc: "Retrouvez les itinéraires que vous avez mis de côté." },
    { titre: "Vos compositions", desc: "Reprenez un circuit là où vous l'aviez laissé." },
];

/* ── Titre masque : chaque ligne monte de sous son propre cadre ───────────
   Le double span est indispensable — c'est le parent en overflow hidden qui
   decoupe, l'enfant qui se deplace. Un seul element ne peut pas faire les
   deux. Meme mecanique que le titre du hero d'accueil. */
function LigneMasquee({ children }) {
    return (
        <span className="block overflow-hidden">
            <span data-panel-mask className="block">{children}</span>
        </span>
    );
}

/* ── Ligne editoriale : le chiffre est la donnee, pas un ornement ───────── */
function Rangee({ compte, titre, texte, action, vers, onClose }) {
    const contenu = (
        <>
            <div className="col-span-2">
                <span className="font-title text-5xl leading-none tabular-nums" style={{ color: "var(--border-strong)" }}>
                    {String(compte).padStart(2, "0")}
                </span>
            </div>

            <div className="col-span-4">
                <h3
                    className="font-title text-3xl leading-tight transition-transform duration-500 ease-out group-hover:translate-x-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    {titre}
                </h3>
            </div>

            <div className="col-span-5">
                <p className="font-body text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {texte}
                </p>
                {action && (
                    <span
                        className="inline-flex items-center gap-3 mt-3 font-body-strong text-[10px] uppercase tracking-[0.25em] transition-colors duration-300"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {action}
                    </span>
                )}
            </div>

            <div className="col-span-1 flex justify-end">
                <FaArrowRight
                    className="text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
                    style={{ color: "var(--brand-terre)" }}
                />
            </div>
        </>
    );

    const classes = "group grid grid-cols-12 gap-8 items-baseline py-7";
    const filet = { borderTop: "1px solid var(--border)" };

    if (!vers) return <div className={classes} style={filet}>{contenu}</div>;

    return (
        <Link to={vers} onClick={onClose} className={classes} style={filet}>
            {contenu}
        </Link>
    );
}

export default function AccountPanel({ onClose }) {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <div className="flex h-full">
            {/* ══ Volet image ══════════════════════════════════════════════ */}
            <aside className="relative shrink-0 overflow-hidden" style={{ width: VOLET_IMAGE }}>
                <img
                    data-panel-media
                    src={isAuthenticated ? IMAGE_VOYAGEUR : IMAGE_INVITE}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Deux voiles, pas un. Celui du bas porte le nom ; celui du
                    haut existe parce que l'accroche ocre et le monogramme se
                    perdaient completement dans le ciel de la photo. */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(16,14,11,0.94) 0%, rgba(16,14,11,0.58) 40%, rgba(16,14,11,0.12) 100%)",
                    }}
                />
                <div
                    className="absolute inset-x-0 top-0"
                    style={{
                        height: "38%",
                        background:
                            "linear-gradient(to bottom, rgba(16,14,11,0.62) 0%, rgba(16,14,11,0.22) 45%, rgba(16,14,11,0) 100%)",
                    }}
                />

                <div className="relative h-full flex flex-col justify-between px-14 py-11">
                    <div data-panel-item className="flex items-center justify-between gap-6">
                        <p
                            className="font-body-strong text-[10px] uppercase tracking-[0.5em]"
                            style={{ color: "var(--brand-ocre)" }}
                        >
                            Espace voyageur
                        </p>
                        {isAuthenticated && (
                            <span
                                className="shrink-0 rounded-full flex items-center justify-center font-body-strong text-[11px]"
                                style={{
                                    width: 40,
                                    height: 40,
                                    color: "var(--text-inverse)",
                                    border: "1px solid rgba(247,245,240,0.4)",
                                }}
                            >
                                {initiales(user)}
                            </span>
                        )}
                    </div>

                    <div>
                        <h2
                            className="font-title leading-[0.88]"
                            style={{ color: "var(--text-inverse)", fontSize: "clamp(2.6rem, 4vw, 4.4rem)" }}
                        >
                            {isAuthenticated ? (
                                <>
                                    <LigneMasquee>{user?.prenom}</LigneMasquee>
                                    <LigneMasquee>{user?.nom}</LigneMasquee>
                                </>
                            ) : (
                                <>
                                    <LigneMasquee>Votre</LigneMasquee>
                                    <LigneMasquee>Madagascar,</LigneMasquee>
                                    <LigneMasquee>retrouvé.</LigneMasquee>
                                </>
                            )}
                        </h2>

                        {/* Barre filetee de pied, comme sous le hero d'accueil */}
                        <div
                            data-panel-item
                            className="mt-9 pt-6 flex items-end justify-between gap-8"
                            style={{ borderTop: "1px solid rgba(247,245,240,0.22)" }}
                        >
                            {isAuthenticated ? (
                                <>
                                    <div className="min-w-0">
                                        <p
                                            className="font-body text-[10px] uppercase tracking-[0.35em] mb-2"
                                            style={{ color: "var(--brand-ocre)" }}
                                        >
                                            Connecté
                                        </p>
                                        <p
                                            className="font-body text-sm truncate"
                                            style={{ color: "var(--text-inverse-secondary)" }}
                                        >
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="shrink-0 font-body-strong text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 cursor-pointer"
                                        style={{ color: "var(--text-inverse-muted)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-ocre)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-inverse-muted)")}
                                    >
                                        Déconnexion
                                    </button>
                                </>
                            ) : (
                                <p
                                    className="font-body text-[15px] leading-[1.8] max-w-sm"
                                    style={{ color: "var(--text-inverse-secondary)" }}
                                >
                                    Vos devis, vos itinéraires mis de côté et vos compositions
                                    en cours, réunis au même endroit.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* ══ Volet de travail ═════════════════════════════════════════ */}
            <div
                className="flex-1 flex flex-col justify-center px-14 py-11 min-w-0"
                style={{ backgroundColor: "var(--bg-card)" }}
            >
                {isAuthenticated ? (
                    <>
                        <div data-panel-item className="mb-8">
                            <p
                                className="font-body-strong text-[10px] uppercase tracking-[0.45em] mb-3"
                                style={{ color: "var(--brand-terre)" }}
                            >
                                Votre carnet
                            </p>
                            <h3
                                className="font-title leading-[0.95]"
                                style={{ color: "var(--text-primary)", fontSize: "clamp(1.9rem, 2.6vw, 2.9rem)" }}
                            >
                                Où en sont vos voyages.
                            </h3>
                        </div>

                        <div data-panel-item>
                            <Rangee
                                compte={DEVIS.length}
                                titre="Mes devis"
                                texte="Aucune demande en cours. Ouvrez un itinéraire pour en demander le devis."
                                action="Voir les circuits"
                                vers="/circuit"
                                onClose={onClose}
                            />
                        </div>

                        <div data-panel-item>
                            <Rangee
                                compte={FAVORIS.length}
                                titre="Mes favoris"
                                texte="Aucun circuit mis de côté pour l'instant."
                                action="Parcourir la sélection"
                                vers="/circuit"
                                onClose={onClose}
                            />
                        </div>

                        <div
                            data-panel-item
                            className="grid grid-cols-12 gap-8 items-baseline py-7"
                            style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
                        >
                            <div className="col-span-2">
                                <span
                                    className="font-body-strong text-[10px] uppercase tracking-[0.35em]"
                                    style={{ color: "var(--brand-terre)" }}
                                >
                                    À vos côtés
                                </span>
                            </div>
                            <div className="col-span-4">
                                <h3 className="font-title text-3xl leading-tight" style={{ color: "var(--text-primary)" }}>
                                    Votre conseiller
                                </h3>
                            </div>
                            <div className="col-span-6 flex flex-col gap-1.5">
                                <a
                                    href={`mailto:${CONSEILLER.email}`}
                                    className="font-body text-sm transition-colors duration-300 w-fit"
                                    style={{ color: "var(--text-primary)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                                >
                                    {CONSEILLER.email}
                                </a>
                                <a
                                    href={`tel:${CONSEILLER.telHref}`}
                                    className="font-body text-sm transition-colors duration-300 w-fit"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                                >
                                    {CONSEILLER.tel}
                                </a>
                            </div>
                        </div>

                        <Link
                            data-panel-item
                            to="/circuit"
                            onClick={onClose}
                            className="group mt-8 w-fit flex items-center gap-5 px-11 py-4 transition-colors duration-300"
                            style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                        >
                            <span className="font-body-strong text-[11px] uppercase tracking-[0.3em]">
                                Composer mon circuit
                            </span>
                            <FaArrowRight className="text-[11px] transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
                        </Link>
                    </>
                ) : (
                    <>
                        <div data-panel-item className="mb-8">
                            <p
                                className="font-body-strong text-[10px] uppercase tracking-[0.45em] mb-3"
                                style={{ color: "var(--brand-terre)" }}
                            >
                                Ce que vous y trouverez
                            </p>
                            <h3
                                className="font-title leading-[0.95]"
                                style={{ color: "var(--text-primary)", fontSize: "clamp(1.9rem, 2.6vw, 2.9rem)" }}
                            >
                                Un carnet, pas un compte.
                            </h3>
                        </div>

                        {ATOUTS.map((a) => (
                            <div
                                key={a.titre}
                                data-panel-item
                                className="grid grid-cols-12 gap-8 items-baseline py-6"
                                style={{ borderTop: "1px solid var(--border)" }}
                            >
                                <div className="col-span-4">
                                    <h4 className="font-title text-2xl leading-tight" style={{ color: "var(--text-primary)" }}>
                                        {a.titre}
                                    </h4>
                                </div>
                                <div className="col-span-8">
                                    <p className="font-body text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                        {a.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div style={{ borderTop: "1px solid var(--border)" }} />

                        <div data-panel-item className="flex items-center gap-9 mt-10">
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="px-11 py-4 font-body-strong text-[11px] uppercase tracking-[0.3em] transition-colors duration-300"
                                style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                            >
                                Se connecter
                            </Link>
                            <Link
                                to="/register"
                                onClick={onClose}
                                className="group flex items-center gap-3 font-body-strong text-[11px] uppercase tracking-[0.3em] transition-colors duration-300"
                                style={{ color: "var(--text-primary)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                            >
                                Créer un compte
                                <FaArrowRight className="text-[10px] transition-transform duration-500 group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
