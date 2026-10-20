import { useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateCourte } from "../../../../utils/format";
import Squelette from "./Squelette";
import { pluriel } from "./outils";
import Bascule from "./graphe/Bascule";
import ChiffreDansSegment from "./graphe/ChiffreDansSegment";
import InfoBulle from "./graphe/InfoBulle";
import NomCategorie from "./graphe/NomCategorie";
import { ACCENT, ENCRE, EPAISSEUR, FILET, LAGUNE_CLAIR, LARGEUR_NOMS, MARGES, SURFACE, SURVOL, hauteurGraphe } from "./graphe/apparence";

// ── Les circuits les plus demandés ────────────────────────────────────────
//
// Les devis acceptés font PARTIE des demandes → une barre empilée, les
// acceptés contre l'axe (seul le segment posé sur l'axe se compare d'une barre
// à l'autre), deux tons du même bleu : c'est la même chose à deux étapes, pas
// deux catégories. Une demande passée sur une copie personnalisée compte pour
// le circuit d'origine (Circuit.modele, côté serveur).

export default function CircuitsDemandes({ choix, chargement }) {
    const [tableau, setTableau] = useState(false);
    const lignes = (choix?.circuits ?? []).map((c) => ({ ...c, autres: c.demandes - c.acceptees }));

    return (
        <section className="ad-tb-bloc">
            <header className="ad-tb-entete">
                <div>
                    <p className="ad-dv-surtitre font-body-strong">Circuits de l'agence</p>
                    <h2 className="ad-tb-titre font-title">Les circuits les plus demandés</h2>
                </div>
                {lignes.length > 0 && <Bascule tableau={tableau} onBascule={setTableau} />}
            </header>
            {chargement ? <Squelette lignes={5} /> : lignes.length === 0 ? (
                <p className="ad-tb-vide font-body">
                    Aucune demande de devis sur un circuit de l'agence pour l'instant.
                </p>
            ) : (
                <>
                    <p className="ad-tb-aide font-body">
                        Demandes de devis nées de chaque circuit, directement ou par une copie personnalisée
                        : {choix.demandesAgence} des {pluriel(choix.demandes, "demande")} reçue{choix.demandes > 1 ? "s" : ""}.
                        Le chiffre au bout de la barre est le total du circuit.
                    </p>
                    <ul className="ad-tb-legende font-body">
                        <li><span className="ad-tb-legende__cle" style={{ backgroundColor: ACCENT }} />Devis acceptés</li>
                        <li><span className="ad-tb-legende__cle" style={{ backgroundColor: LAGUNE_CLAIR }} />Autres demandes</li>
                    </ul>
                    {tableau ? (
                        <table className="ad-tb-table font-body">
                            <thead>
                                <tr>
                                    <th>Circuit</th>
                                    <th>Demandes</th>
                                    <th>Acceptés</th>
                                    <th>Par une copie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lignes.map((l) => (
                                    <tr key={l.id}>
                                        <td className="font-body-strong">{l.nom}</td>
                                        <td>{l.demandes}</td>
                                        <td>{l.acceptees}</td>
                                        <td>{l.viaCopie}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <figure className="ad-tb-graphe" aria-label={`${lignes[0].nom} en tête, avec ${pluriel(lignes[0].demandes, "demande")} dont ${lignes[0].acceptees} acceptée${lignes[0].acceptees > 1 ? "s" : ""}.`}>
                            <ResponsiveContainer width="100%" height={hauteurGraphe(lignes.length)}>
                                <BarChart data={lignes} layout="vertical" barSize={EPAISSEUR} margin={MARGES}>
                                    <XAxis type="number" hide allowDecimals={false} domain={[0, "dataMax"]} />
                                    <YAxis type="category" dataKey="nom" width={LARGEUR_NOMS} interval={0}
                                        tickLine={false} axisLine={{ stroke: FILET }} tick={<NomCategorie />} />
                                    <Tooltip cursor={SURVOL} isAnimationActive={false}
                                        content={(p) => <InfoBulle {...p} lignes={(d) => [
                                            [pluriel(d.demandes, "demande"), "de devis"],
                                            [d.acceptees, d.acceptees > 1 ? "devis acceptés" : "devis accepté", ACCENT],
                                            [d.autres, d.autres > 1 ? "autres demandes" : "autre demande", LAGUNE_CLAIR],
                                            [d.viaCopie, "par une copie personnalisée"],
                                        ]} />} />
                                    {/* Le trait couleur carte autour des segments, c'est l'écart de 2 px entre eux */}
                                    <Bar dataKey="acceptees" stackId="demandes" fill={ACCENT} stroke={SURFACE} strokeWidth={2} isAnimationActive={false}>
                                        <LabelList dataKey="acceptees" content={<ChiffreDansSegment />} />
                                    </Bar>
                                    <Bar dataKey="autres" stackId="demandes" fill={LAGUNE_CLAIR} stroke={SURFACE} strokeWidth={2} isAnimationActive={false}>
                                        <LabelList dataKey="demandes" position="right" offset={8} fill={ENCRE} fontSize={13} />
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
