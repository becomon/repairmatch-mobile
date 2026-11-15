import { View } from 'react-native';
import { colors } from '@/shared/theme';
import { Icon, type IconName } from '@/shared/ui';
import { applianceKind } from './status';

const ICON: Record<ReturnType<typeof applianceKind>, { name: IconName; fg: string; bg: string }> = {
  washer: { name: 'water', fg: colors.primary, bg: colors.primarySoft },
  fridge: { name: 'snow', fg: '#c24a0c', bg: colors.accentSoft },
  other: { name: 'build', fg: colors.textSoft, bg: colors.neutralSoft },
};

/** Rounded square with an icon for the appliance family. */
export function ApplianceTile({ name, size = 44 }: { name: string; size?: number }) {
  const i = ICON[applianceKind(name)];
  return (
    <View accessible={false} style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: i.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={i.name} size={size * 0.5} color={i.fg} />
    </View>
  );
}
