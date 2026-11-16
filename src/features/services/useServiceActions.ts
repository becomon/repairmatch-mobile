import { useState } from 'react';
import { friendlyError } from '@/shared/api/errors';
import { servicesApi } from '@/shared/api/endpoints';
import type { Role, Service } from '@/shared/api/types';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { transitionsFor, type Transition } from './transitions';

/**
 * Status buttons of a service with their confirmation sheet; PATCH /services/{id}/status?status=X.
 * `primaryOnly` keeps only the forward action (list cards); the detail screen also offers cancel.
 */
export function useServiceActions(
  service: Service,
  role: Role,
  { onChanged, onFailed }: { onChanged: (service: Service) => void; onFailed?: (() => void) | undefined },
  primaryOnly: boolean,
) {
  const [pending, setPending] = useState<Transition | null>(null);
  const [error, setError] = useState('');
  const { busy, run } = useAsyncAction();
  const all = transitionsFor(service.status, role);
  const transitions = primaryOnly ? all.filter((t) => !t.danger) : all;

  const confirm = () =>
    run(async () => {
      if (!pending) return;
      setError('');
      try {
        const updated = await servicesApi.setStatus(service.id, pending.next);
        setPending(null);
        onChanged(updated);
      } catch (cause) {
        setPending(null);
        setError(friendlyError(cause));
        // The other participant may have moved the service first (a 409): reload the real state.
        onFailed?.();
      }
    });

  return { transitions, pending, setPending, busy, error, confirm };
}
