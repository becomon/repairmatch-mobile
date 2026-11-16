import { useMemo } from 'react';
import { applianceVisual } from '@/features/catalog/appliances';
import { techniciansApi } from '@/shared/api/endpoints';
import type { MatchingRequest } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { pluralize } from '@/shared/format';

/** Radius of the soft circle drawn for one nearby request (the real home is never shown). */
export const DEMAND_CIRCLE_METERS = 350;
const PAGE_SIZE = 50;

/** One nearby request, located at the server's approximate point (a ~550 m grid), never the exact one. */
export interface DemandPoint {
  requestId: number;
  latitude: number;
  longitude: number;
  distanceKm: number;
  /** Spanish appliance label, e.g. "Lavadora". */
  label: string;
  /** Appliance colour used to tint the circle. */
  color: string;
  request: MatchingRequest;
}

export interface Demand {
  points: DemandPoint[];
  /** True once at least one of the two lists answered; false while loading or when both failed. */
  ready: boolean;
}

/** Merges both lists (dedupe by requestId) and keeps requests with an approximate point. */
export function collectDemand(lists: readonly (readonly MatchingRequest[] | undefined)[]): DemandPoint[] {
  const seen = new Map<number, DemandPoint>();
  for (const list of lists) {
    for (const r of list ?? []) {
      if (seen.has(r.requestId)) continue;
      if (typeof r.approxLatitude !== 'number' || typeof r.approxLongitude !== 'number') continue;
      const visual = applianceVisual(r.applianceTypeName);
      seen.set(r.requestId, {
        requestId: r.requestId,
        latitude: r.approxLatitude,
        longitude: r.approxLongitude,
        distanceKm: r.distanceKm,
        label: visual.label,
        color: visual.fg,
        request: r,
      });
    }
  }
  return [...seen.values()].sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Only the points inside the radius, so the overlay follows the radius being edited. */
export function withinRadius(points: DemandPoint[], radiusKm: number): DemandPoint[] {
  return points.filter((p) => p.distanceKm <= radiusKm);
}

export function demandSummary(count: number): string {
  if (count === 0) return 'Aún no hay solicitudes en tu zona';
  return `${pluralize(count, 'cliente busca', 'clientes buscan')} técnico en tu zona`;
}

/** "#c94a14" + 0.2 -> "rgba(201,74,20,0.2)". Non-hex input falls back to the brand colour. */
export function withAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) return `rgba(201,74,20,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/**
 * Fetches the first page of "Para ti" and "Oportunidades" and merges them. Failures are silent: the
 * overlay just does not show, and one list failing still leaves the other.
 */
export function useNearbyDemand(): Demand {
  const recommended = useApiQuery((signal) => techniciansApi.recommendedRequests(0, PAGE_SIZE, { signal }), [], { refetchOnFocus: true });
  const matching = useApiQuery((signal) => techniciansApi.matchingRequests(0, PAGE_SIZE, { signal }), [], { refetchOnFocus: true });
  const recData = recommended.data;
  const matData = matching.data;
  const points = useMemo(
    () => collectDemand([recData?.content.map((c) => c.request), matData?.content]),
    [recData, matData],
  );
  const settled = !recommended.initialLoading && !matching.initialLoading;
  return { points, ready: settled && (recData !== undefined || matData !== undefined) };
}
