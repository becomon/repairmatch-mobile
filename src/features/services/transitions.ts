import type { Role, ServiceStatus, ServiceStatusUpdate } from '@/shared/api/types';

export interface Transition {
  next: ServiceStatusUpdate;
  label: string;
  danger: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

/**
 * Allowed moves per the API contract:
 * technician PROGRAMADO -> EN_ATENCION -> COMPLETADO, and either role PROGRAMADO -> CANCELADO.
 */
export function transitionsFor(status: ServiceStatus, role: Role): Transition[] {
  const result: Transition[] = [];
  if (role === 'TECHNICIAN' && status === 'PROGRAMADO') {
    result.push({
      next: 'EN_ATENCION',
      label: 'Iniciar atención',
      danger: false,
      title: '¿Iniciar este servicio ahora?',
      message: 'El cliente verá que ya empezaste la reparación.',
      confirmLabel: 'Iniciar atención',
      cancelLabel: 'Volver',
    });
  }
  if (role === 'TECHNICIAN' && status === 'EN_ATENCION') {
    result.push({
      next: 'COMPLETADO',
      label: 'Marcar como completado',
      danger: false,
      title: '¿Marcar como completado?',
      message: 'Cierra la reparación y permite que el cliente deje su reseña.',
      confirmLabel: 'Completar servicio',
      cancelLabel: 'Seguir en atención',
    });
  }
  if (status === 'PROGRAMADO') {
    result.push({
      next: 'CANCELADO',
      label: 'Cancelar servicio',
      danger: true,
      title: '¿Cancelar este servicio?',
      message: 'No se puede deshacer. Solo puedes cancelar antes de que empiece la atención.',
      confirmLabel: 'Sí, cancelar',
      cancelLabel: 'Mantener servicio',
    });
  }
  return result;
}
