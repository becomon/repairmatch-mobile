import { useState } from 'react';
import { View } from 'react-native';
import { friendlyError } from '@/shared/api/errors';
import { servicesApi } from '@/shared/api/endpoints';
import type { Role, Service } from '@/shared/api/types';
import { Banner, Button, ConfirmDialog } from '@/shared/ui';
import { transitionsFor, type Transition } from './transitions';

interface Props {
  service: Service;
  role: Role;
  onChanged: (service: Service) => void;
  /** Only the forward action (list cards); the detail screen also shows cancel. */
  primaryOnly?: boolean;
}

/** Status buttons with a confirmation sheet; PATCH /services/{id}/status?status=X. */
export function ServiceActions({ service, role, onChanged, primaryOnly = false }: Props) {
  const [pending, setPending] = useState<Transition | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const all = transitionsFor(service.status, role);
  const transitions = primaryOnly ? all.filter((t) => !t.danger) : all;
  if (transitions.length === 0) return null;

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    setError('');
    try {
      const updated = await servicesApi.setStatus(service.id, pending.next);
      setPending(null);
      onChanged(updated);
    } catch (cause) {
      setPending(null);
      setError(friendlyError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      {error ? <Banner tone="danger" message={error} /> : null}
      {transitions.map((t) => (
        <Button key={t.next} label={t.label} variant={t.danger ? 'danger' : 'primary'} onPress={() => setPending(t)} />
      ))}
      <ConfirmDialog
        visible={!!pending}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={pending?.confirmLabel ?? ''}
        cancelLabel={pending?.cancelLabel}
        destructive={pending?.danger}
        loading={busy}
        onConfirm={() => void confirm()}
        onCancel={() => setPending(null)}
      />
    </View>
  );
}
