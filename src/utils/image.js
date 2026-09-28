// ── Les images, à la taille où on les regarde ──────────────────────────────
//
// Une photo est stockée chez Cloudinary à la taille où l'agence l'a déposée :
// 1920 × 1280 pour nos visuels actuels, trois à quatre fois plus pour une
// photo sortie d'un téléphone. Le navigateur la télécharge telle quelle, puis
// il la DÉCODE en mémoire à quatre octets par pixel.
//
// C'est ce décodage qui coûte, et il ne se voit dans aucun poids de fichier :
// 1920 × 1280, ce sont 2,5 millions de pixels, donc ~10 Mo de RAM — pour une
// carte qui en affiche 600 de large. La page des circuits garde neuf visuels
// à l'écran entre son héros et sa grille : ~90 Mo de bitmap pour montrer
// l'équivalent de 9 Mo. La mémoire ne part pas dans le JavaScript, elle part
// là.
//
//
// Cloudinary sait servir la bonne taille, il suffit de la demander dans
// l'URL : `f_auto` choisit le format que le navigateur préfère (AVIF, WebP),
// `q_auto` la compression, `w_` la largeur, `c_limit` interdit d'agrandir une
// petite photo. Rien à changer au dépôt ni au serveur — et aucune animation
// touchée : on change l'adresse de l'image, pas ce qu'on en fait.

const MARQUEUR = "/image/upload/";

/** Une URL déjà transformée ne se transforme pas deux fois. */
const dejaTransformee = (suite) => /(^|,)[a-z]{1,3}_/.test(suite.split("/")[0]);

/**
 * @param {string} url      l'URL Cloudinary d'origine ; tout le reste (photo
 *                          locale, avatar Google, autre hôte) revient intact
 * @param {number} [largeur] largeur voulue en pixels RÉELS (pensez au retina)
 * @param {{hauteur?: number}} [options] hauteur : recadre au centre d'intérêt
 */
export function imageCloudinary(url, largeur, options = {}) {
    if (!url || typeof url !== "string") return url;
    const i = url.indexOf(MARQUEUR);
    if (i === -1) return url;

    const suite = url.slice(i + MARQUEUR.length);
    if (dejaTransformee(suite)) return url;

    const transformations = ["f_auto", "q_auto"];
    if (largeur) transformations.push(`w_${Math.round(largeur)}`);
    if (options.hauteur) {
        transformations.push(`h_${Math.round(options.hauteur)}`, "c_fill", "g_auto");
    } else {
        transformations.push("c_limit");
    }

    return url.slice(0, i + MARQUEUR.length) + transformations.join(",") + "/" + suite;
}

/**
 * Le même visuel en plusieurs largeurs, à donner à `srcset`.
 *
 * C'est le navigateur qui choisit, et il choisit mieux que nous : il connaît
 * la densité de l'écran et la largeur réelle du cadre. Un écran ordinaire
 * télécharge deux fois moins de pixels qu'un retina — et n'en garde deux fois
 * moins en mémoire. Rend `undefined` pour une image non Cloudinary, ce qui
 * laisse l'attribut absent plutôt que vide.
 */
export function srcSetCloudinary(url, largeurs) {
    if (!url || typeof url !== "string" || url.indexOf(MARQUEUR) === -1) return undefined;
    return largeurs.map((l) => `${imageCloudinary(url, l)} ${l}w`).join(", ");
}
