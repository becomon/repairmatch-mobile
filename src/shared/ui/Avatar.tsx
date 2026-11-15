import { View } from 'react-native';
import { colors } from '../theme';
import { initials } from '../format';
import { Text } from './Text';

const PALETTE = [colors.primary, colors.teal, colors.accent, '#7c3aed', '#be185d'];

function colorFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return PALETTE[sum % PALETTE.length]!;
}

export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colorFor(name), alignItems: 'center', justifyContent: 'center' }}
    >
      <Text variant="heading" color="#ffffff" style={{ fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.46) }}>
        {initials(name)}
      </Text>
    </View>
  );
}
