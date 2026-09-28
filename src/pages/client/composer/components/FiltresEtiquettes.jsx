import { Fragment } from "react";

// Les filtres par étiquette, écrits comme les durées de /circuit : des mots
// en capitales espacées, le choisi souligné. Le petit chiffre en exposant est
// le nombre de destinations que donnerait l'étiquette, calculé par le serveur
// avec les autres filtres déjà posés ; une étiquette à zéro n'est pas
// renvoyée. Un filet vertical sépare les groupes (Thématique, Saison…) — le
// nom du groupe s'affiche au survol.

export default function FiltresEtiquettes({ facettes, actifs, onBasculer, onEffacer }) {
    if (!facettes.length) return <div className="cx-cp-filtres" />;

    return (
        <div className="cx-cp-filtres" role="group" aria-label="Filtrer par étiquette">
            {facettes.map((f, i) => (
                <Fragment key={f.groupe}>
                    {i > 0 && <span className="cx-cp-filtres__sep" aria-hidden="true" />}
                    {f.tags.map((t) => (
                        <button key={t.id} type="button" title={f.groupe}
                            className={`cx-cp-filtre${t.actif ? " cx-cp-filtre--actif" : ""}`}
                            onClick={() => onBasculer(t.id)} aria-pressed={t.actif}>
                            {t.nom}<sup>{t.compte}</sup>
                        </button>
                    ))}
                </Fragment>
            ))}
            {actifs.length > 0 && (
                <button type="button" className="cx-cp-filtres__effacer" onClick={onEffacer} aria-label="Effacer les filtres">
                    Effacer
                </button>
            )}
        </div>
    );
}
