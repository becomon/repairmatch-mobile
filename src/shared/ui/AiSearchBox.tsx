import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TextInput, View, type LayoutChangeEvent, type TextInputProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, gradients, radius } from '../theme';
import { Icon } from './Icon';
import { useReduceMotion } from './motion';
import { PulseRing } from './PulseRing';

interface Props extends Omit<TextInputProps, 'style'> {
  /** Accessible name; the placeholder is not a label. */
  label: string;
}

const BORDER = 2;
const R = radius.lg;
const SWAP_STOPS = [0, 0.42, 0.5, 0.92, 1];

/**
 * Natural-language box with a glowing gradient border (terracotta, sun, emerald) that turns
 * slowly, a soft pulse and an icon that alternates sparkles / magnifier. Mirrors web `.ai-glow`.
 */
export function AiSearchBox({ label, multiline, ...rest }: Props) {
  const reduce = useReduceMotion();
  const [focused, setFocused] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const spin = useRef(new Animated.Value(0)).current;
  const swap = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) return;
    const spinLoop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true }));
    const swapLoop = Animated.loop(Animated.timing(swap, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }));
    spinLoop.start();
    swapLoop.start();
    return () => {
      spinLoop.stop();
      swapLoop.stop();
    };
  }, [reduce, spin, swap]);

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  // A square larger than the box diagonal, so rotating it never exposes an empty corner.
  const diag = Math.ceil(Math.hypot(size.w, size.h)) + 8;

  const iconA = {
    opacity: swap.interpolate({ inputRange: SWAP_STOPS, outputRange: [1, 1, 0, 0, 1] }),
    transform: [{ scale: swap.interpolate({ inputRange: SWAP_STOPS, outputRange: [1, 1, 0.6, 0.6, 1] }) }],
  };
  const iconB = {
    opacity: swap.interpolate({ inputRange: SWAP_STOPS, outputRange: [0, 0, 1, 1, 0] }),
    transform: [{ scale: swap.interpolate({ inputRange: SWAP_STOPS, outputRange: [0.6, 0.6, 1, 1, 0.6] }) }],
  };

  return (
    <View onLayout={onLayout} style={[styles.outer, focused && styles.outerFocused]}>
      <PulseRing color={colors.primary} borderRadius={R} />
      <View style={styles.clip}>
        {size.w > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: diag,
              height: diag,
              left: (size.w - diag) / 2 - BORDER,
              top: (size.h - diag) / 2 - BORDER,
              opacity: focused ? 1 : 0.6,
              transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            }}
          >
            <LinearGradient colors={gradients.ai} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
          </Animated.View>
        ) : null}
        <View style={[styles.inner, multiline && styles.innerMultiline]}>
          <View style={[styles.iconSlot, multiline && styles.iconSlotTop]} accessible={false}>
            <Animated.View style={[styles.iconLayer, iconA]}>
              <Icon name="sparkles" size={20} color={colors.primary} />
            </Animated.View>
            <Animated.View style={[styles.iconLayer, reduce ? { opacity: 0 } : iconB]}>
              <Icon name="search" size={20} color={colors.fresh} />
            </Animated.View>
          </View>
          <TextInput
            {...rest}
            multiline={multiline}
            accessibilityLabel={label}
            placeholderTextColor={colors.textMuted}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            style={[styles.input, multiline && styles.inputMultiline]}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: R,
    backgroundColor: colors.surface,
    shadowColor: '#1c1917',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  outerFocused: { shadowColor: colors.primary, shadowOpacity: 0.3 },
  clip: { borderRadius: R, overflow: 'hidden', padding: BORDER },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: R - BORDER,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    gap: 8,
  },
  innerMultiline: { alignItems: 'flex-start', paddingVertical: 8 },
  iconSlot: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  iconSlotTop: { marginTop: 10 },
  iconLayer: { position: 'absolute' },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text, paddingVertical: 10, outlineStyle: 'none' } as never,
  inputMultiline: { minHeight: 76 },
});
