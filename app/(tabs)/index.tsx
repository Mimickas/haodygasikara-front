import Mapbox, {
  Camera,
  MapView,
  PointAnnotation,
  MarkerView,
} from '@rnmapbox/maps';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';

// ⚠️ Initialise ton token public ici
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

// ---- Données test (tu les mettras dans Supabase plus tard) ----
const DESTINATIONS = [
  {
    id: '1',
    nom: 'Antananarivo',
    emoji: '🏙️',
    categorie: 'ville',
    coordinates: [47.5079, -18.9137],
    description: 'La capitale de Madagascar',
  },
  {
    id: '2',
    nom: 'Majunga',
    emoji: '🌊',
    categorie: 'plage',
    coordinates: [46.3168, -15.7167],
    description: 'Ville côtière du nord-ouest',
  },
  {
    id: '3',
    nom: 'Ankarafantsika',
    emoji: '🌿',
    categorie: 'nature',
    coordinates: [46.8167, -16.3167],
    description: 'Parc national sur la route Tana-Majunga',
  },
  {
    id: '4',
    nom: 'Maevatanana',
    emoji: '🏡',
    categorie: 'ville',
    coordinates: [46.8333, -16.9333],
    description: 'Ville étape sur la RN4',
  },
];

// Couleur par catégorie
const CATEGORIE_COLOR: Record<string, string> = {
  ville: '#3B82F6',
  plage: '#06B6D4',
  nature: '#22C55E',
  historique: '#F59E0B',
};

export default function CarteScreen() {
  const [selected, setSelected] = useState<(typeof DESTINATIONS)[0] | null>(null);

  return (
    <View style={styles.container}>

      {/* ---- CARTE ---- */}
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street} // Street | Satellite | Dark | Light | Outdoors
      >
        {/* Caméra centrée sur la route Tana → Majunga */}
        <Camera
          zoomLevel={6}
          centerCoordinate={[47.0, -17.2]}
          animationMode="flyTo"
          animationDuration={1500}
        />

        {/* Markers */}
        {DESTINATIONS.map((dest) => (
          <MarkerView
            key={dest.id}
            coordinate={dest.coordinates as [number, number]}
          >
            <TouchableOpacity
              style={[
                styles.marker,
                { backgroundColor: CATEGORIE_COLOR[dest.categorie] ?? '#6B7280' },
                selected?.id === dest.id && styles.markerSelected,
              ]}
              onPress={() => setSelected(dest)}
            >
              <Text style={styles.markerEmoji}>{dest.emoji}</Text>
              <Text style={styles.markerNom}>{dest.nom}</Text>
            </TouchableOpacity>
          </MarkerView>
        ))}
      </MapView>

      {/* ---- CARD INFO au bas quand on clique un marker ---- */}
      {selected && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>{selected.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardNom}>{selected.nom}</Text>
              <Text style={styles.cardCategorie}>{selected.categorie}</Text>
            </View>
            {/* Bouton fermer */}
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDesc}>{selected.description}</Text>
        </View>
      )}

      {/* ---- LÉGENDE ---- */}
      <View style={styles.legende}>
        {Object.entries(CATEGORIE_COLOR).map(([cat, color]) => (
          <View key={cat} style={styles.legendeItem}>
            <View style={[styles.legendeDot, { backgroundColor: color }]} />
            <Text style={styles.legendeText}>{cat}</Text>
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // --- Marker ---
  marker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelected: {
    transform: [{ scale: 1.15 }],
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerEmoji: {
    fontSize: 14,
  },
  markerNom: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // --- Card info ---
  card: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardNom: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardCategorie: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  cardDesc: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  closeBtn: {
    fontSize: 18,
    color: '#9CA3AF',
    padding: 4,
  },

  // --- Légende ---
  legende: {
    position: 'absolute',
    top: 50,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  legendeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendeText: {
    fontSize: 11,
    color: '#374151',
    textTransform: 'capitalize',
  },
});