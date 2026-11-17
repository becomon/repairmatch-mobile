import type { Review, Service } from '@/shared/api/types';
import { colors } from '@/shared/theme';
import { Banner, Card, ErrorState, LoadingState, StarInput, Stars, Text, TextField } from '@/shared/ui';
import type { useServiceDetail } from './useServiceDetail';

type Detail = ReturnType<typeof useServiceDetail>;

/** The review of a completed service: the written one, the form to write it, or why there is none yet. */
export function ServiceReview({ detail, service, isClient }: { detail: Detail; service: Service; isClient: boolean }) {
  const { review, reviewMissing, canReview, reviewForm: form } = detail;
  const firstName = service.technicianName.split(' ')[0];
  const completed = service.status === 'COMPLETADO';
  const written: Review | undefined = review.data;

  return (
    <>
      {written ? (
        <Card style={{ gap: 8 }}>
          <Text variant="smallStrong" color={colors.textSoft}>{isClient ? 'Tu reseña' : 'Reseña del cliente'}</Text>
          <Stars value={written.rating} size={20} />
          <Text variant="body" color={colors.textSoft}>{written.comment}</Text>
        </Card>
      ) : null}

      {canReview ? (
        <Card style={{ gap: 12 }}>
          <Text variant="heading">¿Cómo te fue?</Text>
          <Text variant="small" color={colors.textMuted}>Tu reseña construye la reputación de {firstName} y ayuda a otros clientes a elegir.</Text>
          <StarInput value={form.rating} onChange={form.setRating} />
          <TextField label="Comentario" value={form.comment} onChangeText={form.setComment} error={form.commentError} multiline maxLength={2000} placeholder="Llegó puntual y explicó qué fallaba antes de cambiar nada." />
          {form.formError ? <Banner tone="danger" message={form.formError} /> : null}
        </Card>
      ) : null}

      {completed && review.initialLoading ? <LoadingState /> : null}
      {completed && !!review.error && !reviewMissing ? <ErrorState error={review.error} onRetry={review.refetch} /> : null}
      {completed && !isClient && reviewMissing ? <Banner tone="info" message="El cliente aún no dejó su reseña." /> : null}
    </>
  );
}
