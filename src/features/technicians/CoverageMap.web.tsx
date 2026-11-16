import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';
import type { CoverageMapProps } from './coverageMapTypes';

/**
 * react-native-maps has no web implementation, so the browser build shows the saved point instead
 * of a map. Searching an address or using the GPS still works there; the draggable pin is native only.
 */
export function CoverageMap({ latitude, longitude, radiusKm }: CoverageMapProps) {
  return (
    <View style={styles.frame}>
      <Icon name="map-outline" size={32} color={colors.primary} />
      <Text variant="bodyStrong" align="center">{latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
      <Text variant="small" color={colors.textMuted} align="center">
        Radio de {radiusKm} km. El mapa con pin arrastrable está disponible en la app para Android e iOS.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', gap: 6, padding: 20, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.neutralSoft },
});
