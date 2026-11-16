import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

/** True when the user asked the OS to reduce motion; decorative loops should then stay still. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive) setReduce(value);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/** Same curve as the web `.reveal` animation, cubic-bezier(0.16, 1, 0.3, 1). */
export const easeOutSoft = Easing.bezier(0.16, 1, 0.3, 1);
