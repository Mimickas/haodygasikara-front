import { initiales } from "../../../constants/client/compte";

import { imageCloudinary } from "../../../utils/image";
/**
 * Le visage du compte : la photographie si elle existe, le monogramme sinon.
 *
 * Un seul composant pour les trois endroits qui l'affichent — la barre
 * d'en-tête, l'espace voyageur, la page de paramètres. Sans ça, ajouter la
 * photo revenait à écrire trois fois la même condition, et à en oublier une.
 *
 * Le monogramme n'est PAS un bouche-trou d'erreur : c'est le dessin d'origine,
 * et il reste le cas nominal pour qui n'a pas mis de photo. C'est pour cette
 * raison qu'il n'y a pas de silhouette grise ici.
 */
export default function Avatar({
    user,
    taille = 40,
    bordure,
    couleurTexte = "var(--text-primary)",
    fond = "var(--bg-territoires)",
    className = "",
}) {
    const commun = {
        width: taille,
        height: taille,
        border: bordure ? `1px solid ${bordure}` : undefined,
    };

    // Le corps de la lettre suit le cercle : à 28 px un monogramme de 11 px
    // déborde, à 96 px il flotte au milieu du vide.
    const corps = Math.max(9, Math.round(taille * 0.34));

    if (user?.photoUrl) {
        return (
            <span
                className={`shrink-0 rounded-full overflow-hidden block ${className}`}
                style={{ ...commun, backgroundColor: fond }}
            >
                <img
                    src={imageCloudinary(user.photoUrl, 240)}
                    alt=""
                    width={taille}
                    height={taille}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                />
            </span>
        );
    }

    return (
        <span
            className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center ${className}`}
            style={{ ...commun, backgroundColor: fond }}
        >
            <span
                className="font-body-strong"
                style={{ color: couleurTexte, fontSize: corps, letterSpacing: "0.04em" }}
            >
                {initiales(user)}
            </span>
        </span>
    );
}
