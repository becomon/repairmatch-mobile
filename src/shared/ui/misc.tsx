import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Section title with an optional "Ver todas" style action. */
export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionRow}>
      <Text variant="heading" accessibilityRole="header" style={styles.flex}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action} hitSlop={8}>
          <Text variant="smallStrong" color={colors.link}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type BannerTone = 'info' | 'success' | 'warning' | 'danger';
const bannerColors: Record<BannerTone, { bg: string; fg: string; icon: IconName }> = {
  info: { bg: colors.infoSoft, fg: colors.info, icon: 'information-circle' },
  success: { bg: colors.freshSoft, fg: colors.freshStrong, icon: 'checkmark-circle' },
  warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'alert-circle' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, icon: 'close-circle' },
};

/** Inline message for notices and form-level errors. */
export function Banner({ tone = 'info', message }: { tone?: BannerTone; message: string }) {
  const c = bannerColors[tone];
  return (
    <View style={[styles.banner, { backgroundColor: c.bg }]} accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={c.icon} size={20} color={c.fg} />
      <Text variant="small" color={c.fg} style={styles.flex}>{message}</Text>
    </View>
  );
}

/** "Paso 2 de 4" with a thin progress bar. */
export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progress} accessibilityLabel={`Paso ${step} de ${total}`}>
      <Text variant="smallStrong" color={colors.textMuted}>Paso {step} de {total}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(step / total) * 100}%` }]} />
      </View>
    </View>
  );
}

/** Label/value line used in summaries. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="small" color={colors.textMuted} style={styles.infoLabel}>{label}</Text>
      <Text variant="smallStrong" style={styles.flex}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  action: { minHeight: 44, justifyContent: 'center' },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: radius.md },
  progress: { gap: 6 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.primary },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoLabel: { width: 92 },
});
