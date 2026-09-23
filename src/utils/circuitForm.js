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

export function toCircuitPayload(formData, { imageUrls, videoUrl }) {
    return {
        ...formData,

        imageUrls,
        videoUrl,

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
