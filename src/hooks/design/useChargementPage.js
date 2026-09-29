import { useEffect, useRef, useState } from "react";

// ── L'attente d'une page, une fois pour toutes ─────────────────────────────
//
// Une page du site n'est PRÊTE que lorsque trois choses le sont :
//
//   1. ses DONNÉES — les appels à l'API qu'elle a lancés ;
//   2. ses IMAGES  — celles qui se voient dès l'ouverture, pas celles qu'on
//      atteindra en défilant ;
//   3. ses POLICES — sans elles, le texte se repose une fois posé.
//
// Tant que les trois ne sont pas là, la page reste derrière son voile. C'est
// tout l'objet : ne plus jamais montrer une page dont les photographies
// finissent d'arriver sous les yeux du visiteur.
//
// L'accueil portait déjà cette mécanique (useAssetsLoader) et le créateur de
// circuit la sienne (usePrechargement), chacune avec ses manques : la première
// ne savait pas attendre une liste d'images qui arrive APRÈS le serveur, la
// seconde ne comptait rien et n'affichait donc aucune progression. Les deux
// sont ici, et toutes les pages y passent.
//
//
// ── La progression ────────────────────────────────────────────────────────
//
// Elle ne compte pas les étapes, elle les PÈSE — et c'est ce qui la rend
// honnête. Le nombre d'images n'est souvent connu qu'une fois le serveur
// répondu (une fiche circuit ne sait pas combien de photographies elle porte
// avant de les avoir demandées) : un compteur d'étapes reculerait de 50 % à
// 25 % à l'instant où la liste arrive. Avec des parts fixes, le chiffre ne
// redescend jamais.
const PART_DONNEES = 0.35;
const PART_POLICES = 0.15;
const PART_IMAGES = 0.5;

// Une image lente — Cloudinary, une connexion qui traîne — ne doit pas garder
// la page fermée indéfiniment. Passé ce délai, on ouvre avec ce qu'on a.
// Le délai ne court QUE sur les images : les données, elles, s'attendent
// jusqu'au bout (la page a son propre écran d'erreur pour le dire).
const DELAI_IMAGES_MS = 6000;

/**
 * @param {object}   [options]
 * @param {boolean}  [options.donneesPretes]  Les appels de la page ont abouti —
 *                   ou échoué : ce qui compte est qu'ils soient RETOMBÉS, pour
 *                   que la page puisse afficher son erreur. `true` par défaut
 *                   (une page sans serveur à attendre).
 * @param {string[]|null} [options.images]    Les visuels à charger avant
 *                   d'ouvrir. `null` : on ne les connaît pas encore.
 * @param {number}   [options.delaiMax]       Le délai de grâce des images.
 * @returns {{ progression: number, pret: boolean }}
 */
export function useChargementPage({ donneesPretes = true, images = null, delaiMax = DELAI_IMAGES_MS } = {}) {
    // La liste sous forme de chaîne : un tableau reconstruit à chaque rendu ne
    // doit pas relancer le chargement.
    const cleImages = !donneesPretes || images == null
        ? null
        : images.filter(Boolean).join("|");

    const [policesPretes, setPolicesPretes] = useState(false);
    const [chargees, setChargees] = useState(0);
    const [imagesFinies, setImagesFinies] = useState(false);

    useEffect(() => {
        let vivant = true;
        (document.fonts?.ready ?? Promise.resolve()).then(() => { if (vivant) setPolicesPretes(true); });
        return () => { vivant = false; };
    }, []);

    useEffect(() => {
        if (cleImages == null) return undefined;
        const liste = cleImages ? cleImages.split("|") : [];
        setChargees(0);
        if (!liste.length) { setImagesFinies(true); return undefined; }

        let vivant = true;
        let restant = liste.length;
        const une = () => {
            if (!vivant) return;
            setChargees((n) => n + 1);
            restant -= 1;
            if (restant <= 0) setImagesFinies(true);
        };
        liste.forEach((src) => {
            const img = new Image();
            img.onload = une;
            img.onerror = une;           // une image qui manque ne bloque pas la page
            img.src = src;
        });

        const minuterie = setTimeout(() => { if (vivant) setImagesFinies(true); }, delaiMax);
        return () => { vivant = false; clearTimeout(minuterie); };
    }, [cleImages, delaiMax]);

    const total = cleImages ? cleImages.split("|").length : 0;
    const partImages = cleImages == null ? 0 : (imagesFinies || !total ? 1 : chargees / total);
    const brut = Math.round(
        (PART_DONNEES * (donneesPretes ? 1 : 0)
            + PART_POLICES * (policesPretes ? 1 : 0)
            + PART_IMAGES * partImages) * 100);

    // Le chiffre ne recule jamais : une barre qui redescend se lit comme une
    // panne, même quand elle dit la vérité.
    const plancher = useRef(0);
    if (brut > plancher.current) plancher.current = brut;

    // « Prêt » ne redevient jamais faux : un filtre qui recharge la liste, un
    // onglet qui redemande le compte, ne doivent pas refermer la page.
    const [pret, setPret] = useState(false);
    if (!pret && donneesPretes && policesPretes && cleImages != null && imagesFinies) setPret(true);

    return { progression: pret ? 100 : plancher.current, pret };
}
