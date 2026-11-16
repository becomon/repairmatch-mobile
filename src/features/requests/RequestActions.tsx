import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { ServiceRequest } from '@/shared/api/types';
import { pluralize } from '@/shared/format';
import { Button } from '@/shared/ui';

interface FooterProps {
  request: ServiceRequest;
  /** Proposals received; undefined while they have not loaded. */
  proposalCount: number | undefined;
  /** Service created when a proposal was accepted. */
  serviceId: number | undefined;
  onRepublish: () => void;
}

/** The one main action of a request, which depends on where it is in its lifecycle. */
export function RequestFooter({ request, proposalCount, serviceId, onRepublish }: FooterProps) {
  const router = useRouter();
  if (request.status === 'CON_PROPUESTAS') {
    return (
      <Button
        label={proposalCount !== undefined ? `Comparar ${pluralize(proposalCount, 'propuesta', 'propuestas')}` : 'Comparar propuestas'}
        icon="git-compare-outline"
        onPress={() => router.push({ pathname: '/request/[id]/proposals', params: { id: String(request.id) } })}
      />
    );
  }
  if (request.status === 'CERRADA' && serviceId !== undefined) {
    return <Button label="Ver seguimiento del servicio" icon="navigate-outline" onPress={() => router.push({ pathname: '/service/[id]', params: { id: String(serviceId) } })} />;
  }
  if (request.status === 'CANCELADA' || request.status === 'EXPIRADA') {
    return <Button label="Publicar de nuevo" icon="refresh" onPress={onRepublish} accessibilityHint="Abre una solicitud nueva con estos mismos datos" />;
  }
  return null;
}

interface OwnerActionsProps {
  status: ServiceRequest['status'];
  locating: boolean;
  onUpdateLocation: () => void;
  onCancel: () => void;
}

/** What the owner can still do while the request is open: refresh the location, cancel. */
export function OwnerActions({ status, locating, onUpdateLocation, onCancel }: OwnerActionsProps) {
  return (
    <View style={{ gap: 8, paddingTop: 8 }}>
      {status === 'PUBLICADA' ? <Button label="Actualizar ubicación con mi GPS" icon="navigate" variant="secondary" onPress={onUpdateLocation} loading={locating} /> : null}
      <Button label="Cancelar solicitud" variant="danger" onPress={onCancel} />
    </View>
  );
}
