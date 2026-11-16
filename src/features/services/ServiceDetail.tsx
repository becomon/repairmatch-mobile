import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { requestTitle } from '@/features/requests';
import type { Role } from '@/shared/api/types';
import { formatMoney, formatWhen } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Avatar, Button, Card, ErrorState, InfoRow, LoadingState, Screen, ScreenHeader, StatusChip, Text } from '@/shared/ui';
import { ServiceActions } from './ServiceActions';
import { ServiceReview } from './ServiceReview';
import { ServiceTimeline } from './ServiceTimeline';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from './status';
import { useServiceDetail } from './useServiceDetail';

/** Service tracking for both roles. The client can review once the service is completed. */
export function ServiceDetail({ id, role }: { id: number; role: Role }) {
  const router = useRouter();
  const isClient = role === 'CLIENT';
  const detail = useServiceDetail(id, role);
  const { service, current: s, request, accepted } = detail;

  const header = <ScreenHeader title={isClient ? 'Seguimiento' : `Servicio #${id}`} back fallbackHref={isClient ? '/services' : '/work'} />;
  if (service.initialLoading) return <Screen header={header}><LoadingState /></Screen>;
  if (!s) return <Screen header={header}><ErrorState error={service.error} onRetry={service.refetch} /></Screen>;

  const form = detail.reviewForm;
  return (
    <Screen
      header={header}
      onRefresh={service.refetch}
      refreshing={service.loading}
      footer={detail.canReview ? <Button label="Publicar reseña" onPress={() => void form.submit()} loading={form.submitting} /> : null}
    >
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={s.technicianName} size={52} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="heading" numberOfLines={1}>{isClient ? s.technicianName : request.data ? requestTitle(request.data) : `Solicitud #${s.requestId}`}</Text>
            <StatusChip label={SERVICE_STATUS_LABEL[s.status]} tone={SERVICE_STATUS_TONE[s.status]} shape="square" />
          </View>
        </View>
        <View style={{ gap: 6 }}>
          {isClient && request.data ? <InfoRow label="Equipo" value={requestTitle(request.data)} /> : null}
          {isClient && accepted ? <InfoRow label="Visita" value={`${formatMoney(accepted.diagnosticCost)} · diagnóstico`} /> : null}
          {accepted ? <InfoRow label="Agendado" value={formatWhen(accepted.availableAt)} /> : null}
          <InfoRow label="Creado" value={formatWhen(s.createdAt)} />
        </View>
        {isClient ? (
          <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: '/technician/[id]', params: { id: s.technicianId } })} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text variant="smallStrong" color={colors.link}>Ver perfil de {s.technicianName.split(' ')[0]}</Text>
          </Pressable>
        ) : null}
      </Card>

      <ServiceTimeline status={s.status} createdAt={s.createdAt} />

      {!isClient && request.data ? (
        <Card style={{ gap: 8 }}>
          <Text variant="smallStrong" color={colors.textSoft}>Falla reportada</Text>
          <Text variant="body" color={colors.textSoft}>«{request.data.originalDescription}»</Text>
          {request.data.latitude !== null && request.data.longitude !== null ? (
            <InfoRow label="Ubicación" value={`${request.data.latitude.toFixed(4)}, ${request.data.longitude.toFixed(4)}`} />
          ) : null}
        </Card>
      ) : null}

      <ServiceActions service={s} role={role} onChanged={detail.onStatusChanged} onFailed={service.refetch} />
      <ServiceReview detail={detail} service={s} isClient={isClient} />
    </Screen>
  );
}
