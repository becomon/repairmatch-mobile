import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Text } from './Text';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="small" color={colors.textMuted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12, paddingVertical: 48 },
});
