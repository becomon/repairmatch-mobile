import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, GUTTER, radius, shadow } from '../theme';
import { Button } from './Button';
import { Text } from './Text';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Bottom sheet that asks before any irreversible action (accept a proposal, cancel, complete). */
export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = 'Volver', destructive, loading, onConfirm, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Cerrar" style={styles.scrim} onPress={loading ? undefined : onCancel} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]} accessibilityViewIsModal>
          <View style={styles.grabber} />
          <Text variant="title" style={styles.title}>{title}</Text>
          <Text variant="body" color={colors.textMuted}>{message}</Text>
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button label={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} />
            </View>
            <View style={styles.action}>
              <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    gap: 8,
    ...shadow.sheet,
  },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: radius.pill, backgroundColor: colors.border, marginBottom: 8 },
  title: { fontSize: 19, lineHeight: 26 },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 12 },
  action: { flex: 1 },
});
