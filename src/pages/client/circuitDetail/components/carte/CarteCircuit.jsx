import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CENTRE_MADAGASCAR, JETON_MAPBOX, coordonnees, habillerCartePapier } from "../../../../../utils/carte";

// ── « Voir sur la carte » ──────────────────────────────────────────────────
//
// Le bouton d'une journée du programme ouvre le voyage en plan : tout le trajet
// du circuit en pointillé, ses haltes numérotées, et LA JOURNÉE demandée par
// dessus — ses lieux en terre cuite, reliés dans l'ordre où on les traverse,
// le cadrage posé sur eux.
//
// On garde le circuit entier derrière la journée, et c'est le fond de l'idée :
// la question que pose ce bouton n'est pas « où est Ampefy » mais « où en
// est-on du voyage ce jour-là ». Une carte qui ne montrerait que la journée ne
// répondrait pas.
//
// Mapbox pèse 1,8 Mo : le composant est chargé à la demande (cf. CircuitDetail),
// et son moteur n'arrive donc qu'au premier clic.

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const ENCRE = "#2B211A";
const TERRE = "#A85832";

const ligne = (points) => ({
    type: "Feature",
    geometry: { type: "LineString", coordinates: points },
});

/** Un repère : le carré numéroté du créateur de circuit, même main. */
function repere(numero, nom, accent) {
    const el = document.createElement("div");
    el.className = `cx-carte-repere${accent ? " cx-carte-repere--jour" : ""}`;
    el.setAttribute("aria-hidden", "true");
    el.title = nom ?? "";
    const pastille = document.createElement("span");
    pastille.className = "cx-carte-repere__pastille";
    pastille.textContent = numero;
    el.appendChild(pastille);
    return el;
}

export default function CarteCircuit({ circuit, etapes = [], jour = null, onFermer }) {
    const voile = useRef(null);
    const panneau = useRef(null);
    const conteneur = useRef(null);
    const carte = useRef(null);
    const marqueurs = useRef([]);
    const [prete, setPrete] = useState(false);
    const sansJeton = !JETON_MAPBOX;

    // Les haltes du voyage, situées, dans l'ordre.
    const haltes = etapes
        .map(({ step }, i) => ({ nom: step?.destination?.nom, point: coordonnees(step?.destination), numero: i + 1 }))
        .filter((h) => h.point);

    // Les lieux de la journée demandée, dans l'ordre du trajet.
    const lieuxDuJour = (jour?.lieux ?? [])
        .map((l) => ({ nom: l?.nom, point: coordonnees(l) }))
        .filter((l) => l.point);

    // ── L'ouverture, et la fermeture ───────────────────────────────────────
    const fermeture = useRef(false);
    const fermer = useCallback(() => {
        if (fermeture.current) return;
        fermeture.current = true;
        if (SOBRE()) { onFermer(); return; }
        gsap.timeline({ onComplete: onFermer })
            .to(panneau.current, { yPercent: 4, opacity: 0, duration: 0.45, ease: "power3.in" }, 0)
            .to(voile.current, { backgroundColor: "rgba(37, 26, 18, 0)", duration: 0.4, ease: "power2.in" }, 0.1);
    }, [onFermer]);

    useLayoutEffect(() => {
        if (SOBRE()) return undefined;
        const tl = gsap.timeline()
            .fromTo(voile.current, { backgroundColor: "rgba(37, 26, 18, 0)" }, { backgroundColor: "rgba(37, 26, 18, 0.55)", duration: 0.5, ease: "power2.out" }, 0)
            .fromTo(panneau.current, { yPercent: 3, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", clearProps: "transform" }, 0.05);
        return () => tl.kill();
    }, []);

    useEffect(() => {
        const touche = (e) => { if (e.key === "Escape") fermer(); };
        window.addEventListener("keydown", touche);
        return () => window.removeEventListener("keydown", touche);
    }, [fermer]);

    // ── La carte, créée une seule fois ─────────────────────────────────────
    useEffect(() => {
        if (sansJeton || carte.current) return undefined;
        const m = new mapboxgl.Map({
            container: conteneur.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: CENTRE_MADAGASCAR,
            zoom: 4.8,
            // À plat : le globe ajoute un halo d'atmosphère blanc sur les bords.
            projection: "mercator",
            attributionControl: false,
            cooperativeGestures: false,
        });
        m.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
        m.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
        carte.current = m;

        m.on("load", () => {
            habillerCartePapier(m);

            // Le voyage entier, en pointillé fin.
            m.addSource("voyage", { type: "geojson", data: ligne([]) });
            m.addLayer({
                id: "voyage-ligne", type: "line", source: "voyage",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": ENCRE, "line-width": 1.4, "line-dasharray": [2, 2.5], "line-opacity": 0.55 },
            });

            // La journée, par-dessus : un trait plein, en terre cuite.
            m.addSource("journee", { type: "geojson", data: ligne([]) });
            m.addLayer({
                id: "journee-ligne", type: "line", source: "journee",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": TERRE, "line-width": 2.2 },
            });

            setPrete(true);
        });

        // Le voile s'ouvre en fondu : le conteneur prend sa taille APRÈS la
        // création, et sans cela la carte resterait au format qu'elle avait à
        // l'instant zéro.
        const observateur = new ResizeObserver(() => m.resize());
        observateur.observe(conteneur.current);

        return () => {
            observateur.disconnect();
            m.remove();
            carte.current = null;
        };
    }, [sansJeton]);

    // ── Le tracé, les repères, le cadrage ──────────────────────────────────
    const cleHaltes = haltes.map((h) => h.point.join()).join("|");
    const cleJour = lieuxDuJour.map((l) => l.point.join()).join("|");
    useEffect(() => {
        if (!prete) return;
        const m = carte.current;

        m.getSource("voyage")?.setData(ligne(haltes.map((h) => h.point)));
        m.getSource("journee")?.setData(ligne(lieuxDuJour.map((l) => l.point)));

        marqueurs.current.forEach((r) => r.remove());
        marqueurs.current = [];

        // Les haltes du voyage, numérotées.
        haltes.forEach((h) => {
            marqueurs.current.push(
                new mapboxgl.Marker({ element: repere(String(h.numero).padStart(2, "0"), h.nom, false), anchor: "center" })
                    .setLngLat(h.point).addTo(m));
        });

        // Les lieux de la journée : une pastille pleine, par-dessus les haltes.
        lieuxDuJour.forEach((l, i) => {
            marqueurs.current.push(
                new mapboxgl.Marker({ element: repere(String(i + 1), l.nom, true), anchor: "center" })
                    .setLngLat(l.point).addTo(m));
        });

        // On cadre sur la journée quand il y en a une, sur le voyage sinon.
        const cible = lieuxDuJour.length ? lieuxDuJour.map((l) => l.point) : haltes.map((h) => h.point);
        if (cible.length === 1) {
            m.easeTo({ center: cible[0], zoom: 8, duration: 900 });
        } else if (cible.length > 1) {
            const cadre = new mapboxgl.LngLatBounds();
            cible.forEach((p) => cadre.extend(p));
            m.fitBounds(cadre, { padding: { top: 110, bottom: 90, left: 80, right: 80 }, maxZoom: 8.5, duration: 900 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prete, cleHaltes, cleJour]);

    const trajet = lieuxDuJour.map((l) => l.nom).filter(Boolean).join(" → ");

    return (
        <div ref={voile} className="cx-carte-voile" onClick={fermer} role="presentation">
            <section
                ref={panneau}
                className="cx-carte"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={jour ? `Jour ${jour.jour} sur la carte` : "Le circuit sur la carte"}
                data-lenis-prevent
            >
                <header className="cx-carte__tete">
                    <div className="min-w-0">
                        <span className="cx-label cx-label--accent font-body-strong">
                            {jour ? `Jour ${jour.jour}` : "Le parcours"}
                        </span>
                        <h2 className="cx-carte__titre font-title">
                            {trajet || circuit?.nom || "Le circuit"}
                        </h2>
                    </div>
                    <button type="button" className="cx-carte__fermer" onClick={fermer} aria-label="Fermer la carte">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </header>

                {sansJeton ? (
                    <p className="cx-carte__absente font-body">
                        La carte n&apos;est pas configurée (jeton Mapbox manquant).
                    </p>
                ) : (
                    <div className="cx-carte__cadre">
                        <div ref={conteneur} className="cx-carte__fond" />
                    </div>
                )}

                <p className="cx-carte__legende font-body-strong">
                    {haltes.length
                        ? <>{String(haltes.length).padStart(2, "0")} halte{haltes.length > 1 ? "s" : ""}</>
                        : "Aucune halte située"}
                    {lieuxDuJour.length > 0 && (
                        <>
                            <span className="cx-carte__sep" aria-hidden="true" />
                            {lieuxDuJour.length} lieu{lieuxDuJour.length > 1 ? "x" : ""} ce jour-là
                        </>
                    )}
                </p>
            </section>
        </div>
    );
}
