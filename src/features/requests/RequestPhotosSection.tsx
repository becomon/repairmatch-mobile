import { AddPhoto, PhotoGallery, evidenceApi, type PendingPhotos } from '@/features/evidences';
import { pluralize } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, LoadingState, SectionHeader, Text } from '@/shared/ui';

interface BannerProps {
  pending: PendingPhotos;
  /** Photos that failed while publishing, told by the publish screen when nothing is pending anymore. */
  failedAtPublish: number;
  /** Photos already saved on the request. */
  savedCount: number;
  onRetry: () => void;
}

/** Tells the client that some photos did not upload and lets them retry without taking them again. */
export function PendingPhotosBanner({ pending, failedAtPublish, savedCount, onRetry }: BannerProps) {
  if (pending.count > 0) {
    return (
      <Card style={{ gap: 12 }}>
        <Banner
          tone="warning"
          message={`Publicamos tu solicitud, pero ${pluralize(pending.count, 'foto no se pudo subir', 'fotos no se pudieron subir')}. Las guardamos: reintenta sin volver a tomarlas.${pending.error ? ` Motivo: ${pending.error}` : ''}`}
        />
        <Button
          label={pending.retrying ? 'Subiendo fotos…' : `Reintentar ${pluralize(pending.count, 'foto', 'fotos')}`}
          icon="refresh"
          loading={pending.retrying}
          onPress={onRetry}
        />
      </Card>
    );
  }
  if (failedAtPublish > 0 && savedCount === 0) {
    return <Banner tone="warning" message={`Publicamos tu solicitud, pero ${pluralize(failedAtPublish, 'foto no se pudo subir', 'fotos no se pudieron subir')}. Puedes agregarlas aquí abajo.`} />;
  }
  return null;
}

interface SectionProps {
  requestId: number;
  photoUrls: string[];
  loading: boolean;
  /** The owner can still add photos while the request is open. */
  canAdd: boolean;
  onAdded: () => void;
}

/** Photos of a request: gallery plus the upload of new ones. */
export function RequestPhotosSection({ requestId, photoUrls, loading, canAdd, onAdded }: SectionProps) {
  return (
    <>
      <SectionHeader title={`Fotos (${photoUrls.length})`} />
      {loading ? (
        <LoadingState />
      ) : photoUrls.length > 0 ? (
        <PhotoGallery uris={photoUrls} />
      ) : (
        <Text variant="small" color={colors.textMuted}>Aún no hay fotos en esta solicitud.</Text>
      )}
      {canAdd ? <Card style={{ padding: 0 }}><AddPhoto requestId={requestId} evidenceApi={evidenceApi} onAdded={onAdded} /></Card> : null}
    </>
  );
}
