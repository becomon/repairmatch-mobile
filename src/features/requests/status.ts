import { tones, type Tone } from '@/shared/ui';
import type { ProposalStatus, RequestStatus, ServiceStatus } from '@/shared/api/types';

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  PUBLICADA: 'Publicada',
  CON_PROPUESTAS: 'Con propuestas',
  CERRADA: 'Cerrada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
};

export const REQUEST_STATUS_TONE: Record<RequestStatus, Tone> = {
  PUBLICADA: tones.primarySoft,
  CON_PROPUESTAS: tones.fresh,
  CERRADA: tones.success,
  CANCELADA: tones.neutral,
  EXPIRADA: tones.warning,
};

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  PROGRAMADO: 'Programado',
  EN_ATENCION: 'En atención',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

export const SERVICE_STATUS_TONE: Record<ServiceStatus, Tone> = {
  PROGRAMADO: tones.neutral,
  EN_ATENCION: tones.primarySoft,
  COMPLETADO: tones.fresh,
  CANCELADO: tones.danger,
};

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'No elegida',
};

export const PROPOSAL_STATUS_TONE: Record<ProposalStatus, Tone> = {
  PENDING: tones.primarySoft,
  ACCEPTED: tones.fresh,
  REJECTED: tones.neutral,
};

export function isOpenRequest(status: RequestStatus): boolean {
  return status === 'PUBLICADA' || status === 'CON_PROPUESTAS';
}
