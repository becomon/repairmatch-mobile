import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { applianceVisual } from '@/features/catalog/appliances';
import { colors, gradients, radius } from '../theme';

interface Props {
  /** Catalog name of the appliance; picks the drawn icon. */
  name: string;
  height?: number;
  rounded?: number;
}

/** Sage panel with a soft light and the appliance icon, like the web landing `Scene` fallback. */
export function ScenePanel({ name, height = 120, rounded = radius.md }: Props) {
  const visual = applianceVisual(name);
  return (
    <View
      accessible={false}
      style={{ height, borderRadius: rounded, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.coverLine }}
    >
      <LinearGradient colors={gradients.cover} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', top: -height * 0.35, left: -height * 0.25, width: height * 1.1, height: height * 1.1, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.4)' }} />
      <MaterialCommunityIcons name={visual.icon} size={Math.round(height * 0.56)} color={colors.slate} style={{ opacity: 0.78 }} accessible={false} />
      <View style={{ position: 'absolute', bottom: height * 0.14, width: '30%', height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.1)' }} />
    </View>
  );
}
