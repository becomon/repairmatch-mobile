import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Page } from '../api/types';

interface ListState<T> {
  key: string;
  items: T[];
  page: number;
  last: boolean;
  total: number;
  error?: unknown;
}

interface Options {
  refetchOnFocus?: boolean;
  enabled?: boolean;
}

export interface PagedList<T> {
  items: T[];
  total: number;
  error: unknown;
  /** First page loading and nothing on screen yet. */
  initialLoading: boolean;
  /** Reloading page 0 while items are visible (pull to refresh). */
  refreshing: boolean;
  loadingMore: boolean;
  loadMoreError: unknown;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
}

/** Infinite list over a 0-based `Page` endpoint: reloads page 0 when `deps` change. */
export function usePagedList<T>(
  fetchPage: (page: number, signal?: AbortSignal) => Promise<Page<T>>,
  deps: readonly unknown[],
  { refetchOnFocus = false, enabled = true }: Options = {},
): PagedList<T> {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<ListState<T> | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<unknown>(null);
  const key = `${tick}|${JSON.stringify(deps)}`;

  const fetchRef = useRef(fetchPage);
  const stateRef = useRef(state);
  const keyRef = useRef(key);
  useEffect(() => {
    fetchRef.current = fetchPage;
    stateRef.current = state;
    keyRef.current = key;
  });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    fetchRef
      .current(0, controller.signal)
      .then((p) => {
        if (controller.signal.aborted) return;
        setLoadMoreError(null);
        setState({ key, items: p.content, page: p.page, last: p.last, total: p.totalElements });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          key,
          items: prev?.items ?? [],
          page: prev?.page ?? 0,
          last: true,
          total: prev?.total ?? 0,
          error,
        }));
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

  // A ref, not the state: `onEndReached` can fire twice before React re-renders, and two requests
  // for the same page would append its rows twice.
  const loadingMoreRef = useRef(false);
  const loadMore = useCallback(() => {
    const current = stateRef.current;
    if (!current || current.key !== keyRef.current || current.last || current.error || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);
    const requestKey = keyRef.current;
    fetchRef
      .current(current.page + 1)
      .then((p) => {
        if (keyRef.current !== requestKey) return;
        setState((prev) =>
          prev && prev.key === requestKey
            ? { ...prev, items: [...prev.items, ...p.content], page: p.page, last: p.last, total: p.totalElements }
            : prev,
        );
      })
      .catch((error: unknown) => {
        if (keyRef.current === requestKey) setLoadMoreError(error);
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, []);

  const stale = enabled && state?.key !== key;
  const hasItems = (state?.items.length ?? 0) > 0;
  return {
    items: state?.items ?? [],
    total: state?.total ?? 0,
    error: stale ? undefined : state?.error,
    initialLoading: stale && !hasItems && !state?.error,
    refreshing: stale && (hasItems || !!state?.error),
    loadingMore,
    loadMoreError,
    hasMore: !!state && !state.last && !state.error,
    refresh: () => setTick((t) => t + 1),
    loadMore,
  };
}
