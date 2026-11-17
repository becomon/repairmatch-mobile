import type { ApiClient } from './client';
import type { Page } from './requests';
export interface Proposal { id: number; technicianName: string; diagnosticCost: number; availableAt: string; conditions: string; status: string; requestId: number }
export interface Service { id: number; requestId: number; technicianName: string; status: string }
export interface Review { rating: number; comment: string }
export interface Profile { fullName: string; bio?: string; phone?: string; experienceYears?: number; applianceTypes: string[]; latitude?: number; longitude?: number; maxRadiusKm?: number }
export interface Match { requestId: number; applianceTypeName: string; description: string; distanceKm: number }
export function createWorkflowApi(api: ApiClient) {
  return {
    proposals: (id: number) => api.request<Proposal[]>(`/requests/${id}/proposals`),
    accept: (id: number) => api.request<Service>(`/proposals/${id}/accept`, { method: 'POST' }),
    services: () => api.request<Service[]>('/services'),
    status: (id: number, status: 'EN_ATENCION' | 'COMPLETADO' | 'CANCELADO') => api.request<Service>(`/services/${id}/status?status=${status}`, { method: 'PATCH' }),
    review: (id: number) => api.request<Review>(`/services/${id}/review`),
    saveReview: (id: number, body: Review) => api.request<Review>(`/services/${id}/review`, { method: 'POST', body }),
    profile: () => api.request<Profile>('/technicians/me/profile'),
    saveProfile: (body: { bio: string; phone: string; experienceYears: number; applianceTypeIds: number[] }) => api.request<Profile>('/technicians/me/profile', { method: 'PUT', body }),
    area: (body: { latitude: number; longitude: number; maxRadiusKm: number }) => api.request<Profile>('/technicians/me/service-areas', { method: 'PUT', body }),
    matches: (page: number) => api.request<Page<Match>>(`/technicians/me/matching-requests?page=${page}&size=20`),
    ownProposals: (page: number) => api.request<Page<Proposal>>(`/technicians/me/proposals?page=${page}&size=20`),
    propose: (id: number, body: { diagnosticCost: number; availableAt: string; conditions: string }) => api.request<Proposal>(`/requests/${id}/proposals`, { method: 'POST', body }),
  };
}
