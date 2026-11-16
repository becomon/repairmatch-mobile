import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow } from '../theme';
import { PulseRing } from './PulseRing';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  /** Glowing emerald border, used for the recommended / winning card. */
  highlight?: boolean;
  /** White-to-warm gradient face for featured cards. */
  glow?: boolean;
  accessibilityLabel?: string;
}

/** Surface card. When pressable it scales to 0.98 and lifts its shadow, like web `.spot-card`. */
export function Card({ children, onPress, style, highlight, glow, accessibilityLabel }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const base = [styles.card, highlight ? styles.highlight : null, style];
  const face = glow ? (
    <LinearGradient colors={gradients.cardGlow} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.face} pointerEvents="none" />
  ) : null;
  const ring = highlight ? <PulseRing color={colors.fresh} borderRadius={radius.card} /> : null;

  if (!onPress) {
    return (
      <View style={base}>
        {face}
        {ring}
        {children}
      </View>
    );
  }

  const to = (value: number) => Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => to(0.98)}
        onPressOut={() => to(1)}
        style={({ pressed }) => [...base, pressed ? shadow.lift : null]}
      >
        {face}
        {ring}
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.card,
  },
  highlight: { borderWidth: 2, borderColor: colors.fresh, shadowColor: colors.fresh, shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  face: { ...StyleSheet.absoluteFillObject, borderRadius: radius.card - 1 },
});
