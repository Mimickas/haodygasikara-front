import { useEffect, useState } from "react";
import LienPanneau from "./LienPanneau";
import { FaArrowRight } from "react-icons/fa6";
import { useAuth } from "../../../../hooks/useAuth";
import Avatar from "../../compte/Avatar";
import { findMesDevisApi } from "../../../../api/client/devisApi";
import { findMesCircuitsApi } from "../../../../api/client/composerApi";
import { CONTACT } from "../../../../constants/client/contact";

/**
 * Espace voyageur.
 *
 * La grammaire de l'accueil, sans photographie : à gauche la colonne de sable
 * (le prénom composé comme un titre de une), à droite les lignes filetées des
 * « trois gestes ». Aucune image ni voile : c'est le texte qui porte.
 */

const ATOUTS = [
    { titre: "Vos devis", desc: "Suivez chaque demande, de l'envoi à la réponse de votre conseiller." },
    { titre: "Vos circuits", desc: "Composez votre voyage, enregistrez-le, reprenez-le quand vous voulez." },
    { titre: "Vos envies", desc: "Dites ce qui vous attire : le créateur vous propose ce qui vous ressemble." },
];

/* ── Titre masqué : chaque ligne monte de sous son propre cadre ───────────
   Le double span est indispensable — c'est le parent en overflow hidden qui
   découpe, l'enfant qui se déplace. Même mécanique que le titre de l'accueil. */
function LigneMasquee({ children }) {
    return (
        <span className="block overflow-hidden">
            <span data-panel-mask className="block">{children}</span>
        </span>
    );
}

/* ── Une ligne du carnet : le compte est la donnée, pas un ornement ─────── */
function Rangee({ compte, titre, texte, action, vers, onNaviguer }) {
    return (
        <LienPanneau to={vers} onNaviguer={onNaviguer} className="cx-compte-rangee">
            <span className="cx-compte-rangee__compte font-body-strong tabular-nums">{String(compte).padStart(2, "0")}</span>
            <span className="cx-compte-rangee__titre font-title">{titre}</span>
            <span className="cx-compte-rangee__texte">
                <span className="font-body">{texte}</span>
                <span className="cx-compte-rangee__action cx-label font-body-strong">
                    {action} <FaArrowRight aria-hidden="true" />
                </span>
            </span>
        </LienPanneau>
    );
}

export default function AccountPanel({ onClose, onNaviguer }) {
    const { isAuthenticated, user, logout } = useAuth();

    // Les devis et les circuits se lisent à l'ouverture du panneau, et
    // seulement connecté : un panneau d'en-tête ne doit rien charger d'autre.
    const [devis, setDevis] = useState([]);
    const [circuits, setCircuits] = useState([]);
    useEffect(() => {
        if (!isAuthenticated) return;
        let vivant = true;
        findMesDevisApi()
            .then((r) => { if (vivant) setDevis(r?.data ?? []); })
            .catch(() => { /* un compteur absent vaut mieux qu'un panneau cassé */ });
        findMesCircuitsApi()
            .then((r) => { if (vivant) setCircuits(r?.data ?? []); })
            .catch(() => { /* idem */ });
        return () => { vivant = false; };
    }, [isAuthenticated]);

    const brouillons = circuits.filter((c) => c.statut === "BROUILLON").length;
    const aRepondre = devis.filter((d) => d.statutAffiche === "PROPOSE").length;
    const enCours = devis.filter((d) => ["ENVOYE", "EN_COURS", "PROPOSE"].includes(d.statutAffiche)).length;

    return (
        <div className="cx-compte-panneau">
            {/* ══ La colonne de sable ══════════════════════════════════════ */}
            <aside className="cx-compte-panneau__sable">
                <div data-panel-item className="flex items-center justify-between gap-6">
                    <p className="cx-label cx-label--accent font-body-strong">Espace voyageur</p>
                    {isAuthenticated && <Avatar user={user} taille={40} />}
                </div>

                <div>
                    <h2 className="cx-compte-panneau__titre font-title">
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

                    <div data-panel-item className="cx-compte-panneau__pied">
                        {isAuthenticated ? (
                            <>
                                <div className="min-w-0">
                                    <p className="cx-label cx-label--legende font-body-strong">Connecté</p>
                                    <p className="cx-compte-panneau__email font-body">{user?.email}</p>
                                </div>
                                <div className="cx-compte-panneau__gestes">
                                    <LienPanneau to="/mon-compte" onNaviguer={onNaviguer} className="cx-compte-panneau__geste cx-label font-body-strong">
                                        Paramètres
                                    </LienPanneau>
                                    {/* La déconnexion change de page, elle aussi : elle passe
                                        donc par la même file que les liens — le panneau se
                                        referme d'abord, on quitte ensuite. */}
                                    <button type="button" onClick={() => onClose(logout)} className="cx-compte-panneau__geste cx-label font-body-strong">
                                        Déconnexion
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="cx-compte-panneau__invite font-body">
                                Vos devis, vos voyages en cours et vos envies, réunis au même endroit.
                            </p>
                        )}
                    </div>
                </div>
            </aside>

            {/* ══ Le carnet ════════════════════════════════════════════════ */}
            <div className="cx-compte-panneau__carnet">
                {isAuthenticated ? (
                    <>
                        <div data-panel-item className="cx-compte-panneau__tete">
                            <p className="cx-label cx-label--accent font-body-strong">Votre carnet</p>
                            <h3 className="cx-compte-panneau__soustitre font-title">Où en sont vos voyages.</h3>
                        </div>

                        <div data-panel-item>
                            <Rangee
                                compte={devis.length}
                                titre="Mes devis"
                                texte={aRepondre > 0
                                    ? `${aRepondre} devis ${aRepondre > 1 ? "attendent" : "attend"} votre réponse.`
                                    : enCours > 0
                                        ? `${enCours} demande${enCours > 1 ? "s" : ""} en cours : suivez chaque étape.`
                                        : devis.length > 0
                                            ? "Retrouvez vos demandes passées et leurs réponses."
                                            : "Aucune demande en cours. Ouvrez un circuit pour en demander le devis."}
                                action={devis.length > 0 ? "Voir mes devis" : "Voir les circuits"}
                                vers={devis.length > 0 ? "/mes-devis" : "/circuit"}
                                onNaviguer={onNaviguer}
                            />
                        </div>

                        <div data-panel-item>
                            <Rangee
                                compte={circuits.length}
                                titre="Mes circuits"
                                texte={brouillons > 0
                                    ? `${brouillons} brouillon${brouillons > 1 ? "s" : ""} à reprendre là où vous l'avez laissé.`
                                    : circuits.length > 0
                                        ? "Retrouvez les voyages que vous avez composés."
                                        : "Composez votre propre voyage, étape par étape."}
                                action={circuits.length > 0 ? "Voir mes circuits" : "Composer un circuit"}
                                vers={circuits.length > 0 ? "/mes-circuits" : "/composer"}
                                onNaviguer={onNaviguer}
                            />
                        </div>

                        <div data-panel-item className="cx-compte-rangee cx-compte-rangee--fixe">
                            <span className="cx-label cx-label--accent font-body-strong">À vos côtés</span>
                            <span className="cx-compte-rangee__titre font-title">Votre conseiller</span>
                            <span className="cx-compte-rangee__texte">
                                <a href={`mailto:${CONTACT.email}`} className="cx-menu__contact font-body">{CONTACT.email}</a>
                                <a href={`tel:${CONTACT.telHref}`} className="cx-menu__contact cx-menu__contact--pale font-body">{CONTACT.tel}</a>
                            </span>
                        </div>

                        <LienPanneau data-panel-item to="/composer" onNaviguer={onNaviguer} className="cx-compte-panneau__cta cx-devis__bouton font-body-strong">
                            Composer mon circuit <FaArrowRight aria-hidden="true" />
                        </LienPanneau>
                    </>
                ) : (
                    <>
                        <div data-panel-item className="cx-compte-panneau__tete">
                            <p className="cx-label cx-label--accent font-body-strong">Ce que vous y trouverez</p>
                            <h3 className="cx-compte-panneau__soustitre font-title">Un carnet, pas un compte.</h3>
                        </div>

                        {ATOUTS.map((a) => (
                            <div key={a.titre} data-panel-item className="cx-compte-rangee cx-compte-rangee--fixe">
                                <span className="cx-compte-rangee__titre font-title">{a.titre}</span>
                                <span className="cx-compte-rangee__texte font-body">{a.desc}</span>
                            </div>
                        ))}

                        <div data-panel-item className="cx-compte-panneau__gestes-invite">
                            <LienPanneau to="/login" onNaviguer={onNaviguer} className="cx-devis__bouton font-body-strong">Se connecter</LienPanneau>
                            <LienPanneau to="/register" onNaviguer={onNaviguer} className="cx-dv-lien font-body-strong">Créer un compte</LienPanneau>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
