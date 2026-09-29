import mapboxgl from "mapbox-gl";

// ── La carte de papier, partagée ───────────────────────────────────────────
//
// Le site pose maintenant DEUX cartes : celle du créateur de circuit (le tracé
// qu'on compose) et celle de la fiche circuit (le trajet d'une journée). Elles
// doivent se ressembler — terres sable, mers ivoire, noms en encre pâle, les
// couleurs de la maison et non celles de Mapbox. Le jour où la palette bouge,
// elle bouge ici, pour les deux.
//
// Le jeton se pose une seule fois, au chargement de ce module : les deux cartes
// passent par lui, aucune ne peut l'oublier.

export const JETON_MAPBOX = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = JETON_MAPBOX;

export const PAPIER = {
    terre: "#EBE3D4",
    mer: "#F7F3EA",
    texte: "#8B7C6D",
    halo: "#F7F3EA",
    frontiere: "#CFC3AF",
};

/**
 * Repeint le style clair de Mapbox aux couleurs du site.
 *
 * Chaque couche est essayée séparément : un nom de couche absent d'une version
 * du style ne doit pas empêcher les autres d'être repeintes.
 */
export function habillerCartePapier(m) {
    const peindre = (id, prop, valeur) => { try { m.setPaintProperty(id, prop, valeur); } catch { /* couche absente */ } };
    for (const couche of m.getStyle()?.layers ?? []) {
        const { id, type } = couche;
        if (type === "background") peindre(id, "background-color", PAPIER.terre);
        else if (id === "water" || id.startsWith("water-")) {
            if (type === "fill") peindre(id, "fill-color", PAPIER.mer);
            if (type === "line") peindre(id, "line-color", PAPIER.mer);
        } else if (type === "fill" && /landuse|landcover|park|national|building|wetland|glacier|sand/.test(id)) {
            peindre(id, "fill-opacity", 0);
        } else if (type === "hillshade") {
            peindre(id, "hillshade-exaggeration", 0);
        } else if (type === "line" && /admin|boundary/.test(id)) {
            peindre(id, "line-color", PAPIER.frontiere);
        } else if (type === "line" && /road|bridge|tunnel|rail|ferry/.test(id)) {
            peindre(id, "line-opacity", 0.35);
        } else if (type === "symbol") {
            peindre(id, "text-color", PAPIER.texte);
            peindre(id, "text-halo-color", PAPIER.halo);
            peindre(id, "icon-opacity", 0);
        }
    }
}

// Le centre de l'île, quand on n'a encore rien à cadrer.
export const CENTRE_MADAGASCAR = [46.8, -19.2];

/**
 * Les coordonnées d'un lieu, quelle que soit la forme reçue.
 *
 * Le créateur de circuit lit `{ lat, lng }` (le catalogue du composer) et la
 * fiche circuit `{ latitude, longitude }` (CircuitDetaille) : deux écritures
 * pour la même chose, et une carte qui ne sait lire que l'une des deux ne pose
 * aucun point. Renvoie `null` si le lieu n'est pas situé — un lieu sans
 * coordonnées ne se met pas au milieu de l'océan.
 */
export const coordonnees = (lieu) => {
    const lat = lieu?.lat ?? lieu?.latitude;
    const lng = lieu?.lng ?? lieu?.longitude;
    return lat == null || lng == null ? null : [Number(lng), Number(lat)];
};
