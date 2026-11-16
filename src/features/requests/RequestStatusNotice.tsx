import type { RequestStatus } from '@/shared/api/types';
import { colors } from '@/shared/theme';
import { Banner, Card, Text } from '@/shared/ui';

/** What the client should know about a request that is waiting, cancelled or expired. */
export function RequestStatusNotice({ status }: { status: RequestStatus }) {
  if (status === 'PUBLICADA') {
    return (
      <Card style={{ gap: 8, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
        <Text variant="heading">Tu caso fue enviado a técnicos cercanos</Text>
        <Text variant="small" color={colors.textSoft}>Te avisamos aquí cuando llegue la primera propuesta. Desliza hacia abajo para actualizar.</Text>
      </Card>
    );
  }
  if (status === 'CANCELADA') return <Banner tone="info" message="Cancelaste esta solicitud. Puedes publicar una nueva cuando quieras." />;
  if (status === 'EXPIRADA') return <Banner tone="warning" message="Esta solicitud expiró sin propuestas. Puedes volver a publicarla." />;
  return null;
}
