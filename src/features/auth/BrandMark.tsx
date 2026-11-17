import { StyleSheet, View } from 'react-native';
import { colors } from '@/shared/theme';
import { Text } from '@/shared/ui';

export function BrandMark({ size = 56 }: { size?: number }) {
  return (
    <View accessible={false} style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Text variant="title" color={colors.onPrimary} style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>R</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
