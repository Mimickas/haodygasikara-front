import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { findMonCompteApi } from "../../../api/client/compteApi";
import { useAuth } from "../../../hooks/useAuth";
import { useRevelation } from "../../../hooks/design/useRevelation";
import { useCompteHero } from "../../../hooks/design/animations/compte/useCompteHero";
import HeroCompte from "./components/HeroCompte";
import Reglage from "./components/Reglage";
import BlocIdentite from "./components/BlocIdentite";
import BlocEmail from "./components/BlocEmail";
import BlocMotDePasse from "./components/BlocMotDePasse";

// ── Vos paramètres — /mon-compte ──────────────────────────────────────────
//
// ── Ce qui a été refait, et pourquoi ────────────────────────────────────
// Première version : un portrait de 112 px, deux lignes de texte sur le fond
// clair, puis trois volets. Verdict du client : « c'est ergonomique, c'est de
// la merde […] regarde dans home un espace très très luxe et premium et riche
// moderne, là c'est direct un bas de gamme. » Le reproche est juste : un écran
// de compte composé comme un formulaire EST un formulaire.
//
// Ce qui fait la richesse de l'accueil tient à trois choses, et aucune n'était
// là : de la PHOTOGRAPHIE PLEIN CADRE, un titre en très grand corps, un filet
// d'un pixel en pied. La page ouvre donc maintenant sur un hero photographique
// qui porte le nom du voyageur en titre de une — exactement comme l'accueil
// ouvre sur « Composez votre Madagascar ».
//
// Et les réglages reprennent LE RYTHME ÉDITORIAL DE « VOTRE VOYAGE EN TROIS
// GESTES » : douze colonnes, le numéro en Abhaya clair sur deux colonnes, le
// titre sur quatre, le propos sur six, un filet d'un pixel entre chaque et un
// filet de fermeture. Rien d'inventé : c'est la grammaire de l'accueil, posée
// sur un autre contenu.
//
// Un seul volet ouvert à la fois : trois formulaires dépliés ensemble, c'est un
// écran d'administration, et surtout on ne sait plus lequel des trois boutons
// « Enregistrer » on vient d'utiliser.
export default function MonCompte() {
    const { isAuthenticated } = useAuth();

    const [compte, setCompte] = useState(null);
    const [etat, setEtat] = useState("chargement");   // chargement | pret | erreur
    const [ouvert, setOuvert] = useState(null);

    const charger = useCallback(async () => {
        if (!isAuthenticated) {
            setEtat("pret");
            return;
        }
        setEtat("chargement");
        try {
            const reponse = await findMonCompteApi();
            setCompte(reponse?.data ?? null);
            setEtat("pret");
        } catch (error) {
            console.error("Chargement du compte impossible", error);
            setEtat("erreur");
        }
    }, [isAuthenticated]);

    useEffect(() => { charger(); }, [charger]);

    const pret = etat === "pret" && Boolean(compte);

    // Le hero s'ouvre au chargement ; les réglages se révèlent au défilement.
    useCompteHero(pret);
    useRevelation(
        [
            { cible: ".cx-param .cx-tete > *", y: 34, stagger: 0.09 },
            { cible: ".cx-reglage", y: 34, stagger: 0.09, depart: "top 92%" },
            { cible: ".cx-param__vide", y: 28 },
        ],
        etat === "pret"
    );

    const basculer = (cle) => setOuvert((actuel) => (actuel === cle ? null : cle));

    // Le compte rendu par le serveur remplace le précédent : les blocs
    // n'inventent jamais l'état d'après, ils affichent celui que la réponse
    // leur donne.
    const majCompte = (frais) => setCompte(frais);

    // ── Le hero est monté DÈS QUE le compte est connecté ────────────────
    //
    // Et pas seulement quand ses données arrivent, contrairement à la première
    // version. La raison est mesurée : `useHeaderTextColor` recense les
    // sections porteuses de `data-header-text` au changement de route, une fois.
    // Le hero n'existant pas encore à cet instant, il n'était jamais observé —
    // et la barre restait encrée en SOMBRE au-dessus de la photographie sombre,
    // logo compris. Relevé dans le navigateur : « rgb(43, 33, 26) » là où il
    // fallait du clair.
    //
    // Le hero a une hauteur fixe, donc le monter vide ne provoque aucun saut :
    // la photographie s'affiche tout de suite, le texte apparaît dedans.
    return (
        <>
            {isAuthenticated && <HeroCompte compte={compte} onMaj={majCompte} />}

            <div className={`cx-detail${isAuthenticated ? "" : " cx-sous-entete"}`}>
                <section className="cx-param" data-header-text="var(--text-primary)">

                    <div className="cx-tete cx-tete--seule">
                        <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">
                            {isAuthenticated ? "Votre compte" : "Espace voyageur"}
                        </span>
                        <h1 className="cx-tete__titre font-title">
                            {isAuthenticated ? (
                                <>Ce que vous pouvez<br />changer ici.</>
                            ) : (
                                <>Vos param&egrave;tres</>
                            )}
                        </h1>
                        {isAuthenticated && (
                            <p className="cx-tete__chapo font-body">
                                Votre identit&eacute;, votre adresse de connexion et votre mot de
                                passe. Ce que vous modifiez ici vaut pour vos demandes de devis
                                comme pour nos messages.
                            </p>
                        )}
                    </div>

                    {!isAuthenticated ? (
                        <Vide
                            texte="Connectez-vous pour accéder aux paramètres de votre compte."
                            lien="/login"
                            action="Se connecter"
                        />
                    ) : etat === "chargement" ? (
                        <p className="cx-param__vide cx-label cx-label--legende font-body-strong">
                            Chargement&hellip;
                        </p>
                    ) : !pret ? (
                        <Vide
                            texte="Vos informations n'ont pas pu être chargées. Réessayez dans un instant."
                            lien="/circuit"
                            action="Voir les circuits"
                        />
                    ) : (
                    <ol className="cx-reglages">
                        <Reglage
                            numero="01"
                            titre="Votre identité"
                            propos="Le nom qui figure sur vos demandes de devis et le numéro auquel nous vous joignons."
                            valeur={[compte.prenom, compte.nom].filter(Boolean).join(" ")}
                            ouvert={ouvert === "identite"}
                            onBasculer={() => basculer("identite")}
                        >
                            <BlocIdentite compte={compte} onMaj={majCompte} />
                        </Reglage>

                        <Reglage
                            numero="02"
                            titre="Adresse e-mail"
                            propos="Celle qui vous connecte, et par laquelle passent toutes nos confirmations de voyage."
                            valeur={
                                compte.emailEnAttente
                                    ? `${compte.email} — changement en cours`
                                    : compte.email
                            }
                            ouvert={ouvert === "email"}
                            onBasculer={() => basculer("email")}
                        >
                            <BlocEmail compte={compte} onMaj={majCompte} />
                        </Reglage>

                        <Reglage
                            numero="03"
                            titre="Mot de passe"
                            propos="Il vous sera redemandé pour toute modification qui touche l'accès au compte."
                            valeur="Modifiable depuis cet écran"
                            ouvert={ouvert === "motdepasse"}
                            onBasculer={() => basculer("motdepasse")}
                        >
                            <BlocMotDePasse />
                        </Reglage>

                        {/* Le filet de fermeture, comme sous « trois gestes » de
                            l'accueil : sans lui la liste s'arrête dans le vide. */}
                        <li aria-hidden style={{ borderTop: "1px solid var(--border)" }} />
                    </ol>
                    )}

                    <p className="cx-param__pied font-body">
                        Une question sur votre compte&nbsp;?{" "}
                        <a href="mailto:contact@haodygasikara.com" className="cx-param__accent">
                            contact@haodygasikara.com
                        </a>
                    </p>

                </section>
            </div>
        </>
    );
}

function Vide({ texte, lien, action }) {
    return (
        <div className="cx-param__vide">
            <p className="cx-param__vide-texte font-body">{texte}</p>
            <Link
                to={lien}
                className="cx-devis__bouton font-body-strong"
                style={{ marginTop: "clamp(22px,2.4vw,30px)" }}
            >
                {action}
            </Link>
        </div>
    );
}
