import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface Props {
  title: string;
  message: string;
  icon?: IconName;
  /** Suggested next step, so the screen is never a dead end. */
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, icon = 'file-tray-outline', actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      <Text variant="heading" align="center">{title}</Text>
      <Text variant="body" color={colors.textMuted} align="center">{message}</Text>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} compact style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 24 },
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  action: { marginTop: 12 },
});
