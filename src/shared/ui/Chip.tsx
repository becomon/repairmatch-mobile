import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';
import { Text } from './Text';

export interface Tone {
  bg: string;
  fg: string;
}

export const tones = {
  primary: { bg: colors.primary, fg: '#ffffff' },
  primarySoft: { bg: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  neutral: { bg: colors.neutralSoft, fg: colors.textSoft },
  accent: { bg: colors.accentSoft, fg: colors.accentDark },
} satisfies Record<string, Tone>;

interface StatusChipProps {
  label: string;
  tone: Tone;
  /** `round` = request lifecycle, `square` = service lifecycle. */
  shape?: 'round' | 'square';
}

/** Status pill. Round chips show the request status, square chips the service status. */
export function StatusChip({ label, tone, shape = 'round' }: StatusChipProps) {
  return (
    <View
      accessibilityLabel={`Estado: ${label}`}
      style={[styles.status, { backgroundColor: tone.bg, borderRadius: shape === 'round' ? radius.pill : 6 }]}
    >
      {shape === 'round' ? <View style={[styles.dot, { backgroundColor: tone.fg }]} /> : null}
      <Text variant="caption" color={tone.fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Small rounded-square tag for facts such as a date or the appliance types. */
export function InfoChip({ label }: { label: string }) {
  return (
    <View style={styles.info}>
      <Text variant="small" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/** Selectable pill for filters and sort order. */
export function FilterChip({ label, selected, onPress, disabled }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={[styles.filter, selected ? styles.filterOn : styles.filterOff, disabled ? styles.filterDisabled : null]}
    >
      <Text variant="smallStrong" color={selected ? '#ffffff' : colors.text} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  info: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.background },
  filter: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1 },
  filterOn: { backgroundColor: colors.text, borderColor: colors.text },
  filterDisabled: { opacity: 0.4 },
  filterOff: { backgroundColor: colors.surface, borderColor: colors.border },
});
