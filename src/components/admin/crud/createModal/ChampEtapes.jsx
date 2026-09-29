import { FaPlus, FaXmark, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import ChampRecherche from "../form/ChampRecherche";

// ── Les étapes du circuit ──────────────────────────────────────────────────
//
// Un lieu, un nombre de jours. C'est tout, et c'est le point : « Ampefy,
// 2 jours » se saisit d'un geste au lieu d'ouvrir deux journées identiques
// dans le programme.
//
// Cette saisie avait disparu quand le programme jour par jour est arrivé : les
// étapes s'en DÉDUISAIENT (les journées consécutives au même coucher forment
// un séjour), et leur durée ne se donnait donc plus. Elle revient ici, et la
// règle de partage est simple — quand cette liste est remplie, elle fait foi ;
// laissée vide, les étapes continuent de se déduire du programme.

const ETAPES_MAX = 30;
const JOURS_MAX = 60;

const etapeVide = () => ({ destinationId: "", durationDays: 1 });

export default function ChampEtapes({ value, onChange, destinations = [] }) {
    const etapes = Array.isArray(value) ? value : [];

    const maj = (suivantes) => onChange(suivantes);
    const majEtape = (i, patch) => maj(etapes.map((e, k) => (k === i ? { ...e, ...patch } : e)));

    const ajouter = () => { if (etapes.length < ETAPES_MAX) maj([...etapes, etapeVide()]); };
    const retirer = (i) => maj(etapes.filter((_, k) => k !== i));

    const deplacer = (i, vers) => {
        if (vers < 0 || vers >= etapes.length) return;
        const suivantes = [...etapes];
        const [e] = suivantes.splice(i, 1);
        suivantes.splice(vers, 0, e);
        maj(suivantes);
    };

    // Le report des jours : la troisième étape ne commence pas au jour 3, mais
    // après la durée des deux précédentes. C'est ce report qui rend l'ordre
    // lisible autrement que par le numéro.
    const jours = (i) => {
        let debut = 1;
        for (let k = 0; k < i; k += 1) debut += Math.max(1, Number(etapes[k]?.durationDays) || 1);
        const duree = Math.max(1, Number(etapes[i]?.durationDays) || 1);
        return duree === 1 ? `Jour ${debut}` : `Jours ${debut} → ${debut + duree - 1}`;
    };

    const total = etapes.reduce((s, e) => s + Math.max(1, Number(e?.durationDays) || 1), 0);

    return (
        <div className="ad-etapes">
            <div className="ad-prog__tete">
                <span className="ad-prog__compte font-body-strong">
                    {etapes.length === 0
                        ? "Aucune étape"
                        : `${etapes.length} étape${etapes.length > 1 ? "s" : ""} · ${total} jour${total > 1 ? "s" : ""}`}
                </span>
                <span className="ad-prog__aide font-body">
                    Un lieu, un nombre de jours. Renseignées ici, les étapes font foi ; laissées
                    vides, elles se déduisent du programme jour par jour.
                </span>
            </div>

            {etapes.length === 0 && (
                <p className="ad-prog__vide font-body">
                    Aucune étape saisie. Ajoutez la première, ou laissez le programme les déduire.
                </p>
            )}

            <ol className="ad-etapes__liste">
                {etapes.map((etape, i) => {
                    return (
                        <li key={i} className="ad-etape">
                            <span className="ad-prog__num font-body-strong tabular-nums">
                                {String(i + 1).padStart(2, "0")}
                            </span>

                            <div className="ad-etape__lieu">
                                <ChampRecherche
                                    id={`etape-${i}-lieu`}
                                    value={etape.destinationId}
                                    onChange={(v) => majEtape(i, { destinationId: v })}
                                    options={destinations}
                                    placeholder="Choisir un lieu"
                                    placeholderRecherche="Rechercher une destination…"
                                />
                            </div>

                            <div className="ad-etape__duree">
                                <input
                                    type="number"
                                    className="ad-champ font-body"
                                    min={1}
                                    max={JOURS_MAX}
                                    value={etape.durationDays ?? 1}
                                    onChange={(e) => majEtape(i, { durationDays: e.target.value })}
                                    aria-label={`Nombre de jours de l'étape ${i + 1}`}
                                />
                                <span className="ad-etape__unite font-body">jour{(Number(etape.durationDays) || 1) > 1 ? "s" : ""}</span>
                            </div>

                            <span className="ad-etape__report font-body tabular-nums">{jours(i)}</span>

                            <div className="ad-prog__gestes">
                                <button type="button" onClick={() => deplacer(i, i - 1)} disabled={i === 0}
                                    title="Monter cette étape" aria-label={`Monter l'étape ${i + 1}`} className="ad-prog__geste">
                                    <FaArrowUp className="text-[10px]" aria-hidden="true" />
                                </button>
                                <button type="button" onClick={() => deplacer(i, i + 1)} disabled={i === etapes.length - 1}
                                    title="Descendre cette étape" aria-label={`Descendre l'étape ${i + 1}`} className="ad-prog__geste">
                                    <FaArrowDown className="text-[10px]" aria-hidden="true" />
                                </button>
                                <button type="button" onClick={() => retirer(i)}
                                    title="Retirer cette étape" aria-label={`Retirer l'étape ${i + 1}`} className="ad-retirer">
                                    <FaXmark className="text-xs" aria-hidden="true" />
                                </button>
                            </div>

                        </li>
                    );
                })}
            </ol>

            {etapes.length < ETAPES_MAX && (
                <button type="button" className="ad-bouton ad-bouton--plein ad-prog__ajouter-jour font-body-strong"
                    onClick={ajouter}>
                    <FaPlus aria-hidden="true" /> Ajouter une étape
                </button>
            )}
        </div>
    );
}
