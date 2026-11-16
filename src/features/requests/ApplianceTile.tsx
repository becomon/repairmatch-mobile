import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { applianceVisual } from '@/features/catalog/appliances';

/** Rounded square with the drawn icon of the appliance type (wrench only for unknown types). */
export function ApplianceTile({ name, size = 44 }: { name: string; size?: number }) {
  const visual = applianceVisual(name);
  return (
    <View accessible={false} style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: visual.bg, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name={visual.icon} size={size * 0.56} color={visual.fg} accessible={false} />
    </View>
  );
}
