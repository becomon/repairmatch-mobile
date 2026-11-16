import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError, friendlyError } from '@/shared/api/errors';
import { proposalsApi, requestsApi, servicesApi } from '@/shared/api/endpoints';
import type { Role, Service, ServiceStatus } from '@/shared/api/types';
import { formatMoney, formatWhen } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors } from '@/shared/theme';
import { Avatar, Banner, Button, Card, ErrorState, Icon, InfoRow, LoadingState, Screen, ScreenHeader, SectionHeader, StarInput, Stars, StatusChip, Text, TextField } from '@/shared/ui';
import { requestTitle } from '../requests/RequestCard';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from '../requests/status';
import { ServiceActions } from './ServiceActions';

const STEPS: { status: ServiceStatus; label: string }[] = [
  { status: 'PROGRAMADO', label: 'Programado' },
  { status: 'EN_ATENCION', label: 'En atención' },
  { status: 'COMPLETADO', label: 'Completado' },
];

const SUMMARY: Record<ServiceStatus, string> = {
  PROGRAMADO: 'El servicio está agendado y a la espera de que el técnico inicie la atención.',
  EN_ATENCION: 'El técnico está realizando la reparación.',
  COMPLETADO: 'La reparación terminó. El cliente ya puede dejar su reseña.',
  CANCELADO: 'Este servicio se canceló antes de comenzar.',
};

function stepState(step: ServiceStatus, current: ServiceStatus): 'done' | 'current' | 'pending' {
  if (current === 'CANCELADO') return step === 'PROGRAMADO' ? 'done' : 'pending';
  const order = STEPS.findIndex((s) => s.status === step);
  const now = STEPS.findIndex((s) => s.status === current);
  if (order < now || current === 'COMPLETADO') return 'done';
  return order === now ? 'current' : 'pending';
}

/** Service tracking for both roles. The client can review once the service is completed. */
export function ServiceDetail({ id, role }: { id: number; role: Role }) {
  const router = useRouter();
  const isClient = role === 'CLIENT';
  const service = useApiQuery((signal) => servicesApi.get(id, { signal }), [id], { refetchOnFocus: true });
  const status = service.data?.status;
  const requestId = service.data?.requestId;

  const request = useApiQuery((signal) => requestsApi.get(requestId!, { signal }), [requestId], { enabled: requestId !== undefined });
  const proposals = useApiQuery((signal) => proposalsApi.list(requestId!, { signal }), [requestId], { enabled: isClient && requestId !== undefined });
  const review = useApiQuery((signal) => servicesApi.review(id, { signal }), [id, status], { enabled: status === 'COMPLETADO' });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [override, setOverride] = useState<Service | null>(null);

  const header = <ScreenHeader title={isClient ? 'Seguimiento' : `Servicio #${id}`} back fallbackHref={isClient ? '/services' : '/work'} />;
  if (service.initialLoading) return <Screen header={header}><LoadingState /></Screen>;
  if (!service.data) return <Screen header={header}><ErrorState error={service.error} onRetry={service.refetch} /></Screen>;

  // The status the user just set shows right away, but only until the reload brings the server copy.
  const s = override && override.id === service.data.id && service.loading ? override : service.data;
  const accepted = proposals.data?.find((p) => p.id === s.proposalId);
  const hasReview = !!review.data;
  const reviewMissing = review.error instanceof ApiError && review.error.status === 404;
  const canReview = isClient && s.status === 'COMPLETADO' && reviewMissing;

  async function submitReview() {
    const trimmed = comment.trim();
    if (!trimmed) {
      setCommentError('Cuéntale a otros clientes cómo te fue.');
      return;
    }
    setCommentError(undefined);
    setFormError('');
    setSubmitting(true);
    try {
      await servicesApi.createReview(id, { rating, comment: trimmed });
      review.refetch();
    } catch (cause) {
      setFormError(friendlyError(cause));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      header={header}
      onRefresh={() => { service.refetch(); }}
      refreshing={service.loading}
      footer={canReview ? <Button label="Publicar reseña" onPress={() => void submitReview()} loading={submitting} /> : null}
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
            <Text variant="smallStrong" color={colors.primary}>Ver perfil de {s.technicianName.split(' ')[0]}</Text>
          </Pressable>
        ) : null}
      </Card>

      <SectionHeader title="Estado del servicio" />
      <Text variant="small" color={colors.textSoft}>{SUMMARY[s.status]}</Text>
      <Card style={{ gap: 0 }}>
        {STEPS.map((step, index) => {
          const state = stepState(step.status, s.status);
          const last = index === STEPS.length - 1;
          const done = state === 'done';
          const current = state === 'current';
          return (
            <View key={step.status} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', width: 24 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.success : current ? colors.primary : colors.border }}>
                  {done ? <Icon name="checkmark" size={16} color="#ffffff" /> : current ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffffff' }} /> : null}
                </View>
                {!last ? <View style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: done ? colors.success : colors.border }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                <Text variant="bodyStrong" color={state === 'pending' ? colors.textMuted : colors.text}>{step.label}</Text>
                <Text variant="small" color={colors.textMuted}>
                  {step.status === 'PROGRAMADO' ? formatWhen(s.createdAt) : done ? 'Listo' : current ? 'En curso' : 'Pendiente'}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>

      {!isClient && request.data ? (
        <Card style={{ gap: 8 }}>
          <Text variant="smallStrong" color={colors.textSoft}>Falla reportada</Text>
          <Text variant="body" color={colors.textSoft}>«{request.data.originalDescription}»</Text>
          {request.data.latitude !== null && request.data.longitude !== null ? (
            <InfoRow label="Ubicación" value={`${request.data.latitude.toFixed(4)}, ${request.data.longitude.toFixed(4)}`} />
          ) : null}
        </Card>
      ) : null}

      <ServiceActions service={s} role={role} onChanged={(updated) => { setOverride(updated); service.refetch(); review.refetch(); }} />

      {hasReview && review.data ? (
        <Card style={{ gap: 8 }}>
          <Text variant="smallStrong" color={colors.textSoft}>{isClient ? 'Tu reseña' : 'Reseña del cliente'}</Text>
          <Stars value={review.data.rating} size={20} />
          <Text variant="body" color={colors.textSoft}>{review.data.comment}</Text>
        </Card>
      ) : null}

      {canReview ? (
        <Card style={{ gap: 12 }}>
          <Text variant="heading">¿Cómo te fue?</Text>
          <Text variant="small" color={colors.textMuted}>Tu reseña construye la reputación de {s.technicianName.split(' ')[0]} y ayuda a otros clientes a elegir.</Text>
          <StarInput value={rating} onChange={setRating} />
          <TextField label="Comentario" value={comment} onChangeText={setComment} error={commentError} multiline maxLength={2000} placeholder="Llegó puntual y explicó qué fallaba antes de cambiar nada." />
          {formError ? <Banner tone="danger" message={formError} /> : null}
        </Card>
      ) : null}
      {s.status === 'COMPLETADO' && review.initialLoading ? <LoadingState /> : null}
      {s.status === 'COMPLETADO' && !!review.error && !reviewMissing ? <ErrorState error={review.error} onRetry={review.refetch} /> : null}
      {s.status === 'COMPLETADO' && !isClient && reviewMissing ? <Banner tone="info" message="El cliente aún no dejó su reseña." /> : null}
    </Screen>
  );
}
