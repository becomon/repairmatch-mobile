import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export interface Tone {
  bg: string;
  fg: string;
}

export const tones = {
  primary: { bg: colors.primary, fg: colors.onPrimary },
  fresh: { bg: colors.freshSoft, fg: colors.freshStrong },
  primarySoft: { bg: colors.primarySoft, fg: colors.primaryDark },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  neutral: { bg: colors.surface2, fg: colors.textSoft },
  info: { bg: colors.infoSoft, fg: colors.info },
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
      <Text variant="smallStrong" color={selected ? colors.onPrimary : colors.text} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.freshSoft, borderWidth: 1, borderColor: colors.fresh },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.freshSoft },
  info: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.navLine },
  filter: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1 },
  filterOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterDisabled: { opacity: 0.4 },
  filterOff: { backgroundColor: colors.surface, borderColor: colors.border },
});

export const NAME_MISMATCH_NOTE = 'El nombre del perfil no coincide con su documento';

/**
 * Soft emerald "Identidad verificada" pill with a shield: a trust hint from Didit, never a gate.
 * When `nameMatches === false` the profile name differs from the verified document, so it only claims
 * "Persona verificada" and adds a muted note. `true` and null/undefined (unknown) keep the regular label.
 */
export function IdentityPill({ label = 'Identidad verificada', nameMatches }: { label?: string; nameMatches?: boolean | null | undefined }) {
  const mismatch = nameMatches === false;
  const shown = mismatch ? 'Persona verificada' : label;
  const pill = (
    <View style={styles.identity} accessibilityLabel={mismatch ? `${shown}. ${NAME_MISMATCH_NOTE}` : shown}>
      <Icon name="shield-checkmark" size={13} color={colors.freshStrong} />
      <Text variant="caption" color={colors.freshStrong} numberOfLines={1}>
        {shown}
      </Text>
    </View>
  );
  if (!mismatch) return pill;
  return (
    <View style={{ alignSelf: 'flex-start', gap: 2 }}>
      {pill}
      <Text variant="small" color={colors.textMuted}>{NAME_MISMATCH_NOTE}</Text>
    </View>
  );
}

/** Emerald pill with a check: "Verificado" / "Recomendado" on offers, like the web landing showcase. */
export function VerifiedPill({ label = 'Verificado' }: { label?: string }) {
  return (
    <View style={styles.verified} accessibilityLabel={label}>
      <Icon name="checkmark-circle" size={14} color={colors.freshStrong} />
      <Text variant="caption" color={colors.freshStrong} numberOfLines={2} style={{ flexShrink: 1 }}>
        {label}
      </Text>
    </View>
  );
}

