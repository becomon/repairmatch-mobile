import { tones, type Tone } from '@/shared/ui';
import type { Service, ServiceStatus } from '@/shared/api/types';

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

/** In progress: still scheduled or being worked on. */
export function isActiveService(service: Pick<Service, 'status'>): boolean {
  return service.status === 'PROGRAMADO' || service.status === 'EN_ATENCION';
}
