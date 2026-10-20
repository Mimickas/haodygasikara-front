import Squelette from "./Squelette";
import { pourcent } from "./outils";

// ── Par destination : ce qui convainc le plus ──────────────────────────────

export default function SuggestionsParDestination({ efficacite, chargement }) {
    const lignes = efficacite?.parDestination ?? [];
    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Par destination</p>
                    <h2 className="ad-tb-titre font-title">Les suggestions qui convainquent</h2>
                </div>
            </header>
            {chargement ? <Squelette lignes={5} /> : lignes.length === 0 ? (
                <p className="ad-tb-vide font-body">Pas encore de mesure par destination.</p>
            ) : (
                <table className="ad-tb-table font-body">
                    <thead>
                        <tr>
                            <th>Destination</th>
                            <th>Vues</th>
                            <th>Ajouts</th>
                            <th>Taux</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lignes.map((l) => (
                            <tr key={l.cle}>
                                <td className="font-body-strong">{l.libelle}</td>
                                <td>{l.vues}</td>
                                <td>{l.ajouts}</td>
                                <td className="ad-tb-table__taux font-body-strong">{pourcent(l.taux)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
