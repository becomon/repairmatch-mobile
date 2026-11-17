import { tones, type Tone } from '@/shared/ui';
import type { RequestStatus } from '@/shared/api/types';

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

export function isOpenRequest(status: RequestStatus): boolean {
  return status === 'PUBLICADA' || status === 'CON_PROPUESTAS';
}
