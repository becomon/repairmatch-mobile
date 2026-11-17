import { requestsApi } from '@/shared/api/endpoints';
import { onSessionEnd } from '@/shared/api/session';
import type { ServiceRequest } from '@/shared/api/types';
import { REQUEST_CACHE_TTL_MS } from '@/shared/constants';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

const cache = new Map<number, { at: number; value: Promise<ServiceRequest> }>();

// Another account must never see the previous one's requests, however the session ended.
onSessionEnd(() => cache.clear());

/** Lists show one card per request/service; this shares one GET between cards and screens for a few seconds. */
function loadRequest(id: number): Promise<ServiceRequest> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < REQUEST_CACHE_TTL_MS) return hit.value;
  const value = requestsApi.get(id);
  cache.set(id, { at: Date.now(), value });
  // A failed load must not be served again.
  value.catch(() => {
    if (cache.get(id)?.value === value) cache.delete(id);
  });
  return value;
}

/** Drops the shared copy after a mutation so the next read is fresh. */
export function invalidateRequest(id: number) {
  cache.delete(id);
}

/** The request behind a card (appliance name, brand, status). Undefined while loading or on error. */
export function useRequestSummary(id: number): ServiceRequest | undefined {
  return useApiQuery(() => loadRequest(id), [id]).data;
}
