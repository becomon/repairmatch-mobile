import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, type LatLng, type MapPressEvent, type MarkerDragStartEndEvent } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { applianceVisual } from '@/features/catalog/appliances';
import { colors, radius } from '@/shared/theme';
import { useReduceMotion } from '@/shared/ui/motion';
import type { CoverageMapProps } from './coverageMapTypes';
import { DEMAND_CIRCLE_METERS, withAlpha } from './demand';
import { DemandChip } from './DemandChip';

/** Roughly how many degrees of latitude fit the circle with some margin around it. */
function deltaFor(radiusKm: number): number {
  return Math.min(Math.max((radiusKm * 2.6) / 111, 0.01), 20);
}

/**
 * Native map (Apple Maps on iOS, Google Maps on Android; both work in Expo Go). The pin is draggable,
 * a tap moves it too, and the circle shows the coverage radius. Nearby requests are drawn as soft
 * circles at their approximate point, so a technician sees where demand is without seeing any home.
 */
export function CoverageMap({ latitude, longitude, radiusKm, onPinMoved, demand, onOpenDemand }: CoverageMapProps) {
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

  const points = demand?.ready ? demand.points : [];
  const hasDemand = points.length > 0;

  // Cheap pulse: the fill alternates between two opacities every ~1.8 s. One timer for the whole map,
  // and none at all with reduced motion or without circles.
  const reduce = useReduceMotion();
  const [bright, setBright] = useState(false);
  useEffect(() => {
    if (reduce || !hasDemand) return;
    const id = setInterval(() => setBright((b) => !b), 1800);
    return () => clearInterval(id);
  }, [reduce, hasDemand]);

  // Custom marker views are bitmapped; stop tracking once the icon font had time to render.
  const [track, setTrack] = useState(true);
  const count = points.length;
  useEffect(() => {
    if (count === 0) return;
    const id = setTimeout(() => setTrack(false), 1200);
    return () => clearTimeout(id);
  }, [count]);

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
        <Circle center={center} radius={radiusKm * 1000} strokeColor={colors.primary} strokeWidth={2} fillColor={colors.coverageFill} />
        {points.flatMap((p) => {
          const at: LatLng = { latitude: p.latitude, longitude: p.longitude };
          return [
            <Circle
              key={`c${p.requestId}`}
              center={at}
              radius={DEMAND_CIRCLE_METERS}
              strokeColor={withAlpha(p.color, 0.35)}
              strokeWidth={1}
              fillColor={withAlpha(p.color, bright ? 0.3 : 0.18)}
            />,
            <Marker
              key={`m${p.requestId}`}
              coordinate={at}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={track}
              accessibilityLabel={`${p.label} cerca de ti, a ${p.distanceKm.toFixed(1)} kilómetros. Toca para ver el caso.`}
              onPress={() => onOpenDemand?.(p)}
            >
              <View style={[styles.dot, { borderColor: p.color }]}>
                <MaterialCommunityIcons name={applianceVisual(p.request.applianceTypeName).icon} size={14} color={p.color} />
              </View>
            </Marker>,
          ];
        })}
        <Marker coordinate={center} draggable pinColor={colors.primary} onDragEnd={(event: MarkerDragStartEndEvent) => moved(event.nativeEvent.coordinate)} />
      </MapView>
      {demand?.ready ? <DemandChip count={count} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 280, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.neutralSoft },
  map: { ...StyleSheet.absoluteFill },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
