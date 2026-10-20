import { useState } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateCourte } from "../../../../utils/format";
import Squelette from "./Squelette";
import { pluriel } from "./outils";
import Bascule from "./graphe/Bascule";
import InfoBulle from "./graphe/InfoBulle";
import NomCategorie from "./graphe/NomCategorie";
import { ACCENT, ENCRE, EPAISSEUR, FILET, GRIS, LARGEUR_NOMS, MARGES, SURVOL, hauteurGraphe } from "./graphe/apparence";

// ── Les destinations les plus choisies ────────────────────────────────────
//
// Des quantités à comparer entre des catégories sans ordre → barres
// horizontales (les noms sont longs), triées, une seule couleur : la première
// se détache, le reste est en gris. Pas de camembert : un voyage compte
// plusieurs destinations, les parts ne forment pas un tout.
//
// Le chiffre est écrit au bout de chaque barre : la figure part aussi en image
// dans le mémoire, et une image ne se survole pas.

export default function DestinationsChoisies({ choix, chargement }) {
    const [tableau, setTableau] = useState(false);
    const lignes = choix?.destinations ?? [];
    // Trié par le serveur : la première est en tête — et les ex aequo avec elle
    const max = lignes[0]?.circuits ?? 0;

    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Créateur de circuit</p>
                    <h2 className="ad-tb-titre font-title">Les destinations les plus choisies</h2>
                </div>
                {lignes.length > 0 && <Bascule tableau={tableau} onBascule={setTableau} />}
            </header>
            {chargement ? <Squelette lignes={5} /> : lignes.length === 0 ? (
                <p className="ad-tb-vide font-body">
                    Aucun voyage composé pour l'instant. Le classement apparaîtra dès qu'un voyageur enregistrera un circuit.
                </p>
            ) : (
                <>
                    <p className="ad-tb-aide font-body">
                        Nombre de voyages où figure chaque destination, sur les {pluriel(choix.voyages, "voyage")} composé{choix.voyages > 1 ? "s" : ""} par {pluriel(choix.voyageurs, "voyageur")}
                        {choix.destinationsChoisies > lignes.length ? ` : les ${lignes.length} premières des ${choix.destinationsChoisies} destinations choisies.` : "."}
                    </p>
                    {tableau ? (
                        <table className="ad-tb-table font-body">
                            <thead>
                                <tr>
                                    <th>Destination</th>
                                    <th>Voyages</th>
                                    <th>Part des voyages</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lignes.map((l) => (
                                    <tr key={l.id}>
                                        <td className="font-body-strong">{l.nom}</td>
                                        <td>{l.circuits}</td>
                                        <td>{l.part} %</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <figure className="ad-tb-graphe" aria-label={`${lignes[0].nom} en tête, dans ${pluriel(max, "voyage")} sur ${choix.voyages}.`}>
                            <ResponsiveContainer width="100%" height={hauteurGraphe(lignes.length)}>
                                <BarChart data={lignes} layout="vertical" barSize={EPAISSEUR} margin={MARGES}>
                                    <XAxis type="number" hide allowDecimals={false} domain={[0, "dataMax"]} />
                                    <YAxis type="category" dataKey="nom" width={LARGEUR_NOMS} interval={0}
                                        tickLine={false} axisLine={{ stroke: FILET }} tick={<NomCategorie />} />
                                    <Tooltip cursor={SURVOL} isAnimationActive={false}
                                        content={(p) => <InfoBulle {...p} lignes={(d) => [
                                            [pluriel(d.circuits, "voyage"), `sur ${choix.voyages}`],
                                            [`${d.part} %`, "des voyages composés"],
                                        ]} />} />
                                    <Bar dataKey="circuits" isAnimationActive={false}>
                                        {lignes.map((l) => <Cell key={l.id} fill={l.circuits === max ? ACCENT : GRIS} />)}
                                        <LabelList dataKey="circuits" position="right" offset={8} fill={ENCRE} fontSize={13} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </figure>
                    )}
                    <p className="ad-tb-date font-body">Données au {formatDateCourte(choix.calculeLe)}</p>
                </>
            )}
        </section>
    );
}
