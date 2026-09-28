// Distance à vol d'oiseau entre deux points { lat, lng }, en kilomètres
// (formule de haversine). Null si un point manque : une distance inconnue
// n'est pas une distance nulle.
export function distanceKm(a, b) {
    if (a?.lat == null || a?.lng == null || b?.lat == null || b?.lng == null) return null;
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}
