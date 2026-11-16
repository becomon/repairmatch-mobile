import { listApplianceTypes } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

/** The catalog of appliance types the backend serves. */
export function useApplianceTypes() {
  return useApiQuery((signal) => listApplianceTypes({ signal }), []);
}
