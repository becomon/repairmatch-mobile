import { applianceTitle } from '@/features/catalog';
import type { ServiceRequest } from '@/shared/api/types';

/** "Lavadora Samsung": the appliance and, when known, its brand. */
export function requestTitle(r: Pick<ServiceRequest, 'applianceTypeName' | 'brand'>): string {
  return applianceTitle(r.applianceTypeName, r.brand);
}
