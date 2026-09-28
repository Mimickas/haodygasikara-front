import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaPlus } from "react-icons/fa6";
import { dupliquerMonCircuitApi, findMesCircuitsApi, supprimerMonCircuitApi } from "../../../api/client/composerApi";
import { useAuth } from "../../../hooks/useAuth";
import { useRevelation } from "../../../hooks/design/useRevelation";
import { STATUTS_CIRCUIT } from "../../../constants/client/composer";
import { actionDemandeVivante, libelleStatutDevis } from "../../../constants/client/devis";
import { messageErreurApi } from "../../../utils/auth";
import { formatDateCourte } from "../../../utils/format";
import { imageCloudinary } from "../../../utils/image";

// ── Mes circuits — /mes-circuits ───────────────────────────────────────────
//
// L'historique des circuits composés par le voyageur, du plus récemment
// modifié au plus ancien : on reprend un brouillon là où on l'avait laissé,
// on duplique pour tenter une variante, on supprime ce qui ne sert plus.
// Un circuit qui a fait l'objet d'un devis ne se supprime pas (le serveur le
// refuse) : le conseiller doit pouvoir s'y référer.

export default function MesCircuits() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [circuits, setCircuits] = useState([]);
    const [etat, setEtat] = useState("chargement");
    const [aSupprimer, setASupprimer] = useState(null);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        if (!isAuthenticated) { setEtat("pret"); return; }
        try {
            const r = await findMesCircuitsApi();
            setCircuits(r.data ?? []);
            setEtat("pret");
        } catch (e) {
            setErreur(messageErreurApi(e, "Vos circuits n'ont pas pu être chargés."));
            setEtat("erreur");
        }
    }, [isAuthenticated]);

    useEffect(() => { charger(); }, [charger]);

    // La clé, c'est le nombre de cartes : une suppression ou une duplication
    // refait la liste, et les déclencheurs doivent suivre. Sans elle, les
    // cartes reconstruites n'étaient plus rattachées à rien.
    useRevelation([
        { cible: ".cx-mc .cx-tete > *", y: 30, stagger: 0.08 },
        { cible: ".cx-mc-carte", y: 30, stagger: 0.07, depart: "top 94%" },
    ], etat === "pret", circuits.length);

    const dupliquer = async (id) => {
        setErreur(null);
        try {
            const r = await dupliquerMonCircuitApi(id);
            navigate(`/composer/${r.data.id}`);
        } catch (e) {
            setErreur(messageErreurApi(e, "La copie n'a pas pu être créée."));
        }
    };

    const supprimer = async (id) => {
        setErreur(null);
        try {
            await supprimerMonCircuitApi(id);
            setCircuits((liste) => liste.filter((c) => c.id !== id));
        } catch (e) {
            setErreur(messageErreurApi(e, "Le circuit n'a pas pu être supprimé."));
        } finally {
            setASupprimer(null);
        }
    };

    return (
        <div className="cx-detail cx-sous-entete">
            <section className="cx-mc" data-header-text="var(--text-primary)">
                <div className="cx-tete">
                    <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">Votre carnet</span>
                    <h1 className="cx-tete__titre font-title">Mes circuits</h1>
                    <div>
                        <p className="cx-tete__chapo font-body">
                            {isAuthenticated
                                ? "Les voyages que vous composez, enregistrés au fil de vos idées. Reprenez-les quand vous voulez."
                                : "Connectez-vous pour retrouver les circuits que vous avez composés."}
                        </p>
                        <Link to="/composer" className="cx-cp-bouton cx-cp-bouton--plein cx-mc__nouveau font-body-strong">
                            <FaPlus size={10} /> Composer un nouveau circuit
                        </Link>
                    </div>
                </div>

                {erreur && <p className="cx-mc__erreur font-body" role="alert">{erreur}</p>}

                {!isAuthenticated ? (
                    <div className="cx-md__vide">
                        <p className="cx-md__vide-texte font-body">Vos circuits vous attendent dans votre espace voyageur.</p>
                        <Link to="/login" state={{ from: "/mes-circuits" }} className="cx-dv-recap__envoyer cx-md__vide-action font-body-strong">
                            Se connecter <FaArrowRight size={11} />
                        </Link>
                    </div>
                ) : etat === "chargement" ? (
                    <p className="cx-mc__attente cx-label cx-label--legende font-body-strong">Chargement&hellip;</p>
                ) : circuits.length === 0 ? (
                    <div className="cx-md__vide">
                        <p className="cx-md__vide-texte font-body">
                            Aucun circuit pour l'instant. Choisissez vos destinations, glissez-les dans l'ordre qui vous plaît,
                            et enregistrez : il vous attendra ici.
                        </p>
                    </div>
                ) : (
                    <ul className="cx-mc__grille">
                        {circuits.map((c) => {
                            const statut = STATUTS_CIRCUIT[c.statut] ?? STATUTS_CIRCUIT.BROUILLON;
                            const nuits = c.coherence?.nuitsPlanifiees ?? 0;
                            return (
                                <li key={c.id} className="cx-mc-carte">
                                    <Link to={`/composer/${c.id}`} className="cx-mc-carte__media" data-curseur="Ouvrir" aria-label={`Reprendre ${c.nom}`}>
                                        {c.couverture ? <img src={imageCloudinary(c.couverture, 800)} alt="" loading="lazy" decoding="async" /> : <span className="cx-mc-carte__vide font-title">{c.nom.charAt(0)}</span>}
                                        <span className={`cx-cp-pastille cx-cp-pastille--${statut.ton} cx-mc-carte__statut`}>{statut.libelle}</span>
                                    </Link>
                                    <div className="cx-mc-carte__corps">
                                        <Link to={`/composer/${c.id}`} className="cx-mc-carte__nom font-title">{c.nom}</Link>
                                        <p className="cx-mc-carte__quand font-body">
                                            {c.dateArrivee ? `${formatDateCourte(c.dateArrivee)} → ${formatDateCourte(c.dateDepart)}` : "Dates à fixer"}
                                            {" · "}{c.etapes.length} étape{c.etapes.length > 1 ? "s" : ""} · {nuits} nuit{nuits > 1 ? "s" : ""}
                                        </p>
                                        <p className="cx-mc-carte__parcours font-body">
                                            {c.etapes.map((e) => e.destination.nom).join(" → ") || "Itinéraire vide"}
                                        </p>
                                        {c.devis && (
                                            <Link to="/mes-devis" className="cx-mc-carte__devis font-body-strong">
                                                Devis {c.devis.reference} · {libelleStatutDevis(c.devis.statut)}
                                            </Link>
                                        )}
                                        <p className="cx-mc-carte__maj font-body">Modifié le {formatDateCourte(c.updatedAt)}</p>
                                    </div>
                                    <div className="cx-mc-carte__actions">
                                        {aSupprimer === c.id ? (
                                            <>
                                                <span className="font-body cx-mc-carte__confirmer">Supprimer ce circuit ?</span>
                                                <button type="button" className="cx-cp-lien cx-cp-lien--danger font-body-strong" onClick={() => supprimer(c.id)}>Oui, supprimer</button>
                                                <button type="button" className="cx-cp-lien font-body-strong" onClick={() => setASupprimer(null)}>Garder</button>
                                            </>
                                        ) : (
                                            <>
                                                {/* Un voyage tenu par un devis ne se modifie plus : on mène au devis,
                                                    le voyage reste consultable. */}
                                                {c.verrouille ? (
                                                    <>
                                                        <Link to="/mes-devis" className="cx-cp-bouton cx-cp-bouton--plein font-body-strong">
                                                            {actionDemandeVivante(c.devis?.statut)}
                                                        </Link>
                                                        <Link to={`/composer/${c.id}`} className="cx-cp-lien font-body-strong">Voir le voyage</Link>
                                                    </>
                                                ) : (
                                                    <Link to={`/composer/${c.id}`} className="cx-cp-bouton font-body-strong">
                                                        {c.statut === "BROUILLON" ? "Reprendre" : "Modifier"}
                                                    </Link>
                                                )}
                                                <button type="button" className="cx-cp-lien font-body-strong" onClick={() => dupliquer(c.id)}>Dupliquer</button>
                                                {!c.devis && (
                                                    <button type="button" className="cx-cp-lien font-body-strong" onClick={() => setASupprimer(c.id)}>Supprimer</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
