import type { MatchingRequest } from '@/shared/api/types';

/** The opportunity screen has no endpoint of its own, so the card it came from travels as a route param. */
export function opportunityParams(request: MatchingRequest): { id: string; data: string } {
  return { id: String(request.requestId), data: JSON.stringify(request) };
}

/** Reads the param back; null when it is missing or not an opportunity. */
export function parseOpportunity(raw: string | undefined): MatchingRequest | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<MatchingRequest>;
    return typeof value.requestId === 'number' && typeof value.description === 'string' ? (value as MatchingRequest) : null;
  } catch {
    return null;
  }
}
