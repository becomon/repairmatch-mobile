import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useReduceMotion } from './motion';

interface Props {
  color: string;
  borderRadius: number;
  /** Peak ring opacity. */
  strength?: number;
}

/** Soft expanding ring, like the web `ai-pulse` keyframes. Static and invisible with reduced motion. */
export function PulseRing({ color, borderRadius, strength = 0.35 }: Props) {
  const reduce = useReduceMotion();
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 2600, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduce, t]);

  if (reduce) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          borderRadius,
          borderColor: color,
          opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [strength, 0, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1.035, 1.035] }) }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: { ...StyleSheet.absoluteFill, borderWidth: 2 },
});
