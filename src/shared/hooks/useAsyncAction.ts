import { useCallback, useRef, useState } from 'react';

/**
 * Runs one async action at a time. The lock is a ref, so a second tap that lands before React
 * re-renders (and disables the button) is still ignored: no double submit, no duplicated request.
 * `run` resolves to `undefined` when it was ignored.
 */
export function useAsyncAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (locked.current) return undefined;
    locked.current = true;
    setBusy(true);
    try {
      return await action();
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }, []);
  return { busy, run };
}
