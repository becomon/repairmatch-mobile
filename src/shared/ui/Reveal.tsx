import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { easeOutSoft, useReduceMotion } from './motion';

interface Props {
  children: React.ReactNode;
  /** Position in a list; each step adds a small delay so items arrive one after another. */
  index?: number;
  style?: ViewStyle;
}

const STEP_MS = 70;
const MAX_STEPS = 8;

/** Entrance: fade in while rising 24pt, 600ms ease-out (web `.reveal`). Staggered by `index`. */
export function Reveal({ children, index = 0, style }: Props) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      progress.setValue(1);
      return;
    }
    const run = Animated.timing(progress, {
      toValue: 1,
      duration: 600,
      delay: Math.min(index, MAX_STEPS) * STEP_MS,
      easing: easeOutSoft,
      useNativeDriver: true,
    });
    run.start();
    return () => run.stop();
  }, [index, progress, reduce]);

  return (
    <Animated.View
      style={[
        style,
        { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
