import { View } from 'react-native';
import { colors } from '../theme';
import { initials } from '../format';
import { Text } from './Text';

/** Initials on a cobalt-soft disc, the same avatar as the web offer cards. */
export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.cobaltSoft, borderWidth: 1, borderColor: colors.infoSoft, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text variant="heading" color={colors.cobalt} style={{ fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.46) }}>
        {initials(name)}
      </Text>
    </View>
  );
}
