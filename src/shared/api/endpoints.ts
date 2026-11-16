import { api } from './client';
import { seg, withQuery } from './paths';
import type {
  AiSearchResult,
  ApplianceType,
  CreateProposalBody,
  CreateRequestBody,
  CreateReviewBody,
  IdentitySession,
  IdentityState,
  MatchingRequest,
  Page,
  Proposal,
  RecommendedProposal,
  RecommendedRequest,
  RegisterBody,
  Review,
  Service,
  ServiceAreaBody,
  ServiceRequest,
  ServiceStatusUpdate,
  StructuredFault,
  TechnicianProfile,
  TechnicianProfileUpdate,
  TechnicianReputation,
  TokenPair,
  User,
  RequestsQuery,
} from './types';

type Opts = { signal?: AbortSignal };

// Auth ---------------------------------------------------------------------

export const authApi = {
  login: (email: string, password: string) =>
    api.request<TokenPair>('/auth/login', { method: 'POST', body: { email, password }, anonymous: true }),
  register: (body: RegisterBody) =>
    api.request<User>('/auth/register', { method: 'POST', body, anonymous: true }),
  logout: (refreshToken: string) =>
    api.send('/auth/logout', { method: 'POST', body: { refreshToken }, anonymous: true }),
  me: (o?: Opts) => api.request<User>('/users/me', o),
};

// Catalog ------------------------------------------------------------------

export const listApplianceTypes = (o?: Opts) => api.request<ApplianceType[]>('/appliance-types', o);

// Client requests ----------------------------------------------------------

export const requestsApi = {
  create: (body: CreateRequestBody) => api.request<ServiceRequest>('/requests', { method: 'POST', body }),
  list: (q: RequestsQuery = {}, o?: Opts) =>
    api.request<Page<ServiceRequest>>(
      withQuery('/requests', { page: q.page, size: q.size, status: q.status, search: q.search, sort: q.sort }),
      o,
    ),
  get: (id: number, o?: Opts) => api.request<ServiceRequest>(`/requests/${seg(id)}`, o),
  cancel: (id: number) => api.request<ServiceRequest>(`/requests/${seg(id)}/cancel`, { method: 'PATCH' }),
  setLocation: (id: number, latitude: number, longitude: number) =>
    api.request<ServiceRequest>(`/requests/${seg(id)}/location`, { method: 'PATCH', body: { latitude, longitude } }),
  service: (id: number, o?: Opts) => api.request<Service>(`/requests/${seg(id)}/service`, o),
};

// Proposals ----------------------------------------------------------------

export const proposalsApi = {
  recommended: (requestId: number, o?: Opts) =>
    api.request<RecommendedProposal[]>(`/requests/${seg(requestId)}/proposals/recommended`, o),
  list: (requestId: number, o?: Opts) => api.request<Proposal[]>(`/requests/${seg(requestId)}/proposals`, o),
  accept: (proposalId: number) => api.request<Service>(`/proposals/${seg(proposalId)}/accept`, { method: 'POST' }),
  submit: (requestId: number, body: CreateProposalBody) =>
    api.request<Proposal>(`/requests/${seg(requestId)}/proposals`, { method: 'POST', body }),
};

// Services and reviews -----------------------------------------------------

export const servicesApi = {
  list: (o?: Opts) => api.request<Service[]>('/services', o),
  get: (id: number, o?: Opts) => api.request<Service>(`/services/${seg(id)}`, o),
  // The status travels as a query parameter; the request has no body.
  setStatus: (id: number, status: ServiceStatusUpdate) =>
    api.request<Service>(withQuery(`/services/${seg(id)}/status`, { status }), { method: 'PATCH' }),
  review: (id: number, o?: Opts) => api.request<Review>(`/services/${seg(id)}/review`, o),
  createReview: (id: number, body: CreateReviewBody) =>
    api.request<Review>(`/services/${seg(id)}/review`, { method: 'POST', body }),
};

// Technicians --------------------------------------------------------------

export const techniciansApi = {
  profile: (o?: Opts) => api.request<TechnicianProfile>('/technicians/me/profile', o),
  updateProfile: (body: TechnicianProfileUpdate) =>
    api.request<TechnicianProfile>('/technicians/me/profile', { method: 'PUT', body }),
  updateArea: (body: ServiceAreaBody) =>
    api.request<TechnicianProfile>('/technicians/me/service-areas', { method: 'PUT', body }),
  recommendedRequests: (page = 0, size = 10, o?: Opts) =>
    api.request<Page<RecommendedRequest>>(
      withQuery('/technicians/me/recommended-requests', { page, size }),
      o,
    ),
  matchingRequests: (page = 0, size = 10, o?: Opts) =>
    api.request<Page<MatchingRequest>>(withQuery('/technicians/me/matching-requests', { page, size }), o),
  myProposals: (page = 0, size = 10, o?: Opts) =>
    api.request<Page<Proposal>>(withQuery('/technicians/me/proposals', { page, size }), o),
  publicProfile: (id: string, o?: Opts) => api.request<TechnicianProfile>(`/technicians/${seg(id)}`, o),
  reputation: (id: string, o?: Opts) => api.request<TechnicianReputation>(`/technicians/${seg(id)}/reputation`, o),
  reviews: (id: string, o?: Opts) => api.request<Review[]>(`/technicians/${seg(id)}/reviews`, o),
};

// Identity verification (Didit) ---------------------------------------------

export const identityApi = {
  state: (o?: Opts) => api.request<IdentityState>('/verification/identity', o),
  start: () => api.request<IdentitySession>('/verification/identity/session', { method: 'POST' }),
};

// Local AI -----------------------------------------------------------------

export const aiApi = {
  structure: (description: string) =>
    api.request<StructuredFault>('/ai/structure-request', { method: 'POST', body: { description } }),
  search: (query: string, page = 0, size = 20) =>
    api.request<AiSearchResult>('/ai/search', { method: 'POST', body: { query, page, size } }),
};
