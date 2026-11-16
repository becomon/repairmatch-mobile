import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';
import { demandSummary } from './demand';

/** Floating summary over the coverage map: how many clients nearby are waiting for a technician. */
export function DemandChip({ count }: { count: number }) {
  const empty = count === 0;
  return (
    <View style={[styles.chip, empty ? styles.empty : styles.active]} accessibilityRole="summary" accessibilityLabel={demandSummary(count)}>
      <Icon name={empty ? 'search-outline' : 'people'} size={16} color={empty ? colors.textMuted : colors.freshStrong} />
      <Text variant="smallStrong" color={empty ? colors.textMuted : colors.freshStrong} numberOfLines={1} style={{ flexShrink: 1 }}>
        {demandSummary(count)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    position: 'absolute',
    top: 10,
    left: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: '92%',
  },
  active: { backgroundColor: colors.freshSoft, borderColor: colors.fresh },
  empty: { backgroundColor: colors.surface, borderColor: colors.border },
});

/** One-line demand summary for the "Para ti" header; tapping goes to the profile map. */
export function DemandLink({ count, onPress }: { count: number; onPress: () => void }) {
  if (count === 0) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${demandSummary(count)}. Ver en el mapa`} onPress={onPress} style={[linkStyles.link]} hitSlop={6}>
      <Icon name="map" size={16} color={colors.freshStrong} />
      <Text variant="smallStrong" color={colors.freshStrong}>{count}</Text>
    </Pressable>
  );
}

const linkStyles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.freshSoft, borderWidth: 1, borderColor: colors.fresh, justifyContent: 'center' },
});
