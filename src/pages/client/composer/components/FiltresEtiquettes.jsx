import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

// Les filtres par étiquette, UN MENU PAR GROUPE — Thématique, Saison, Confort…
//
// Les étiquettes s'écrivaient toutes à plat, séparées par un filet vertical :
// avec quatre groupes de six étiquettes, la barre d'outils devenait un mur de
// vingt-quatre mots en capitales où plus rien ne se lisait, et le nom du groupe
// ne s'affichait qu'au survol — donc jamais au doigt. Chaque groupe est
// maintenant un menu qui porte son nom, et ne s'ouvre que si on le demande.
//
// Le petit chiffre en exposant du déclencheur est le nombre d'étiquettes
// CHOISIES dans ce groupe ; celui d'une ligne est le nombre de destinations
// qu'elle donnerait, calculé par le serveur avec les autres filtres déjà posés
// (une étiquette à zéro n'est pas renvoyée). Le tri par pertinence, lui, ne
// bouge pas : il vit à côté, dans TriCatalogue.
//
// Un seul menu ouvert à la fois : deux listes superposées se marchent dessus.

export default function FiltresEtiquettes({ facettes, actifs, onBasculer, onEffacer }) {
    // Le groupe ouvert, par son nom. Null : tous fermés.
    const [ouvert, setOuvert] = useState(null);
    const racine = useRef(null);

    useEffect(() => {
        if (!ouvert) return undefined;
        const dehors = (e) => { if (!racine.current?.contains(e.target)) setOuvert(null); };
        const echap = (e) => { if (e.key === "Escape") setOuvert(null); };
        document.addEventListener("pointerdown", dehors);
        document.addEventListener("keydown", echap);
        return () => {
            document.removeEventListener("pointerdown", dehors);
            document.removeEventListener("keydown", echap);
        };
    }, [ouvert]);

    if (!facettes.length) return <div className="cx-cp-filtres" />;

    return (
        <div className="cx-cp-filtres" ref={racine} role="group" aria-label="Filtrer par étiquette">
            {facettes.map((f) => {
                const choisies = f.tags.filter((t) => t.actif).length;
                const deplie = ouvert === f.groupe;

                return (
                    <div key={f.groupe} className={`cx-cp-groupe${choisies ? " cx-cp-groupe--actif" : ""}`}>
                        <button
                            type="button"
                            className="cx-cp-groupe__declencheur"
                            aria-expanded={deplie}
                            aria-label={choisies
                                ? `${f.groupe} : ${choisies} étiquette${choisies > 1 ? "s" : ""} choisie${choisies > 1 ? "s" : ""}`
                                : `${f.groupe} : filtrer`}
                            onClick={() => setOuvert(deplie ? null : f.groupe)}
                        >
                            {f.groupe}
                            {choisies > 0 && <sup className="cx-cp-groupe__compte">{choisies}</sup>}
                            <FaChevronDown size={8} className={`cx-cp-groupe__chevron${deplie ? " cx-cp-groupe__chevron--ouvert" : ""}`} />
                        </button>

                        {deplie && (
                            <ul className="cx-cp-groupe__liste" aria-label={f.groupe}>
                                {f.tags.map((t) => (
                                    <li key={t.id}>
                                        {/* Une étiquette se coche et se décoche : le menu reste
                                            ouvert, on en choisit souvent deux ou trois d'affilée. */}
                                        <button
                                            type="button"
                                            className={`cx-cp-groupe__option${t.actif ? " cx-cp-groupe__option--actif" : ""}`}
                                            aria-pressed={t.actif}
                                            onClick={() => onBasculer(t.id)}
                                        >
                                            <span className="cx-cp-groupe__marque" aria-hidden="true" />
                                            <span className="cx-cp-groupe__nom">{t.nom}</span>
                                            <span className="cx-cp-groupe__nombre">{t.compte}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}

            {actifs.length > 0 && (
                <button type="button" className="cx-cp-filtres__effacer"
                    onClick={() => { setOuvert(null); onEffacer(); }}
                    aria-label="Effacer les filtres">
                    Effacer
                </button>
            )}
        </div>
    );
}
