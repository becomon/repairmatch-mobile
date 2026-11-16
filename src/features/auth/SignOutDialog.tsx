import { ConfirmDialog } from '@/shared/ui';
import type { useSignOut } from './useSignOut';

/** The "¿Cerrar sesión?" confirmation, driven by `useSignOut`. */
export function SignOutDialog({ state }: { state: ReturnType<typeof useSignOut> }) {
  return (
    <ConfirmDialog
      visible={state.confirming}
      title="¿Cerrar sesión?"
      message="Tendrás que ingresar tu correo y contraseña la próxima vez."
      confirmLabel="Cerrar sesión"
      destructive
      loading={state.signingOut}
      onConfirm={() => void state.signOut()}
      onCancel={state.cancel}
    />
  );
}
