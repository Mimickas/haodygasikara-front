import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { distanceKm } from "../../../../utils/geo";
import { CENTRE_MADAGASCAR, JETON_MAPBOX, habillerCartePapier } from "../../../../utils/carte";

// ── La carte du tracé ──────────────────────────────────────────────────────
//
// Une carte de papier : terres sable, mers ivoire, noms en encre pâle — les
// couleurs du site, pas celles de Mapbox. Dessus, trois couches :
//   * les destinations encore libres, en petits points : un clic ouvre la fiche ;
//   * le tracé, en pointillé fin, dans l'ordre des étapes ;
//   * les étapes, en carrés numérotés à l'encre, qui passent en terre cuite
//     quand on survole la ligne correspondante de l'itinéraire.
//
// Elle s'ouvre en volet par-dessus la galerie (clip-path, power4) et ne se
// recadre que quand l'itinéraire change — pas quand le catalogue est filtré.

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const geojsonCatalogue = (destinations) => ({
    type: "FeatureCollection",
    features: destinations
        .filter((d) => d.lat != null && d.lng != null && !d.dejaChoisie)
        .map((d) => ({ type: "Feature", properties: { id: d.id, nom: d.nom }, geometry: { type: "Point", coordinates: [d.lng, d.lat] } })),
});

export default function CarteParcours({ visible, etapes, destinations, survol, onSurvol, onOuvrir }) {
    const volet = useRef(null);
    const conteneur = useRef(null);
    const carte = useRef(null);
    const reperes = useRef([]);
    const [prete, setPrete] = useState(false);
    const sansJeton = !JETON_MAPBOX;

    const rappels = useRef({ onSurvol, onOuvrir, destinations });
    useEffect(() => { rappels.current = { onSurvol, onOuvrir, destinations }; }, [onSurvol, onOuvrir, destinations]);

    // ── Le volet : s'ouvre de droite à gauche, se referme vers la gauche ───
    const premiere = useRef(true);
    useLayoutEffect(() => {
        const el = volet.current;
        if (!el) return undefined;
        const instantane = SOBRE();
        let tween;
        if (visible) {
            gsap.set(el, { visibility: "visible" });
            tween = gsap.fromTo(el,
                { clipPath: "inset(0% 0% 0% 100%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: instantane ? 0 : 1.1, ease: "power4.inOut" });
        } else if (!premiere.current) {
            tween = gsap.to(el, {
                clipPath: "inset(0% 100% 0% 0%)",
                duration: instantane ? 0 : 0.9,
                ease: "power4.inOut",
                onComplete: () => gsap.set(el, { visibility: "hidden" }),
            });
        }
        premiere.current = false;
        return () => tween?.kill();
    }, [visible]);

    // ── Création, une seule fois ───────────────────────────────────────────
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
            m.addSource("catalogue", { type: "geojson", data: geojsonCatalogue([]) });
            m.addLayer({
                id: "catalogue-points", type: "circle", source: "catalogue",
                paint: {
                    "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 9, 6],
                    "circle-color": "#8B7C6D", "circle-opacity": 0.55,
                    "circle-stroke-color": "#F7F3EA", "circle-stroke-width": 1.5,
                },
            });
            m.addSource("trace", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
            m.addLayer({
                id: "trace-ligne", type: "line", source: "trace",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#2B211A", "line-width": 1.4, "line-dasharray": [2, 2.5] },
            }, "catalogue-points");

            m.on("click", "catalogue-points", (e) => {
                const id = e.features?.[0]?.properties?.id;
                const d = rappels.current.destinations.find((x) => x.id === id);
                if (d) rappels.current.onOuvrir(d);
            });
            m.on("mouseenter", "catalogue-points", () => { m.getCanvas().style.cursor = "pointer"; });
            m.on("mouseleave", "catalogue-points", () => { m.getCanvas().style.cursor = ""; });
            setPrete(true);
        });

        // Le conteneur change de taille avec la fenêtre et à l'ouverture du volet.
        const observateur = new ResizeObserver(() => m.resize());
        observateur.observe(conteneur.current);

        return () => {
            observateur.disconnect();
            m.remove();
            carte.current = null;
        };
    }, [sansJeton]);

    // ── Le catalogue ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!prete) return;
        carte.current.getSource("catalogue")?.setData(geojsonCatalogue(destinations));
    }, [destinations, prete]);

    // ── L'itinéraire : tracé, repères, cadrage ─────────────────────────────
    const cleItineraire = etapes.map((e) => `${e.cle}:${e.destination.id}`).join("|");
    useEffect(() => {
        if (!prete) return;
        const m = carte.current;
        const points = etapes
            .map((e, i) => ({ ...e.destination, index: i }))
            .filter((d) => d.lat != null && d.lng != null);

        m.getSource("trace")?.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: points.map((p) => [p.lng, p.lat]) },
        });

        // Le transform de l'élément appartient à Mapbox (il le positionne) :
        // l'effet de survol agit donc sur la pastille intérieure.
        reperes.current.forEach((r) => r.remove());
        reperes.current = points.map((p) => {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "cx-cp-repere";
            el.setAttribute("aria-label", `Étape ${p.index + 1} : ${p.nom}`);
            const pastille = document.createElement("span");
            pastille.className = "cx-cp-repere__pastille";
            pastille.textContent = String(p.index + 1);
            el.appendChild(pastille);
            el.addEventListener("mouseenter", () => rappels.current.onSurvol(p.index));
            el.addEventListener("mouseleave", () => rappels.current.onSurvol(null));
            return new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat([p.lng, p.lat]).addTo(m);
        });

        if (points.length === 1) {
            m.easeTo({ center: [points[0].lng, points[0].lat], zoom: 6.2, duration: 1200 });
        } else if (points.length > 1) {
            const cadre = new mapboxgl.LngLatBounds();
            points.forEach((p) => cadre.extend([p.lng, p.lat]));
            m.fitBounds(cadre, { padding: { top: 120, bottom: 80, left: 90, right: 90 }, maxZoom: 6.8, duration: 1200 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cleItineraire, prete]);

    // ── L'étape survolée, dans l'itinéraire ou sur la carte ────────────────
    useEffect(() => {
        reperes.current.forEach((r, i) => r.getElement().classList.toggle("cx-cp-repere--survol", i === survol));
    }, [survol, cleItineraire]);

    const km = Math.round(etapes.reduce((s, e, i) => s + (i ? distanceKm(etapes[i - 1].destination, e.destination) ?? 0 : 0), 0));

    return (
        <div ref={volet} className="cx-cp-carte-parcours" aria-label="Carte du tracé" aria-hidden={!visible}>
            {sansJeton ? (
                <div className="cx-cp-carte-parcours__absente">La carte n'est pas configurée (jeton Mapbox manquant).</div>
            ) : (
                <div ref={conteneur} className="cx-cp-carte-parcours__fond" />
            )}
            <p className="cx-cp-carte-parcours__legende">
                {etapes.length ? (
                    <>
                        {String(etapes.length).padStart(2, "0")} étape{etapes.length > 1 ? "s" : ""}
                        {km > 0 && <><span className="cx-cp-carte-parcours__sep" aria-hidden="true" />{km} km</>}
                    </>
                ) : "Aucune étape"}
            </p>
        </div>
    );
}
