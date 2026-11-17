import type { ApiClient } from './client';
export interface ServiceRequest { id: number; originalDescription: string; status: string; applianceTypeName: string; latitude: number | null; longitude: number | null }
export interface Page<T> { content: T[]; last: boolean }
export interface ApplianceType { id: number; name: string }
export interface NewRequest { applianceTypeId: number; originalDescription: string; brand?: string; model?: string; latitude?: number; longitude?: number }
export function createRequestsApi(api: ApiClient) {
  return {
    list: (page: number) => api.request<Page<ServiceRequest>>(`/requests?page=${page}&size=20`),
    get: (id: number) => api.request<ServiceRequest>(`/requests/${id}`),
    types: () => api.request<ApplianceType[]>('/appliance-types'),
    create: (body: NewRequest) => api.request<ServiceRequest>('/requests', { method: 'POST', body }),
    location: (id: number, body: { latitude: number; longitude: number }) => api.request<ServiceRequest>(`/requests/${id}/location`, { method: 'PATCH', body }),
    cancel: (id: number) => api.request<ServiceRequest>(`/requests/${id}/cancel`, { method: 'PATCH' }),
  };
}
