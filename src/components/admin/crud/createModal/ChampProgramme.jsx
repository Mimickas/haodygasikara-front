import { useMemo, useState } from "react";
import { FaPlus, FaXmark, FaChevronDown, FaArrowUp, FaArrowDown } from "react-icons/fa6";
import ChampRecherche from "../form/ChampRecherche";
import MultiSelectField from "./MultiSelectField";

// ── Le programme d'un circuit, jour par jour ───────────────────────────────
//
// C'est le seul endroit où le parcours se saisit. Avant, il fallait trois
// écrans : les étapes dans le formulaire du circuit, les journées dans
// « Jour par jour », les visites dans « Visites et activités » — et chacun
// redemandait de retrouver à la main le circuit, puis l'étape, puis le jour.
//
// Ici : une journée, ses lieux, ce qu'on y fait. Le reste se déduit côté
// serveur (ProgrammeService) — la durée du circuit, et ses séjours.
//
// Une journée traverse PLUSIEURS lieux, dans l'ordre : « Antananarivo →
// Ampefy → Chute de Lily ». Le dernier est celui où l'on dort, sauf si
// l'hébergement du soir en désigne un autre.

const JOURS_MAX = 60;
const LIEUX_MAX = 6;
const ALTERNATIVES_MAX = 8;

const jourVide = () => ({
    lieux: [{ destinationId: "", note: "" }],
    titre: "",
    description: "",
    notes: "",
    transport: "",
    hebergementId: "",
    alternativeIds: [],
    visites: [],
    petitDejeuner: false,
    dejeuner: false,
    diner: false,
});

export default function ChampProgramme({ value, onChange, destinations = [], pois = [], transports = [] }) {
    const jours = Array.isArray(value) ? value : [];
    // La journée ouverte : avec quinze jours, tout déplier rendrait l'écran
    // illisible. Une seule à la fois, et la dernière ajoutée s'ouvre d'office.
    const [ouvert, setOuvert] = useState(0);

    const nomDestination = useMemo(
        () => new Map(destinations.map((d) => [String(d.value), d.label])),
        [destinations]);
    const poisParDestination = useMemo(() => {
        const parId = new Map();
        pois.forEach((p) => {
            const cle = String(p.destinationId);
            if (!parId.has(cle)) parId.set(cle, []);
            parId.get(cle).push(p);
        });
        return parId;
    }, [pois]);

    const majJours = (suivants) => onChange(suivants);
    const majJour = (i, patch) => majJours(jours.map((j, k) => (k === i ? { ...j, ...patch } : j)));

    const ajouterJour = () => {
        if (jours.length >= JOURS_MAX) return;
        majJours([...jours, jourVide()]);
        setOuvert(jours.length);
    };

    const retirerJour = (i) => {
        majJours(jours.filter((_, k) => k !== i));
        setOuvert(null);
    };

    const deplacerJour = (i, vers) => {
        if (vers < 0 || vers >= jours.length) return;
        const suivants = [...jours];
        const [j] = suivants.splice(i, 1);
        suivants.splice(vers, 0, j);
        majJours(suivants);
        setOuvert(vers);
    };

    // Les POI accessibles une journée donnée : ceux des lieux qu'elle traverse.
    // Rien à voir avec une liste globale — on ne propose pas un hôtel de Nosy Be
    // le jour où l'on est à Isalo.
    const poisDuJour = (jour) => (jour.lieux ?? [])
        .filter((l) => l.destinationId)
        .flatMap((l) => poisParDestination.get(String(l.destinationId)) ?? []);

    const optionsHebergement = (jour) => poisDuJour(jour)
        .filter((p) => p.isHebergement)
        .map((p) => ({ value: p.id, label: p.nom, sousTitre: p.destinationNom }));

    const optionsVisite = (jour) => poisDuJour(jour)
        .map((p) => ({
            value: p.id,
            label: p.nom,
            sousTitre: [p.destinationNom, p.isHebergement ? "hébergement" : p.categorie].filter(Boolean).join(" · "),
        }));

    const trajet = (jour) => (jour.lieux ?? [])
        .map((l) => nomDestination.get(String(l.destinationId)))
        .filter(Boolean);

    return (
        <div className="ad-prog">
            <div className="ad-prog__tete">
                <span className="ad-prog__compte font-body-strong">
                    {jours.length === 0
                        ? "Aucune journée"
                        : `${jours.length} journée${jours.length > 1 ? "s" : ""}`}
                </span>
                <span className="ad-prog__aide font-body">
                    La durée du circuit est le nombre de journées. Les séjours — où l'on dort et
                    combien de nuits — s'en déduisent tout seuls.
                </span>
            </div>

            {jours.length === 0 && (
                <p className="ad-prog__vide font-body">
                    Le programme est vide. Ajoutez la première journée : ses lieux, ses repas, sa nuit.
                </p>
            )}

            <ol className="ad-prog__jours">
                {jours.map((jour, i) => {
                    const lieux = jour.lieux ?? [];
                    const route = trajet(jour);
                    const deplie = ouvert === i;
                    const hebergements = optionsHebergement(jour);
                    const visites = optionsVisite(jour);

                    return (
                        <li key={i} className={`ad-prog__jour${deplie ? " ad-prog__jour--ouvert" : ""}`}>

                            {/* L'en-tête dit tout ce qu'il faut pour s'y retrouver
                                sans déplier : le numéro, le trajet, la nuit. */}
                            <div className="ad-prog__entete">
                                <button type="button" className="ad-prog__bascule"
                                    onClick={() => setOuvert(deplie ? null : i)}
                                    aria-expanded={deplie}>
                                    <span className="ad-prog__num font-body-strong tabular-nums">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="ad-prog__resume">
                                        <span className="ad-prog__trajet font-body-strong">
                                            {route.length ? route.join(" → ") : "Journée sans lieu"}
                                        </span>
                                        {jour.titre && (
                                            <span className="ad-prog__titre-jour font-body">{jour.titre}</span>
                                        )}
                                    </span>
                                    <FaChevronDown className={`ad-prog__fleche${deplie ? " ad-prog__fleche--ouverte" : ""}`} aria-hidden="true" />
                                </button>

                                <div className="ad-prog__gestes">
                                    <button type="button" onClick={() => deplacerJour(i, i - 1)} disabled={i === 0}
                                        title="Monter cette journée" aria-label={`Monter le jour ${i + 1}`} className="ad-prog__geste">
                                        <FaArrowUp className="text-[10px]" aria-hidden="true" />
                                    </button>
                                    <button type="button" onClick={() => deplacerJour(i, i + 1)} disabled={i === jours.length - 1}
                                        title="Descendre cette journée" aria-label={`Descendre le jour ${i + 1}`} className="ad-prog__geste">
                                        <FaArrowDown className="text-[10px]" aria-hidden="true" />
                                    </button>
                                    <button type="button" onClick={() => retirerJour(i)}
                                        title="Retirer cette journée" aria-label={`Retirer le jour ${i + 1}`} className="ad-retirer">
                                        <FaXmark className="text-xs" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            {deplie && (
                                <div className="ad-prog__corps">

                                    {/* ── Les lieux traversés ──────────────── */}
                                    <fieldset className="ad-prog__bloc">
                                        <legend className="ad-modale__libelle font-body-strong">
                                            Lieux traversés, dans l'ordre
                                        </legend>
                                        {lieux.map((lieu, k) => (
                                            <div key={k} className="ad-prog__lieu">
                                                <span className="ad-prog__rang font-body-strong tabular-nums">{k + 1}</span>
                                                <div className="ad-prog__lieu-choix">
                                                    <ChampRecherche
                                                        id={`jour-${i}-lieu-${k}`}
                                                        value={lieu.destinationId}
                                                        onChange={(v) => majJour(i, {
                                                            lieux: lieux.map((l, m) => (m === k ? { ...l, destinationId: v } : l)),
                                                            // Changer un lieu peut retirer la destination
                                                            // de l'hébergement ou d'une visite : on les
                                                            // remet à zéro plutôt que de garder un choix
                                                            // qui n'a plus lieu d'être.
                                                            hebergementId: "",
                                                            alternativeIds: [],
                                                            visites: [],
                                                        })}
                                                        options={destinations.filter((o) =>
                                                            !lieux.some((l, m) => m !== k && String(l.destinationId) === String(o.value)))}
                                                        placeholder="Choisir un lieu"
                                                        placeholderRecherche="Rechercher une destination…"
                                                    />
                                                </div>
                                                <input type="text" className="ad-champ ad-prog__note font-body"
                                                    value={lieu.note ?? ""} maxLength={255}
                                                    onChange={(e) => majJour(i, {
                                                        lieux: lieux.map((l, m) => (m === k ? { ...l, note: e.target.value } : l)),
                                                    })}
                                                    placeholder="Précision (facultatif)"
                                                    aria-label={`Précision sur le lieu ${k + 1} du jour ${i + 1}`} />
                                                <button type="button" className="ad-retirer"
                                                    disabled={lieux.length === 1}
                                                    onClick={() => majJour(i, { lieux: lieux.filter((_, m) => m !== k) })}
                                                    title="Retirer ce lieu"
                                                    aria-label={`Retirer le lieu ${k + 1} du jour ${i + 1}`}>
                                                    <FaXmark className="text-xs" aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))}
                                        {lieux.length < LIEUX_MAX && (
                                            <button type="button" className="ad-bouton ad-prog__ajouter font-body-strong"
                                                onClick={() => majJour(i, { lieux: [...lieux, { destinationId: "", note: "" }] })}>
                                                <FaPlus aria-hidden="true" /> Ajouter un lieu
                                            </button>
                                        )}
                                    </fieldset>

                                    {/* ── Ce qu'on en dit ─────────────────── */}
                                    <div className="ad-modale__rangee">
                                        <div className="ad-modale__champ">
                                            <label htmlFor={`jour-${i}-titre`} className="ad-modale__libelle font-body-strong">
                                                Titre de la journée
                                            </label>
                                            <input id={`jour-${i}-titre`} type="text" className="ad-champ font-body"
                                                value={jour.titre ?? ""} maxLength={255}
                                                onChange={(e) => majJour(i, { titre: e.target.value })}
                                                placeholder={route.length > 1 ? route.join(" → ") : "Ex : Canyons et piscines naturelles"} />
                                        </div>
                                        <div className="ad-modale__champ">
                                            <label htmlFor={`jour-${i}-transport`} className="ad-modale__libelle font-body-strong">
                                                Déplacement
                                            </label>
                                            <select id={`jour-${i}-transport`} className="ad-champ font-body"
                                                value={jour.transport ?? ""}
                                                onChange={(e) => majJour(i, { transport: e.target.value })}>
                                                <option value="">Non précisé</option>
                                                {transports.map((t) => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="ad-modale__champ">
                                        <label htmlFor={`jour-${i}-deroule`} className="ad-modale__libelle font-body-strong">
                                            Déroulé
                                        </label>
                                        <textarea id={`jour-${i}-deroule`} rows={3} className="ad-champ font-body resize-none"
                                            value={jour.description ?? ""}
                                            onChange={(e) => majJour(i, { description: e.target.value })}
                                            placeholder="Racontez la journée au voyageur…" />
                                    </div>

                                    {/* ── Les repas ───────────────────────── */}
                                    <fieldset className="ad-prog__bloc">
                                        <legend className="ad-modale__libelle font-body-strong">Repas compris</legend>
                                        <div className="ad-prog__repas">
                                            {[
                                                ["petitDejeuner", "Petit-déjeuner"],
                                                ["dejeuner", "Déjeuner"],
                                                ["diner", "Dîner"],
                                            ].map(([cle, libelle]) => (
                                                <label key={cle} className="ad-prog__coche font-body">
                                                    <input type="checkbox" checked={Boolean(jour[cle])}
                                                        onChange={(e) => majJour(i, { [cle]: e.target.checked })} />
                                                    {libelle}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    {/* ── La nuit ─────────────────────────── */}
                                    <div className="ad-modale__champ">
                                        <label htmlFor={`jour-${i}-nuit`} className="ad-modale__libelle font-body-strong">
                                            Hébergement du soir
                                        </label>
                                        <ChampRecherche
                                            id={`jour-${i}-nuit`}
                                            value={jour.hebergementId}
                                            onChange={(v) => majJour(i, { hebergementId: v, alternativeIds: [] })}
                                            options={hebergements}
                                            placeholder={hebergements.length
                                                ? "Aucun (pas de nuit ce jour-là)"
                                                : "Aucun hébergement dans les lieux de cette journée"}
                                            placeholderRecherche="Rechercher un hébergement…"
                                            desactive={hebergements.length === 0}
                                        />
                                        <p className="ad-champ__aide font-body">
                                            Parmi les hébergements des lieux traversés. C'est lui qui dit où l'on dort — et donc
                                            où commence et finit un séjour.
                                        </p>
                                    </div>

                                    {jour.hebergementId && hebergements.length > 1 && (
                                        <div className="ad-modale__champ">
                                            <span className="ad-modale__libelle font-body-strong">
                                                Autres hébergements au choix
                                            </span>
                                            <MultiSelectField
                                                value={jour.alternativeIds ?? []}
                                                onChange={(v) => majJour(i, { alternativeIds: v.slice(0, ALTERNATIVES_MAX) })}
                                                options={hebergements.filter((h) => String(h.value) !== String(jour.hebergementId))}
                                            />
                                            <p className="ad-champ__aide font-body">
                                                {ALTERNATIVES_MAX} au plus. Le voyageur choisit parmi eux en demandant son devis.
                                            </p>
                                        </div>
                                    )}

                                    {/* ── Les visites et activités ────────── */}
                                    <fieldset className="ad-prog__bloc">
                                        <legend className="ad-modale__libelle font-body-strong">Visites et activités</legend>
                                        {(jour.visites ?? []).map((v, k) => (
                                            <div key={k} className="ad-prog__visite">
                                                <div className="ad-prog__lieu-choix">
                                                    <ChampRecherche
                                                        id={`jour-${i}-visite-${k}`}
                                                        value={v.poiId}
                                                        onChange={(val) => majJour(i, {
                                                            visites: jour.visites.map((x, m) => (m === k ? { ...x, poiId: val } : x)),
                                                        })}
                                                        options={visites.filter((o) =>
                                                            !(jour.visites ?? []).some((x, m) => m !== k && String(x.poiId) === String(o.value)))}
                                                        placeholder="Choisir une visite"
                                                        placeholderRecherche="Rechercher un point d'intérêt…"
                                                    />
                                                </div>
                                                <select className="ad-champ ad-prog__inclus font-body"
                                                    value={v.inclus === false ? "false" : "true"}
                                                    onChange={(e) => majJour(i, {
                                                        visites: jour.visites.map((x, m) => (m === k ? { ...x, inclus: e.target.value === "true" } : x)),
                                                    })}
                                                    aria-label={`La visite ${k + 1} du jour ${i + 1} est-elle incluse`}>
                                                    <option value="true">Incluse</option>
                                                    <option value="false">En option</option>
                                                </select>
                                                <input type="text" className="ad-champ ad-prog__note font-body"
                                                    value={v.note ?? ""} maxLength={255}
                                                    onChange={(e) => majJour(i, {
                                                        visites: jour.visites.map((x, m) => (m === k ? { ...x, note: e.target.value } : x)),
                                                    })}
                                                    placeholder="Précision (facultatif)"
                                                    aria-label={`Précision sur la visite ${k + 1} du jour ${i + 1}`} />
                                                <button type="button" className="ad-retirer"
                                                    onClick={() => majJour(i, { visites: jour.visites.filter((_, m) => m !== k) })}
                                                    title="Retirer cette visite"
                                                    aria-label={`Retirer la visite ${k + 1} du jour ${i + 1}`}>
                                                    <FaXmark className="text-xs" aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))}
                                        {visites.length === 0 ? (
                                            <p className="ad-champ__aide font-body">
                                                Aucun point d'intérêt enregistré dans les lieux de cette journée.
                                            </p>
                                        ) : (
                                            <button type="button" className="ad-bouton ad-prog__ajouter font-body-strong"
                                                onClick={() => majJour(i, {
                                                    visites: [...(jour.visites ?? []), { poiId: "", inclus: true, note: "" }],
                                                })}>
                                                <FaPlus aria-hidden="true" /> Ajouter une visite
                                            </button>
                                        )}
                                    </fieldset>

                                    {/* ── Les notes internes ──────────────── */}
                                    <div className="ad-modale__champ">
                                        <label htmlFor={`jour-${i}-notes`} className="ad-modale__libelle font-body-strong">
                                            Notes internes
                                        </label>
                                        <textarea id={`jour-${i}-notes`} rows={2} className="ad-champ font-body resize-none"
                                            value={jour.notes ?? ""}
                                            onChange={(e) => majJour(i, { notes: e.target.value })}
                                            placeholder="Pour l'agence et le guide — le voyageur ne les voit pas." />
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>

            {jours.length < JOURS_MAX && (
                <button type="button" className="ad-bouton ad-bouton--plein ad-prog__ajouter-jour font-body-strong"
                    onClick={ajouterJour}>
                    <FaPlus aria-hidden="true" /> Ajouter un jour
                </button>
            )}
        </div>
    );
}
