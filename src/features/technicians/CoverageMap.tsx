import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, type LatLng, type MapPressEvent, type MarkerDragStartEndEvent } from 'react-native-maps';
import { colors, radius } from '@/shared/theme';
import type { CoverageMapProps } from './coverageMapTypes';

/** Roughly how many degrees of latitude fit the circle with some margin around it. */
function deltaFor(radiusKm: number): number {
  return Math.min(Math.max((radiusKm * 2.6) / 111, 0.01), 20);
}

/**
 * Native map (Apple Maps on iOS, Google Maps on Android; both work in Expo Go). The pin is draggable,
 * a tap moves it too, and the circle shows the coverage radius.
 */
export function CoverageMap({ latitude, longitude, radiusKm, onPinMoved }: CoverageMapProps) {
  const mapRef = useRef<MapView>(null);
  const center: LatLng = { latitude, longitude };
  // Frame the whole circle whenever the centre changes from outside (search result, GPS).
  const lastFramed = useRef(`${latitude},${longitude}`);
  useEffect(() => {
    const key = `${latitude},${longitude}`;
    if (key === lastFramed.current) return;
    lastFramed.current = key;
    const delta = deltaFor(radiusKm);
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: delta, longitudeDelta: delta }, 350);
  }, [latitude, longitude, radiusKm]);

  function moved(coordinate: LatLng) {
    // The map already shows the pin there, so it must not re-frame on its own move.
    lastFramed.current = `${coordinate.latitude},${coordinate.longitude}`;
    onPinMoved(Number(coordinate.latitude.toFixed(6)), Number(coordinate.longitude.toFixed(6)));
  }

  const delta = deltaFor(radiusKm);
  return (
    <View style={styles.frame} accessibilityLabel="Mapa de tu zona de atención. Arrastra el pin o toca el mapa para moverlo.">
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude, longitude, latitudeDelta: delta, longitudeDelta: delta }}
        onPress={(event: MapPressEvent) => moved(event.nativeEvent.coordinate)}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Circle center={center} radius={radiusKm * 1000} strokeColor={colors.primary} strokeWidth={2} fillColor="rgba(36,72,200,0.14)" />
        <Marker coordinate={center} draggable pinColor={colors.accent} onDragEnd={(event: MarkerDragStartEndEvent) => moved(event.nativeEvent.coordinate)} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 280, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.neutralSoft },
  map: { ...StyleSheet.absoluteFill },
});
