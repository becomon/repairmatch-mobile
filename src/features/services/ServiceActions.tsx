import { View } from 'react-native';
import type { Role, Service } from '@/shared/api/types';
import { Banner, Button, ConfirmDialog } from '@/shared/ui';
import { useServiceActions } from './useServiceActions';

interface Props {
  service: Service;
  role: Role;
  onChanged: (service: Service) => void;
  /** The change failed; the screen should reload the real state. */
  onFailed?: () => void;
  /** Only the forward action (list cards); the detail screen also shows cancel. */
  primaryOnly?: boolean;
}

export function ServiceActions({ service, role, onChanged, onFailed, primaryOnly = false }: Props) {
  const actions = useServiceActions(service, role, { onChanged, onFailed }, primaryOnly);
  const { pending } = actions;
  if (actions.transitions.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      {actions.error ? <Banner tone="danger" message={actions.error} /> : null}
      {actions.transitions.map((t) => (
        <Button key={t.next} label={t.label} variant={t.danger ? 'danger' : 'primary'} onPress={() => actions.setPending(t)} />
      ))}
      <ConfirmDialog
        visible={!!pending}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={pending?.confirmLabel ?? ''}
        cancelLabel={pending?.cancelLabel}
        destructive={pending?.danger}
        loading={actions.busy}
        onConfirm={() => void actions.confirm()}
        onCancel={() => actions.setPending(null)}
      />
    </View>
  );
}
