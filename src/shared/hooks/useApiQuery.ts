import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

interface QueryState<T> {
  key: string;
  data?: T;
  error?: unknown;
}

interface Options {
  /** Skips the request while false (waiting for a parameter). */
  enabled?: boolean;
  /** Reloads silently when the screen regains focus, keeping the previous data on screen. */
  refetchOnFocus?: boolean;
}

export interface Query<T> {
  data: T | undefined;
  error: unknown;
  /** True while a request is in flight (also during silent reloads). */
  loading: boolean;
  /** True only when there is nothing to show yet. */
  initialLoading: boolean;
  refetch: () => void;
}

/**
 * Runs `fetcher` whenever `deps` change. Loading is derived by comparing keys so the effect never
 * sets state synchronously, and a failed reload keeps the last good data.
 */
export function useApiQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
  { enabled = true, refetchOnFocus = false }: Options = {},
): Query<T> {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<QueryState<T> | null>(null);
  const key = `${tick}|${JSON.stringify(deps)}`;
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ key, data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState((prev) => ({ key, data: prev?.data, error }));
      });
    return () => controller.abort();
  }, [key, enabled]);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      if (refetchOnFocus) setTick((t) => t + 1);
    }, [refetchOnFocus]),
  );

  const loading = enabled && state?.key !== key;
  const data = state?.data;
  return {
    data,
    error: loading ? undefined : state?.error,
    loading,
    initialLoading: loading && data === undefined,
    refetch: () => setTick((t) => t + 1),
  };
}
