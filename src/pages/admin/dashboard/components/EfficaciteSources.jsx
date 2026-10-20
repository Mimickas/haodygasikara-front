import Squelette from "./Squelette";
import { pourcent } from "./outils";

// ── Par source : association, étiquettes, proximité, préférences, agence ──

export default function EfficaciteSources({ efficacite, chargement }) {
    const sources = efficacite?.parSource ?? [];
    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Créateur de circuit</p>
                    <h2 className="ad-tb-titre font-title">Les suggestions servent-elles ?</h2>
                </div>
            </header>
            {chargement ? <Squelette lignes={4} /> : sources.length === 0 ? (
                <p className="ad-tb-vide font-body">
                    Aucune suggestion n'a encore été montrée. Les chiffres apparaîtront dès que des voyageurs composeront un circuit.
                </p>
            ) : (
                <>
                    <p className="ad-tb-aide font-body">
                        Part des suggestions montrées que le voyageur a ajoutées à son circuit, selon ce qui les a fait proposer.
                    </p>
                    <ul className="ad-tb-barres">
                        {sources.map((s) => (
                            <li key={s.cle} className="ad-tb-barre">
                                <div className="ad-tb-barre__ligne">
                                    <span className="font-body-strong">{s.libelle}</span>
                                    <span className="ad-tb-barre__chiffre font-body-strong">{pourcent(s.taux)}</span>
                                </div>
                                <div className="ad-tb-barre__piste" aria-hidden="true">
                                    <span className="ad-tb-barre__jauge" style={{ width: `${Math.max(s.taux ?? 0, 1)}%` }} />
                                </div>
                                <span className="ad-tb-muet font-body">{s.ajouts} ajout{s.ajouts > 1 ? "s" : ""} · {s.vues} vue{s.vues > 1 ? "s" : ""}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}
