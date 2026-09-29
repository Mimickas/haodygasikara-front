// La charge utile d'un circuit, composée une seule fois.
//
// Création et modification envoyaient chacune leur objet, avec leur propre
// coercition de `isTemplate` — deux endroits à tenir d'accord, et la fiche
// technique en aurait fait deux de plus. Un seul assembleur : un champ ajouté
// au formulaire arrive dans les deux écrans ou dans aucun.

/** Un champ numérique vide est un blanc voulu, pas un zéro. */
const nombreOuNull = (valeur) =>
    valeur === "" || valeur === null || valeur === undefined ? null : Number(valeur);

/** Une liste déroulante vide renvoie "" : le back attend null. */
const texteOuNull = (valeur) =>
    valeur === "" || valeur === null || valeur === undefined ? null : valeur;

const liste = (valeur) => (Array.isArray(valeur) ? valeur : []);

/**
 * Le programme, mis en forme pour le serveur.
 *
 * L'ordre de la liste EST la numerotation des jours : le premier element est le
 * jour 1. Rien a envoyer d'autre — les etapes du voyage, sa duree et ses
 * sejours se deduisent des journees cote serveur.
 *
 * Une journee sans aucun lieu n'est qu'une ligne ouverte puis abandonnee : elle
 * ne part pas (le serveur la refuserait, et a juste titre).
 */
const toProgramme = (days) => (Array.isArray(days) ? days : [])
    .map((j) => ({
        ...j,
        lieux: (j.lieux ?? [])
            .filter((l) => l.destinationId)
            .map((l) => ({
                destinationId: Number(l.destinationId),
                note: l.note?.trim() || null,
            })),
        titre: j.titre?.trim() || null,
        description: j.description?.trim() || null,
        notes: j.notes?.trim() || null,
        transport: j.transport || null,
        hebergementId: j.hebergementId ? Number(j.hebergementId) : null,
        alternativeIds: j.hebergementId ? (j.alternativeIds ?? []).map(Number) : [],
        visites: (j.visites ?? [])
            .filter((v) => v.poiId)
            .map((v) => ({
                poiId: Number(v.poiId),
                inclus: v.inclus !== false,
                note: v.note?.trim() || null,
            })),
        petitDejeuner: Boolean(j.petitDejeuner),
        dejeuner: Boolean(j.dejeuner),
        diner: Boolean(j.diner),
    }))
    .filter((j) => j.lieux.length > 0);

/**
 * Les etapes du voyage, mises en forme pour le serveur.
 *
 * Une ligne sans lieu n'est qu'une ligne ouverte puis abandonnee : elle ne part
 * pas. Une etape dure au moins un jour — un blanc vaut 1, pas 0.
 */
const toEtapes = (steps) => (Array.isArray(steps) ? steps : [])
    .filter((e) => e.destinationId)
    .map((e) => ({
        destinationId: Number(e.destinationId),
        durationDays: Math.max(1, Number(e.durationDays) || 1),
        notes: e.notes?.trim() || null,
    }));

export function toCircuitPayload(formData, { imageUrls, videoUrl }) {
    return {
        ...formData,

        imageUrls,
        videoUrl,

        days: toProgramme(formData.days),
        steps: toEtapes(formData.steps),

        // Le <radio> renvoie la chaîne "true" ; la valeur relue à l'édition est
        // déjà un booléen. Les deux passent.
        isTemplate: formData.isTemplate === "true" || formData.isTemplate === true,

        // ── La fiche technique ───────────────────────────────────────────
        styleVoyage:     texteOuNull(formData.styleVoyage),
        niveauPhysique:  texteOuNull(formData.niveauPhysique),

        // « Tous âges » n'a que deux états qui parlent : coché, ou rien dit.
        // Un `false` n'existe pas — il affirmerait qu'il y a une limite sans
        // dire laquelle.
        tousAges:        formData.tousAges === "true" || formData.tousAges === true ? true : null,

        ageMin:          nombreOuNull(formData.ageMin),
        ageMax:          nombreOuNull(formData.ageMax),
        tailleGroupeMin: nombreOuNull(formData.tailleGroupeMin),
        tailleGroupeMax: nombreOuNull(formData.tailleGroupeMax),

        langues:    liste(formData.langues),
        transports: liste(formData.transports),
        tagIds:     liste(formData.tagIds).map(Number),

        // Une ligne sans libellé n'est qu'une ligne ouverte puis abandonnée :
        // elle ne part pas au serveur.
        inclusions: liste(formData.inclusions)
            .filter((ligne) => ligne?.libelle?.trim())
            .map((ligne) => ({
                categorie: ligne.categorie || "AUTRE",
                libelle: ligne.libelle.trim(),
                inclus: ligne.inclus !== false,
            })),
    };
}


// ── La cohérence du formulaire ────────────────────────────────────────────
//
// Les bornes d'un champ se déclarent avec lui (createConstant.js). Restent les
// règles qui mettent DEUX champs en rapport : un âge maximum sous le minimum,
// un groupe dont le plancher dépasse le plafond, « tous âges » affirmé en même
// temps qu'une limite d'âge. Chacune passait, et produisait une fiche qui se
// contredit elle-même côté client.
//
// Une seule fonction, passée aux deux écrans du circuit : la création et la
// modification ne peuvent pas diverger.
/**
 * Le rang (1..n) du premier element dont la valeur repete celle du precedent,
 * ou 0 si la suite est propre. Les blancs ne comptent pas : une ligne pas
 * encore remplie n'est pas un doublon.
 */
function suiviDeLuiMeme(liste, cle) {
    const suite = Array.isArray(liste) ? liste : [];
    for (let i = 1; i < suite.length; i++) {
        const avant = suite[i - 1]?.[cle];
        const ici = suite[i]?.[cle];
        if (avant && ici && String(avant) === String(ici)) return i + 1;
    }
    return 0;
}

export function coherenceCircuit(formData) {
    const erreurs = {};
    const nb = (v) => (v === "" || v == null ? null : Number(v));

    const ageMin = nb(formData.ageMin);
    const ageMax = nb(formData.ageMax);
    if (ageMin != null && ageMax != null && ageMax < ageMin) {
        erreurs.ageMax = `L'âge maximum doit être au moins ${ageMin} ans.`;
    }

    const groupeMin = nb(formData.tailleGroupeMin);
    const groupeMax = nb(formData.tailleGroupeMax);
    if (groupeMin != null && groupeMax != null && groupeMax < groupeMin) {
        erreurs.tailleGroupeMax = `Le maximum doit être au moins ${groupeMin} voyageurs.`;
    }

    // « Tous âges » est une promesse d'accueil sans limite : avec une borne
    // d'âge à côté, la fiche dirait les deux.
    const tousAges = formData.tousAges === "true" || formData.tousAges === true;
    if (tousAges && (ageMin != null || ageMax != null)) {
        erreurs.tousAges = "Choisissez : « tous âges », ou une borne d'âge.";
    }

    // Le programme. Une journée sans lieu ne veut rien dire : elle ne dit ni où
    // l'on va, ni où l'on dort, et le serveur la refuse. Autant le dire ici,
    // avec le numéro du jour fautif.
    const journees = Array.isArray(formData.days) ? formData.days : [];
    const sansLieu = journees
        .map((j, i) => ({ jour: i + 1, vide: !(j.lieux ?? []).some((l) => l.destinationId) }))
        .filter((j) => j.vide)
        .map((j) => j.jour);
    if (sansLieu.length) {
        erreurs.days = sansLieu.length === 1
            ? `Le jour ${sansLieu[0]} n'a aucun lieu : ajoutez-en un, ou retirez la journée.`
            : `Les jours ${sansLieu.join(", ")} n'ont aucun lieu : ajoutez-en un, ou retirez ces journées.`;
    }

    // Un lieu ne se suit pas lui-même, ni dans le trajet d'une journée ni dans
    // la suite des étapes. « Ampefy → Itasy → Ampefy » est un aller-retour
    // ordinaire et passe ; « Ampefy → Ampefy » ne dit rien — c'est une étape de
    // deux jours, pas deux étapes. Le serveur applique la même règle ; la poser
    // ici évite un aller-retour pour l'apprendre.
    if (!erreurs.days) {
        const jourFautif = journees.findIndex((j) => suiviDeLuiMeme(j.lieux, "destinationId"));
        if (jourFautif >= 0) {
            erreurs.days = `Le jour ${jourFautif + 1} passe deux fois de suite par le même lieu : `
                + "un lieu ne se suit pas lui-même.";
        }
    }

    const etapes = Array.isArray(formData.steps) ? formData.steps : [];
    const rang = suiviDeLuiMeme(etapes, "destinationId");
    if (rang) {
        erreurs.steps = `Les étapes ${rang - 1} et ${rang} sont au même endroit : deux étapes qui se `
            + "suivent ne peuvent pas être au même lieu — donnez plutôt plus de jours à l'une des deux.";
    } else if (etapes.some((e) => e.destinationId && Number(e.durationDays) < 1)) {
        erreurs.steps = "Une étape dure au moins un jour.";
    }

    return erreurs;
}
