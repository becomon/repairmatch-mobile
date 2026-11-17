import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, TOUCH } from '../theme';
import { Icon, type IconName } from './Icon';
import { useReduceMotion } from './motion';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  /** Hug the content instead of filling the row. */
  compact?: boolean;
  /** Light shine that crosses the button now and then (primary only), like web `.sweep`. */
  sweep?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
  danger: { bg: colors.surface, fg: colors.danger, border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
};

function Shine({ width }: { width: number }) {
  const reduce = useReduceMotion();
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce, t]);
  if (reduce || width === 0) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shine,
        { width, transform: [{ translateX: t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [-width * 1.2, -width * 1.2, width * 1.2] }) }] },
      ]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
        locations={[0.3, 0.5, 0.7]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.6 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon, compact, sweep, style, accessibilityHint }: Props) {
  const p = palette[variant];
  const inactive = disabled || loading;
  const [width, setWidth] = useState(0);
  const showSweep = !!sweep && variant === 'primary' && !inactive;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={inactive ? undefined : onPress}
      onLayout={showSweep ? (e) => setWidth(e.nativeEvent.layout.width) : undefined}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed && variant === 'primary' ? colors.primaryDark : p.bg, borderColor: p.border, opacity: disabled ? 0.45 : pressed ? 0.9 : 1 },
        compact ? styles.compact : styles.full,
        style,
      ]}
    >
      {showSweep ? <Shine width={width} /> : null}
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={p.fg} /> : null}
          <Text variant="bodyStrong" color={p.fg} numberOfLines={2} align="center" style={styles.label}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  full: { alignSelf: 'stretch' },
  compact: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flexShrink: 1 },
  shine: { position: 'absolute', top: 0, bottom: 0, left: 0 },
});
