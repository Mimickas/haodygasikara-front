import { Link } from "react-router-dom";
import BoutonPersonnaliser from "./BoutonPersonnaliser";
import { imageCloudinary } from "../../../../../utils/image";
import { useDemandeVivante } from "../../../../../hooks/client/devis/useDemandeVivante";
import { actionDemandeVivante, libelleStatutDevis } from "../../../../../constants/client/devis";
import FicheTechnique from "./FicheTechnique";
import Decompte from "./Decompte";
import Depliant from "./Depliant";
import ListeInclusions from "./ListeInclusions";

// ── Ce que comprend le circuit ────────────────────────────────────────────
// La section répond à « est-ce que ce voyage est pour moi ? », et elle se pose
// donc AVANT l'itinéraire : on ne demande pas à quelqu'un de lire quinze jours
// de programme pour découvrir ensuite qu'il y a un âge minimum.
//
// ── Pourquoi elle est bâtie comme ça ─────────────────────────────────────
// Première version : titre, puis six mentions étalées sur toute la largeur,
// puis quatre chiffres, puis deux listes à plat. Tout y était, et pourtant il
// manquait quelque chose. Trois raisons, lues sur la page de référence du
// client (911rennsport.co.uk, une fiche véhicule) :
//
//   1. AUCUNE PHOTOGRAPHIE. Entre le héro et l'itinéraire, la page enchaînait
//      deux sections entièrement typographiques sur ivoire — un tunnel de
//      texte. Chez Rennsport la photographie arrive AVANT la moindre
//      caractéristique : on montre l'objet, puis on le décrit. D'où la planche
//      en tête de section.
//
//   2. AUCUN APPEL À L'ACTION. La section se terminait dans le vide, sans rien
//      à faire. La fiche véhicule se ferme sur un bloc plein « Enquire » — et
//      c'est lui qui rassure, parce qu'il dit que la suite existe.
//
//   3. TROP D'AIR DANS LA FICHE. Six mentions sur 1500 px ne font pas une
//      fiche technique, elles font une liste espacée. Les caractéristiques se
//      lisent en bloc, sur deux colonnes serrées : c'est leur densité qui les
//      rend crédibles.
//
// D'où la mise en page : titre → planche → deux moitiés, la fiche et l'appel à
// gauche, les volets à droite.
//
// RIEN N'EST INVENTÉ ICI. Chaque bloc se retire tout seul s'il n'a rien à
// dire, et la section entière disparaît si tout est vide. Un champ que
// l'administration n'a pas rempli ne devient jamais une phrase.
export default function CircuitRecap({
    recap, fiche, tags = [], visuels = [], duree, circuitId, modele = false,
}) {
    const demande = useDemandeVivante(circuitId);
    const compris = recap?.compris ?? [];
    const nonCompris = recap?.nonCompris ?? [];

    const aFiche = Boolean(
        duree > 0 || (fiche && (fiche.style || fiche.niveau || fiche.ages || fiche.groupe
            || fiche.langues?.length || fiche.transports?.length))
    );
    const aDecompte = Boolean(
        recap && (recap.nuitees || recap.visitesIncluses || recap.visitesEnOption
            || recap.petitsDejeuners || recap.dejeuners || recap.diners)
    );

    if (!aFiche && !aDecompte && !compris.length && !nonCompris.length && !tags.length) {
        return null;
    }

    const promesse = fiche?.promesse;
    const planche = visuels.slice(0, 2);

    return (
        <section className="cx-voyage" data-header-text="var(--text-primary)">
            <div className={`cx-tete${promesse ? "" : " cx-tete--seule"}`}>
                <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">
                    Le voyage
                </span>

                <h2 className="cx-tete__titre font-title">
                    Ce que comprend le circuit
                </h2>

                {promesse && (
                    <p className="cx-tete__chapo font-body min-w-0">{promesse}</p>
                )}
            </div>

            {/* La planche. Les visuels viennent des étapes, jamais la
                couverture : elle occupe déjà tout le héro. */}
            {planche.length > 0 && (
                <div className={`cx-voyage__planche${planche.length === 1 ? " cx-voyage__planche--seule" : ""}`}>
                    {planche.map((media) => (
                        <figure key={media.cle ?? media.src} className="cx-voyage__cadre">
                            {media.type === "video" ? (
                                <video
                                    src={imageCloudinary(media.src, 900)}
                                    poster={media.poster ?? undefined}
                                    muted loop autoPlay playsInline preload="metadata"
                                />
                            ) : (
                                <img
                                    src={media.src}
                                    alt={media.titre ?? ""}
                                    loading="lazy"
                                    decoding="async"
                                />
                            )}
                        </figure>
                    ))}
                </div>
            )}

            <div className="cx-voyage__corps">

                <div className="min-w-0">
                    <FicheTechnique
                        fiche={fiche}
                        duree={duree}
                        nuitees={recap?.nuitees ?? 0}
                    />

                    {/* Le seul engagement du site : une demande de devis, chiffrée
                        à la main par un conseiller. */}
                    {/* Une demande vivante pour ce circuit : on ne propose pas d'en
                        envoyer une seconde, on mène à celle qui existe. */}
                    <div className="cx-devis">
                        <p className="cx-devis__mention font-body">
                            {demande
                                ? `Demande ${demande.reference} · ${libelleStatutDevis(demande.statutAffiche)}`
                                : <>Devis détaillé sous 48&nbsp;heures</>}
                        </p>
                        {demande ? (
                            <Link to="/mes-devis" className="cx-devis__bouton font-body-strong">
                                {actionDemandeVivante(demande.statutAffiche)}
                            </Link>
                        ) : (
                            <Link to={`/circuit/${circuitId}/devis`} className="cx-devis__bouton font-body-strong">
                                Demander un devis
                            </Link>
                        )}
                        {modele && <BoutonPersonnaliser circuitId={circuitId} />}
                    </div>
                </div>

                <div className="min-w-0">
                    {(aDecompte || compris.length > 0) && (
                        <Depliant
                            titre="Ce qui est compris"
                            compte={compris.length}
                            ouvertParDefaut
                        >
                            <Decompte recap={recap} />
                            {compris.length > 0 && aDecompte && <div className="h-7" />}
                            <ListeInclusions lignes={compris} />
                        </Depliant>
                    )}

                    {nonCompris.length > 0 && (
                        <Depliant titre="Ce qui n'est pas compris" compte={nonCompris.length}>
                            <ListeInclusions lignes={nonCompris} exclu />
                        </Depliant>
                    )}

                    {tags.length > 0 && (
                        <Depliant titre="Thèmes du voyage" compte={tags.length}>
                            <ul className="cx-themes">
                                {tags.map((tag, i) => (
                                    <li key={tag?.id ?? i}>
                                        <span className="cx-themes__item cx-label font-body-strong">
                                            {tag?.nom}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Depliant>
                    )}
                </div>

            </div>
        </section>
    );
}
