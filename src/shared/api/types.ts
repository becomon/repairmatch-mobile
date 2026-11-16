// Shapes of docs/API_CONTRACT.md (backend). They describe the JSON, not runtime validation.

export type Uuid = string;
export type LocalDateTimeString = string;

export type Role = 'CLIENT' | 'TECHNICIAN';

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TokenPair {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
}

export interface User {
  id: Uuid;
  name: string;
  email: string;
  role: Role;
  /** Passed the optional Didit identity verification. */
  identityVerified?: boolean;
  /** Profile name matches the verified document (null/omitted: unknown). */
  identityNameMatches?: boolean | null;
}

export type IdentityStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

/** GET /verification/identity. */
export interface IdentityState {
  status: IdentityStatus;
  verifiedAt: LocalDateTimeString | null;
  /** Profile name matches the verified document (null/omitted: unknown). */
  nameMatches?: boolean | null;
}

/** POST /verification/identity/session: open `url` to verify. */
export interface IdentitySession {
  url: string;
  status: IdentityStatus;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface ApplianceType {
  id: number;
  name: string;
  description: string | null;
}

export type RequestStatus =
  | 'PUBLICADA'
  | 'CON_PROPUESTAS'
  | 'CERRADA'
  | 'CANCELADA'
  | 'EXPIRADA';

export interface ServiceRequest {
  id: number;
  clientId: Uuid;
  applianceTypeId: number;
  applianceTypeName: string;
  originalDescription: string;
  brand: string | null;
  model: string | null;
  status: RequestStatus;
  latitude: number | null;
  longitude: number | null;
  createdAt: LocalDateTimeString;
}

export interface CreateRequestBody {
  applianceTypeId: number;
  originalDescription: string;
  brand?: string | null;
  model?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface RequestsQuery {
  page?: number;
  size?: number;
  status?: RequestStatus;
  search?: string;
  sort?: 'newest' | 'oldest';
}

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Proposal {
  id: number;
  requestId: number;
  technicianId: Uuid;
  technicianName: string;
  diagnosticCost: number;
  availableAt: LocalDateTimeString;
  conditions: string;
  createdAt: LocalDateTimeString;
  status: ProposalStatus;
  /** The technician passed identity verification (show the badge). */
  identityVerified?: boolean;
  /** The technician's profile name matches the verified document (null: unknown). */
  identityNameMatches?: boolean | null;
}

export interface CreateProposalBody {
  diagnosticCost: number;
  availableAt: LocalDateTimeString;
  conditions: string;
}

export interface Factor {
  key: string;
  weight: number;
  value: number;
}

export interface Reason {
  code: string;
  label: string;
}

export interface RecommendedProposal {
  proposal: Proposal;
  score: number;
  recommended: boolean;
  distanceKm: number | null;
  averageRating: number;
  reviewCount: number;
  factors: Factor[];
  reasons: Reason[];
}

export interface MatchingRequest {
  requestId: number;
  applianceTypeName: string;
  brand: string | null;
  model: string | null;
  description: string;
  status: RequestStatus;
  distanceKm: number;
  /** The client who published it passed identity verification. */
  clientIdentityVerified?: boolean;
  /** The client's profile name matches their verified document (null: unknown). */
  clientIdentityNameMatches?: boolean | null;
  /** Request location snapped to a ~550 m grid; null when the request has no location. Never the exact point. */
  approxLatitude?: number | null;
  approxLongitude?: number | null;
}

export interface RecommendedRequest {
  request: MatchingRequest;
  createdAt: LocalDateTimeString;
  proposalCount: number;
  symptom: string | null;
  score: number;
  factors: Factor[];
  reasons: Reason[];
}

export type ServiceStatus = 'PROGRAMADO' | 'EN_ATENCION' | 'COMPLETADO' | 'CANCELADO';
export type ServiceStatusUpdate = Exclude<ServiceStatus, 'PROGRAMADO'>;

export interface Service {
  id: number;
  proposalId: number;
  status: ServiceStatus;
  createdAt: LocalDateTimeString;
  requestId: number;
  clientId: Uuid;
  technicianId: Uuid;
  technicianName: string;
}

export interface Review {
  id: number;
  serviceId: number;
  rating: number;
  comment: string;
  createdAt: LocalDateTimeString;
}

export interface CreateReviewBody {
  rating: number;
  comment: string;
}

export interface TechnicianProfile {
  id: Uuid;
  fullName: string;
  email?: string;
  experienceYears?: number;
  bio?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  maxRadiusKm?: number;
  applianceTypes: string[];
  identityVerified?: boolean;
  identityNameMatches?: boolean | null;
}

export interface TechnicianProfileUpdate {
  experienceYears?: number | null;
  bio?: string | null;
  phone?: string | null;
  applianceTypeIds?: number[] | null;
}

export interface ServiceAreaBody {
  latitude: number;
  longitude: number;
  maxRadiusKm: number;
}

export interface TechnicianReputation {
  technicianId: Uuid;
  averageRating: number;
  reviewCount: number;
}

export interface Field {
  value: string;
  label: string;
  confidence: number;
  confident: boolean;
}

export interface StructuredFault {
  applianceTypeId: number | null;
  appliance: Field | null;
  symptom: Field | null;
  brand: string | null;
  model: string | null;
  originalDescription: string;
  source: string;
}

export interface SearchChip {
  key: string;
  label: string;
  value: string;
}

export interface AiSearchResult {
  query: string;
  understood: SearchChip[];
  results: Page<ServiceRequest>;
  source: string;
}
