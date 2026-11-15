import { StyleSheet, View } from 'react-native';
import { friendlyError } from '../api/errors';
import { colors } from '../theme';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

interface Props {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.badge}>
        <Icon name="cloud-offline-outline" size={32} color={colors.danger} />
      </View>
      <Text variant="heading" align="center">Algo salió mal</Text>
      <Text variant="body" color={colors.textMuted} align="center">{friendlyError(error)}</Text>
      {onRetry ? <Button label="Reintentar" icon="refresh" onPress={onRetry} compact style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingVertical: 40, paddingHorizontal: 24 },
  badge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  action: { marginTop: 12 },
});
