import { useCallback, useSyncExternalStore } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import { onSessionEnd } from '@/shared/api/session';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { uploadEvidence } from './client';

/**
 * Photos picked while publishing that failed to upload, kept in memory per request so the client
 * can retry with one tap instead of taking them again. It is a tiny external store: screens read
 * it through `usePendingPhotos`, so they re-render when it changes.
 */
interface PendingState {
  photos: readonly ImagePickerAsset[];
  /** Human-readable cause of the last failed upload, so the user (and we) know why. */
  error: string | null;
}

const EMPTY: PendingState = { photos: [], error: null };
const pending = new Map<number, PendingState>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

onSessionEnd(() => {
  pending.clear();
  emit();
});

function describeUploadError(error: unknown): string {
  if (error && typeof error === 'object' && 'status' in error && typeof (error as { status: unknown }).status === 'number') {
    const status = (error as { status: number }).status;
    if (status === 0) return 'Sin conexión con el servidor.';
    return `El servidor rechazó la foto (código ${status}).`;
  }
  return error instanceof Error && error.message ? error.message : 'Error desconocido.';
}

/** Remembers the photos that are still not uploaded; an empty list forgets the request. */
export function recordPendingPhotos(requestId: number, photos: ImagePickerAsset[], lastError: unknown): void {
  if (photos.length === 0) pending.delete(requestId);
  else pending.set(requestId, { photos, error: describeUploadError(lastError) });
  emit();
}

/** Uploads every photo of a new request. A failed photo never aborts the rest; returns how many failed. */
export async function uploadRequestPhotos(
  requestId: number,
  photos: ImagePickerAsset[],
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  const failed: ImagePickerAsset[] = [];
  let lastError: unknown = null;
  for (let index = 0; index < photos.length; index++) {
    onProgress?.(index + 1, photos.length);
    try {
      await uploadEvidence(requestId, photos[index]!);
    } catch (error) {
      lastError = error;
      failed.push(photos[index]!);
    }
  }
  recordPendingPhotos(requestId, failed, lastError);
  return failed.length;
}

export interface PendingPhotos {
  count: number;
  error: string | null;
  retrying: boolean;
  /** Retries every pending photo; resolves to how many were pending, how many still are and why. */
  retry: () => Promise<{ before: number; left: number; error: string | null } | undefined>;
}

export function usePendingPhotos(requestId: number): PendingPhotos {
  const state = useSyncExternalStore(subscribe, () => pending.get(requestId) ?? EMPTY, () => EMPTY);
  const { busy, run } = useAsyncAction();
  const retry = useCallback(
    () =>
      run(async () => {
        const before = pending.get(requestId)?.photos.length ?? 0;
        const left = await uploadRequestPhotos(requestId, [...(pending.get(requestId)?.photos ?? [])]);
        return { before, left, error: pending.get(requestId)?.error ?? null };
      }),
    [requestId, run],
  );
  return { count: state.photos.length, error: state.error, retrying: busy, retry };
}
