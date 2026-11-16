export interface CreateEvidence {
  mediaUrl: string;
  mediaType: string;
}

export interface Evidence extends CreateEvidence {
  requestId: number;
  evidenceNumber: number;
}

// Inject the mobile app's authenticated client; never handle tokens here.
export interface EvidenceApiClient {
  request<T>(path: string, options?: {
    method?: 'POST';
    body?: CreateEvidence;
    signal?: AbortSignal;
  }): Promise<T>;
}

/**
 * The only place that knows the evidence endpoints. It takes the client as a parameter so it can
 * be tested without the network; `client.ts` binds it to the app's single authenticated client.
 */
export function createEvidenceApi(api: EvidenceApiClient) {
  function path(id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid request ID.');
    return `/requests/${id}/evidences`;
  }
  return {
    add: (id: number, body: CreateEvidence) =>
      api.request<Evidence>(path(id), { method: 'POST', body }),
    list: (id: number, options: { signal?: AbortSignal } = {}) =>
      api.request<Evidence[]>(path(id), options.signal ? { signal: options.signal } : undefined),
  };
}

export type EvidenceApi = ReturnType<typeof createEvidenceApi>;
