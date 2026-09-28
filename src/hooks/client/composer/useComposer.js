import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    creerMonCircuitApi, dupliquerMonCircuitApi, enregistrerMonCircuitApi, findCatalogueApi, findMonCircuitApi,
    findSuggestionsApi, signalerSuggestionsApi, verifierCircuitApi,
} from "../../../api/client/composerApi";
import { useAuth } from "../../useAuth";
import {
    ajouterEtape, changerNotes, changerNuits, deplacerEtape, depuisMonCircuit, idsChoisis,
    nuitsEntre, nuitsPlanifiees, repartirNuits, retirerEtape, versPayload,
} from "../../../functions/composer/itineraire";
import { effacerBrouillonLocal, ecrireBrouillonLocal, lireBrouillonLocal } from "../../../functions/composer/brouillon";
import { DELAI_RECHERCHE_MS, DELAI_VERIFICATION_MS } from "../../../constants/client/composer";
import { messageErreurApi } from "../../../utils/auth";

// ── Le créateur de circuit : l'état et les échanges avec le serveur ────────
//
// L'écran travaille EN LOCAL : ajouter, déplacer, changer les nuits se fait
// sans attendre personne. Le serveur, lui, reste juge de ce qui compte :
//   * le CATALOGUE (filtres, facettes, distances) suit les filtres et les
//     étapes choisies ;
//   * les SUGGESTIONS suivent les étapes et les nuits restantes ;
//   * la COHÉRENCE est redemandée après chaque geste, avec un court délai
//     pour ne pas partir à chaque clic de « + » ;
//   * l'ENREGISTREMENT envoie le circuit entier.
//
// Chaque requête annule la précédente (AbortController) : une réponse lente
// ne peut pas écraser une réponse plus récente.

const VIDE = { id: null, nom: "", dateArrivee: null, dateDepart: null, statut: "BROUILLON", devis: null, etapes: [] };

// Une « séance de composition » par onglet : une suggestion vue compte une
// fois par séance, pas à chaque fois que l'écran la redemande.
const seance = () => {
    try {
        let s = sessionStorage.getItem("haody:composer:seance");
        if (!s) {
            s = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            sessionStorage.setItem("haody:composer:seance", s);
        }
        return s;
    } catch {
        return null;
    }
};
const HISTORIQUE_MAX = 40;

function useRequeteDifferee(executer, dependances, delai) {
    useEffect(() => {
        const controleur = new AbortController();
        const minuterie = setTimeout(() => executer(controleur.signal), delai);
        return () => { clearTimeout(minuterie); controleur.abort(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependances);
}

const annulee = (e) => e?.name === "CanceledError" || e?.code === "ERR_CANCELED";

export function useComposer(circuitId) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [circuit, setCircuit] = useState(VIDE);
    const [chargement, setChargement] = useState(Boolean(circuitId));
    const [erreurChargement, setErreurChargement] = useState(null);

    const [filtres, setFiltres] = useState({ q: "", tags: [], tri: "PERTINENCE" });
    const [catalogue, setCatalogue] = useState({ destinations: [], facettes: [], total: 0, chargement: true });
    const [suggestions, setSuggestions] = useState([]);
    const suggestionsRef = useRef([]);
    const vuesSignalees = useRef(new Set());
    const [coherence, setCoherence] = useState(null);

    const [sauvegarde, setSauvegarde] = useState({ enCours: false, erreur: null, derniere: null, modifie: false });
    const [annulable, setAnnulable] = useState(null);      // { texte } : le dernier geste réversible
    const historique = useRef([]);

    // Un voyage tenu par une demande de devis vivante (à l'étude, devis reçu,
    // accepté) ne se modifie plus : le devis porterait sur un parcours qui
    // n'existe plus. Même règle que le serveur, qui refuse d'enregistrer.
    const verrouille = Boolean(circuit.devis?.vivant);
    const verrou = useRef(false);
    verrou.current = verrouille;

    // ── Chargement ─────────────────────────────────────────────────────────
    useEffect(() => {
        let vivant = true;
        if (circuitId) {
            setChargement(true);
            findMonCircuitApi(circuitId)
                .then((r) => { if (vivant) setCircuit(depuisMonCircuit(r.data)); })
                .catch((e) => { if (vivant) setErreurChargement(messageErreurApi(e, "Ce circuit n'a pas pu être chargé.")); })
                .finally(() => { if (vivant) setChargement(false); });
        } else {
            const local = lireBrouillonLocal();
            setCircuit(local ? { ...VIDE, ...local, id: null } : VIDE);
            setChargement(false);
        }
        historique.current = [];
        return () => { vivant = false; };
    }, [circuitId]);

    // ── Modifier, avec possibilité d'annuler ───────────────────────────────
    const modifier = useCallback((transformer, texteAnnulation = null) => {
        if (verrou.current) return;
        setCircuit((actuel) => {
            const suivant = transformer(actuel);
            if (suivant === actuel) return actuel;
            historique.current = [...historique.current.slice(-HISTORIQUE_MAX + 1), actuel];
            return suivant;
        });
        setAnnulable(texteAnnulation ? { texte: texteAnnulation, le: Date.now() } : null);
        setSauvegarde((s) => ({ ...s, modifie: true, erreur: null }));
    }, []);

    const annuler = useCallback(() => {
        const precedent = historique.current.pop();
        if (!precedent) return;
        setCircuit(precedent);
        setAnnulable(null);
        setSauvegarde((s) => ({ ...s, modifie: true }));
    }, []);

    // Ctrl+Z / Cmd+Z, sauf pendant une saisie (le champ garde son propre annuler).
    useEffect(() => {
        const touche = (e) => {
            if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z" || e.shiftKey) return;
            if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
            e.preventDefault();
            annuler();
        };
        window.addEventListener("keydown", touche);
        return () => window.removeEventListener("keydown", touche);
    }, [annuler]);

    const actions = useMemo(() => ({
        ajouter: (destination, index) => {
            // Ajoutée depuis une suggestion : c'est la mesure de son efficacité
            const suggeree = suggestionsRef.current.find((s) => s.destination.id === destination.id);
            if (suggeree && !verrou.current) {
                signalerSuggestionsApi("AJOUT", seance(), [{ destinationId: destination.id, source: suggeree.source }]);
            }
            modifier((c) => ({ ...c, etapes: ajouterEtape(c.etapes, destination, index) }));
        },
        retirer: (etape) =>
            modifier((c) => ({ ...c, etapes: retirerEtape(c.etapes, etape.cle) }), `${etape.destination.nom} retirée`),
        deplacer: (depuis, vers) =>
            modifier((c) => ({ ...c, etapes: deplacerEtape(c.etapes, depuis, vers) })),
        nuits: (cle, n) =>
            modifier((c) => ({ ...c, etapes: changerNuits(c.etapes, cle, n) })),
        notes: (cle, texte) =>
            modifier((c) => ({ ...c, etapes: changerNotes(c.etapes, cle, texte) })),
        nom: (nom) => modifier((c) => ({ ...c, nom })),
        dates: (dateArrivee, dateDepart) => modifier((c) => ({ ...c, dateArrivee, dateDepart })),
        repartir: () => modifier((c) => {
            const total = nuitsEntre(c.dateArrivee, c.dateDepart);
            return total ? { ...c, etapes: repartirNuits(c.etapes, total) } : c;
        }, "Nuits réparties"),
        vider: () => modifier((c) => ({ ...c, etapes: [] }), "Itinéraire vidé"),
    }), [modifier]);

    // Un visiteur sans compte garde son brouillon dans le navigateur.
    useEffect(() => {
        if (!chargement && !circuit.id && sauvegarde.modifie) ecrireBrouillonLocal(circuit);
    }, [circuit, chargement, sauvegarde.modifie]);

    // ── Dérivés ────────────────────────────────────────────────────────────
    const choisies = useMemo(() => idsChoisis(circuit.etapes), [circuit.etapes]);
    const clesChoisies = choisies.join(",");
    const nuitsPrevues = nuitsEntre(circuit.dateArrivee, circuit.dateDepart);
    const planifiees = nuitsPlanifiees(circuit.etapes);
    const nuitsRestantes = nuitsPrevues == null ? null : nuitsPrevues - planifiees;
    const payload = useMemo(() => versPayload(circuit), [circuit]);
    const clePayload = JSON.stringify(payload);

    // ── Catalogue ──────────────────────────────────────────────────────────
    useRequeteDifferee(async (signal) => {
        setCatalogue((c) => ({ ...c, chargement: true }));
        try {
            const r = await findCatalogueApi({ ...filtres, choisies }, signal);
            setCatalogue({ ...(r.data ?? { destinations: [], facettes: [], total: 0 }), chargement: false });
        } catch (e) {
            if (!annulee(e)) setCatalogue((c) => ({ ...c, chargement: false }));
        }
    }, [filtres.q, filtres.tags.join(","), filtres.tri, clesChoisies], DELAI_RECHERCHE_MS);

    // ── Suggestions ────────────────────────────────────────────────────────
    useRequeteDifferee(async (signal) => {
        try {
            const r = await findSuggestionsApi({ choisies, nuitsRestantes, circuit: circuit.id }, signal);
            const liste = r.data ?? [];
            setSuggestions(liste);
            suggestionsRef.current = liste;
            // Les suggestions nouvellement montrées dans cette séance
            const nouvelles = liste.filter((s) => !vuesSignalees.current.has(s.destination.id));
            if (nouvelles.length) {
                nouvelles.forEach((s) => vuesSignalees.current.add(s.destination.id));
                signalerSuggestionsApi("VUE", seance(),
                    nouvelles.map((s) => ({ destinationId: s.destination.id, source: s.source })));
            }
        } catch (e) {
            if (!annulee(e)) setSuggestions([]);
        }
    }, [clesChoisies, nuitsRestantes, circuit.id], DELAI_RECHERCHE_MS);

    // ── Cohérence ──────────────────────────────────────────────────────────
    useRequeteDifferee(async (signal) => {
        if (!payload.etapes.length && !payload.dateArrivee && !payload.dateDepart) { setCoherence(null); return; }
        try {
            const r = await verifierCircuitApi(payload, signal);
            setCoherence(r.data ?? null);
        } catch (e) {
            if (!annulee(e)) setCoherence(null);
        }
    }, [clePayload], DELAI_VERIFICATION_MS);

    // ── Enregistrer ────────────────────────────────────────────────────────
    const enregistrer = useCallback(async (statut = "BROUILLON") => {
        if (!isAuthenticated) {
            ecrireBrouillonLocal(circuit);
            navigate("/login", { state: { from: "/composer?apresConnexion=1" } });
            return null;
        }
        setSauvegarde((s) => ({ ...s, enCours: true, erreur: null }));
        try {
            const corps = versPayload(circuit, statut);
            const r = circuit.id
                ? await enregistrerMonCircuitApi(circuit.id, corps)
                : await creerMonCircuitApi(corps);
            const enregistre = r.data;
            setCircuit((c) => ({ ...c, id: enregistre.id, statut: enregistre.statut, devis: enregistre.devis, nom: enregistre.nom }));
            setSauvegarde({ enCours: false, erreur: null, derniere: Date.now(), modifie: false });
            if (!circuit.id) {
                effacerBrouillonLocal();
                navigate(`/composer/${enregistre.id}`, { replace: true });
            }
            return enregistre;
        } catch (e) {
            setSauvegarde((s) => ({ ...s, enCours: false, erreur: messageErreurApi(e, "L'enregistrement n'a pas abouti. Réessayez.") }));
            return null;
        }
    }, [circuit, isAuthenticated, navigate]);

    /** Une copie modifiable du voyage verrouillé : pour composer une variante. */
    const dupliquer = useCallback(async () => {
        if (!circuit.id) return;
        setSauvegarde((s) => ({ ...s, enCours: true, erreur: null }));
        try {
            const r = await dupliquerMonCircuitApi(circuit.id);
            setSauvegarde((s) => ({ ...s, enCours: false }));
            navigate(`/composer/${r.data.id}`);
        } catch (e) {
            setSauvegarde((s) => ({ ...s, enCours: false, erreur: messageErreurApi(e, "La copie n'a pas pu être créée.") }));
        }
    }, [circuit.id, navigate]);

    /** Finalise le circuit puis ouvre la demande de devis, avec la date d'arrivée déjà remplie. */
    const demanderDevis = useCallback(async () => {
        const enregistre = await enregistrer("FINALISE");
        if (!enregistre) return;
        try {
            sessionStorage.setItem(`haody:devis:${enregistre.id}`, JSON.stringify({
                dateLibre: enregistre.dateArrivee ?? "", voyageurs: 2, message: "",
            }));
        } catch { /* la page de devis repartira des valeurs par défaut */ }
        navigate(`/circuit/${enregistre.id}/devis`);
    }, [enregistrer, navigate]);

    // Retour de connexion : le brouillon local est enregistré tout seul.
    const dejaRepris = useRef(false);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (dejaRepris.current || !isAuthenticated || circuitId || !params.has("apresConnexion") || chargement) return;
        dejaRepris.current = true;
        if (circuit.etapes.length || circuit.dateArrivee) enregistrer("BROUILLON");
    }, [isAuthenticated, circuitId, location.search, chargement, circuit, enregistrer]);

    return {
        circuit, chargement, erreurChargement,
        filtres, setFiltres, catalogue, suggestions, coherence,
        nuitsPrevues, planifiees, nuitsRestantes,
        actions, annuler, annulable, setAnnulable,
        sauvegarde, enregistrer, demanderDevis, dupliquer, verrouille,
        isAuthenticated,
    };
}
