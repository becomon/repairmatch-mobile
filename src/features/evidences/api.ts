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

export function createEvidenceApi(api: EvidenceApiClient) {
  function path(id: number) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid request ID.');
    return `/requests/${id}/evidences`;
  }
  return {
    add: (id: number, body: CreateEvidence) =>
      api.request<Evidence>(path(id), { method: 'POST', body }),
    list: (id: number) => api.request<Evidence[]>(path(id)),
  };
}

export type EvidenceApi = ReturnType<typeof createEvidenceApi>;
