import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function BaseMap({ circuit }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);   // pour nettoyer les anciens marqueurs

    useEffect(() => {
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: [46.8, -18.9],
            zoom: 5,
        });
        mapRef.current = map;

        map.on("load", () => map.resize());

        // resize différé — couvre l'animation d'ouverture du panneau
        const t = setTimeout(() => map.resize(), 750);

        return () => {
            clearTimeout(t);
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !circuit?.steps?.length) return;

        const draw = () => {
            const points = circuit.steps
                .map((s) => s.place)
                .filter((p) => p && p.longitude != null && p.latitude != null)
                .map((p) => ({
                    lng: p.longitude,
                    lat: p.latitude,
                    nom: p.nom,
                    img: p.images?.find((i) => i.isCover)?.url || p.images?.[0]?.url,
                }));

            if (!points.length) return;

            // nettoyer ancien tracé
            if (map.getLayer("route-line")) map.removeLayer("route-line");
            if (map.getSource("route")) map.removeSource("route");

            // nettoyer anciens marqueurs
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];

            map.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: { type: "LineString", coordinates: points.map((p) => [p.lng, p.lat]) },
                },
            });
            map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#D94E2B", "line-width": 3, "line-dasharray": [1, 1.5] },
            });

            points.forEach((p, i) => {
                const el = document.createElement("div");
                el.className = "circuit-marker";
                el.innerHTML = `
                    <div class="circuit-marker__pin">
                        <div class="circuit-marker__img" style="background-image:url('${p.img || ""}')"></div>
                        <div class="circuit-marker__badge">${i + 1}</div>
                    </div>`;

                const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
                    .setLngLat([p.lng, p.lat])
                    .setPopup(new mapboxgl.Popup({ offset: 30, closeButton: false }).setHTML(`<strong>${p.nom}</strong>`))
                    .addTo(map);

                markersRef.current.push(marker);
            });

            const bounds = new mapboxgl.LngLatBounds();
            points.forEach((p) => bounds.extend([p.lng, p.lat]));
            map.fitBounds(bounds, { padding: 120, maxZoom: 9, duration: 1200 });
        };

        if (map.isStyleLoaded()) draw();
        else map.once("load", draw);
    }, [circuit]);

    return <div ref={containerRef} className="w-full h-full" />;
}