import { Pressable, StyleSheet, View } from 'react-native';
import { formatDistance } from '@/shared/format';
import { colors, radius } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';
import type { CoverageMapProps } from './coverageMapTypes';
import { demandSummary } from './demand';

const MAX_LISTED = 5;

/**
 * react-native-maps has no web implementation, so the browser build shows the saved point instead
 * of a map. Searching an address or using the GPS still works there; the draggable pin is native only.
 * Nearby demand shows as a count and a short list of distances.
 */
export function CoverageMap({ latitude, longitude, radiusKm, demand, onOpenDemand }: CoverageMapProps) {
  const points = demand?.ready ? demand.points : null;
  return (
    <View style={styles.frame}>
      <Icon name="map-outline" size={32} color={colors.primary} />
      <Text variant="bodyStrong" align="center">{latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
      <Text variant="small" color={colors.textMuted} align="center">
        Radio de {radiusKm} km. El mapa con pin arrastrable está disponible en la app para Android e iOS.
      </Text>
      {points ? (
        <View style={styles.demand}>
          <Text variant="smallStrong" color={points.length ? colors.freshStrong : colors.textMuted} align="center">
            {demandSummary(points.length)}
          </Text>
          {points.slice(0, MAX_LISTED).map((p) => (
            <Pressable
              key={p.requestId}
              accessibilityRole="button"
              accessibilityLabel={`${p.label}, a ${formatDistance(p.distanceKm)}. Ver caso`}
              onPress={() => onOpenDemand?.(p)}
              style={styles.row}
            >
              <Text variant="small">{p.label}</Text>
              <Text variant="small" color={colors.textMuted}>a {formatDistance(p.distanceKm)}</Text>
            </Pressable>
          ))}
          {points.length > MAX_LISTED ? (
            <Text variant="small" color={colors.textMuted} align="center">y {points.length - MAX_LISTED} más en Oportunidades</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', gap: 6, padding: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.neutralSoft },
  demand: { alignSelf: 'stretch', gap: 4, marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
});
