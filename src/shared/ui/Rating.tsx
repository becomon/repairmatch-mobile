import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

/** `★ 4.9 (38 reseñas)`; shows "Nuevo" when there are no reviews. */
export function RatingSummary({ average, count }: { average: number; count: number }) {
  if (count === 0) return <Text variant="small" color={colors.textMuted}>★ Nuevo · sin reseñas</Text>;
  return (
    <Text variant="small" color={colors.textMuted}>
      ★ {average.toFixed(1)} ({count} {count === 1 ? 'reseña' : 'reseñas'})
    </Text>
  );
}

/** Read-only row of stars. */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= Math.round(value) ? 'star' : 'star-outline'} size={size} color={colors.accent} />
      ))}
    </View>
  );
}

/** Tappable star input with 48pt touch targets. */
export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="radio"
          accessibilityLabel={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          accessibilityState={{ checked: n === value }}
          onPress={() => onChange(n)}
          style={styles.starHit}
        >
          <Icon name={n <= value ? 'star' : 'star-outline'} size={36} color={colors.accent} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  starHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
