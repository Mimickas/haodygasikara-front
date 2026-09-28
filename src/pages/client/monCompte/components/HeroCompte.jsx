import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import {
    changerPhotoApi,
    retirerPhotoApi,
    televerserAvatarApi,
} from "../../../../api/client/compteApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import { useAuth } from "../../../../hooks/useAuth";
import Avatar from "../../../../components/client/compte/Avatar";
import Avis from "./Avis";

/** Au-delà, ce n'est plus une photo de profil — et Cloudinary refuserait. */
const POIDS_MAX_MO = 8;

/**
 * L'image de l'espace voyageur. La même que dans le panneau du compte, et ce
 * n'est pas un hasard : on entre chez soi, on doit reconnaître l'endroit.
 */
const IMAGE =
    "/img/home/ctaSection/tropical-beach-landscape-with-deckchair-parasol-from-nosy-be-madagascar-vintage-light-filter-1920.webp";

/**
 * Le hero de la page de paramètres.
 *
 * ── Pourquoi un hero, et pas un bandeau ─────────────────────────────────
 * Première version : un portrait de 112 px et deux lignes de texte sur le fond
 * clair du site, puis la liste des réglages. Verdict du client, et il avait
 * raison : « c'est ergonomique, c'est de la merde […] là c'est direct un bas de
 * gamme ». Un écran de compte construit comme un formulaire EST un formulaire,
 * même bien composé.
 *
 * Ce qui fait la richesse de l'accueil — et de la fiche circuit, et de la liste
 * — c'est toujours la même chose : de la PHOTOGRAPHIE PLEIN CADRE, un titre en
 * très grand corps, un filet d'un pixel en pied. Aucune de ces trois choses
 * n'était là. Elles y sont maintenant, dans le vocabulaire exact de l'accueil :
 *
 *   • la photo à 0.75 d'opacité sur du noir, voile en dégradé vers le haut
 *   • l'accroche en petites capitales ocre à 0,45em
 *   • le nom du voyageur en `text-8xl`, ligne par ligne sous son masque
 *   • la barre filetée de pied qui porte le portrait, l'adresse et les gestes
 *
 * Le nom du voyageur EST le titre de une. C'est déjà le choix fait dans le
 * panneau de l'espace voyageur ; le reprendre ici enchaîne les deux écrans.
 *
 * ── Pourquoi la photo de profil se change ICI ───────────────────────────
 * Parce qu'on la regarde ici. Un volet « photo de profil » à déplier pour y
 * trouver un bouton « parcourir » ajoute deux gestes pour la même chose. Le
 * portrait est le déclencheur, le voile n'apparaît qu'au survol : une icône
 * posée en permanence sur un visage, c'est un badge, pas une commande.
 *
 * ── Le chemin du fichier ────────────────────────────────────────────────
 * Il va du navigateur DIRECTEMENT à Cloudinary, avec une signature à durée
 * limitée délivrée par notre serveur — qui n'a donc ni à le recevoir, ni à le
 * stocker, ni à le relayer. Le serveur ne retient que l'adresse, et il la
 * vérifie : une URL libre dans ce champ serait un pixel espion servi depuis nos
 * pages à chaque affichage.
 */
export default function HeroCompte({ compte, onMaj }) {
    const { majUser } = useAuth();
    const fichierRef = useRef(null);

    const [envoi, setEnvoi] = useState(false);
    const [avis, setAvis] = useState(null);

    const membreDepuis = compte?.membreDepuis
        ? new Date(compte.membreDepuis).toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
        })
        : null;

    const choisir = () => fichierRef.current?.click();

    const deposer = async (e) => {
        const fichier = e.target.files?.[0];
        // Le champ est remis à zéro tout de suite : sans ça, rechoisir le même
        // fichier après un échec ne déclenche aucun événement.
        e.target.value = "";
        if (!fichier) return;

        if (!fichier.type.startsWith("image/")) {
            setAvis({ ton: "erreur", texte: "Choisissez une image." });
            return;
        }
        if (fichier.size > POIDS_MAX_MO * 1024 * 1024) {
            setAvis({ ton: "erreur", texte: `L'image dépasse ${POIDS_MAX_MO} Mo.` });
            return;
        }

        setEnvoi(true);
        setAvis(null);
        try {
            const url = await televerserAvatarApi(fichier);
            const reponse = await changerPhotoApi(url);
            onMaj(reponse.data);
            majUser({ photoUrl: reponse.data.photoUrl });
            setAvis({ ton: "succes", texte: "Votre photo est à jour." });
        } catch (error) {
            setAvis({
                ton: "erreur",
                texte: error.response
                    ? apiErrorMessage(error, "Enregistrement impossible.")
                    : error.message || "Téléversement impossible.",
            });
        } finally {
            setEnvoi(false);
        }
    };

    const retirer = async () => {
        setEnvoi(true);
        setAvis(null);
        try {
            const reponse = await retirerPhotoApi();
            onMaj(reponse.data);
            majUser({ photoUrl: null });
            setAvis({ ton: "succes", texte: "Photo retirée. Vos initiales reprennent la place." });
        } catch (error) {
            setAvis({ ton: "erreur", texte: apiErrorMessage(error, "Suppression impossible.") });
        } finally {
            setEnvoi(false);
        }
    };

    return (
        <section className="cx-param-hero" data-header-text="var(--text-inverse)">
            <div className="relative w-full h-full overflow-hidden bg-black">
                <img
                    data-compte-media
                    src={IMAGE}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.75 }}
                />

                {/* Deux voiles, pas un. Celui du bas porte le nom ; celui du
                    haut existe parce que l'accroche ocre se perdait dans le
                    ciel de la photographie. */}
                {/* Le voile du bas monte HAUT — jusqu'aux deux tiers — et c'est
                    une correction, pas une preference. Premiere version : il
                    s'arrêtait à 46 %, et l'accroche ocre comme les légendes
                    « Connecté avec » tombaient sur le ciel de la photographie.
                    Elles y étaient illisibles. Le hero d'accueil ne rencontre
                    pas le problème parce que sa photographie est sombre en
                    bas ; celle-ci est une plage en plein jour. */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(16,14,11,0.94) 0%, rgba(16,14,11,0.86) 26%, rgba(16,14,11,0.68) 48%, rgba(16,14,11,0.36) 70%, rgba(16,14,11,0.06) 90%, rgba(16,14,11,0) 100%)",
                    }}
                />
                <div
                    className="absolute inset-x-0 top-0"
                    style={{
                        height: "34%",
                        background:
                            "linear-gradient(to bottom, rgba(16,14,11,0.55) 0%, rgba(16,14,11,0.16) 55%, rgba(16,14,11,0) 100%)",
                    }}
                />

                {/* Le contenu attend ses données ; la photographie, non. Le
                    hero a une hauteur fixe, donc rien ne saute quand le texte
                    arrive — et la barre d'en-tête a déjà trouvé sa couleur
                    claire sur cette section dès le premier rendu. */}
                {!compte ? null : (
                <div className="cx-param-hero__contenu">
                    <span data-compte-kicker className="cx-param-hero__accroche font-body-strong">
                        Espace voyageur
                    </span>

                    {/* Le nom du voyageur en titre de une, ligne par ligne sous
                        son masque. Le double span est indispensable : c'est le
                        parent en overflow hidden qui découpe, l'enfant qui se
                        déplace. */}
                    <h1 className="cx-param-hero__nom font-title">
                        <span className="block overflow-hidden">
                            <span data-compte-ligne className="block pb-[0.06em]">{compte.prenom}</span>
                        </span>
                        <span className="block overflow-hidden">
                            <span data-compte-ligne className="block pb-[0.06em]">{compte.nom}</span>
                        </span>
                    </h1>

                    <div
                        data-compte-filet
                        className="cx-param-hero__filet"
                        style={{ borderTop: "1px solid rgba(245,240,230,0.22)" }}
                    />

                    <div className="cx-param-hero__pied">
                        {/* ── Le portrait, et les deux gestes ───────────── */}
                        <div data-compte-pied className="cx-param-hero__portrait">
                            <button
                                type="button"
                                onClick={choisir}
                                disabled={envoi}
                                className="cx-param__declencheur"
                                aria-label={compte.photoUrl ? "Changer votre photo" : "Ajouter une photo"}
                            >
                                <Avatar
                                    user={compte}
                                    taille={96}
                                    bordure="rgba(245,240,230,0.4)"
                                    fond="rgba(16,14,11,0.35)"
                                    couleurTexte="var(--text-inverse)"
                                />
                                <span aria-hidden className="cx-param__voile">
                                    <Camera size={20} strokeWidth={1.5} />
                                </span>
                            </button>

                            <input
                                ref={fichierRef}
                                type="file"
                                accept="image/*"
                                onChange={deposer}
                                hidden
                            />

                            <div className="cx-param-hero__gestes">
                                <button
                                    type="button"
                                    onClick={choisir}
                                    disabled={envoi}
                                    className="cx-param-hero__lien font-body-strong"
                                >
                                    {envoi
                                        ? "Envoi…"
                                        : compte.photoUrl
                                            ? "Changer la photo"
                                            : "Ajouter une photo"}
                                </button>
                                {compte.photoUrl && (
                                    <button
                                        type="button"
                                        onClick={retirer}
                                        disabled={envoi}
                                        className="cx-param-hero__lien cx-param-hero__lien--discret font-body-strong"
                                    >
                                        Retirer
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ── Les repères, à droite comme la méta de l'accueil ── */}
                        <dl data-compte-pied className="cx-param-hero__reperes">
                            <div>
                                <dt className="cx-param-hero__legende font-body-strong">Connecté avec</dt>
                                <dd className="cx-param-hero__valeur font-body">{compte.email}</dd>
                            </div>
                            {membreDepuis && (
                                <div>
                                    <dt className="cx-param-hero__legende font-body-strong">Membre depuis</dt>
                                    <dd className="cx-param-hero__valeur font-body">{membreDepuis}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {compte.emailEnAttente && (
                        // Une procédure commencée doit se voir au premier coup
                        // d'œil : sinon le voyageur repart persuadé que son
                        // changement d'adresse est passé.
                        <p data-compte-pied className="cx-param-hero__attente font-body-strong">
                            Changement vers {compte.emailEnAttente} — code à confirmer
                        </p>
                    )}

                    {avis && (
                        <div className="cx-param-hero__avis">
                            <Avis ton={avis.ton}>{avis.texte}</Avis>
                        </div>
                    )}
                </div>
                )}
            </div>
        </section>
    );
}
