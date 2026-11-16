import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AddPhoto } from '@/features/evidences/AddPhoto';
import { PhotoGallery } from '@/features/evidences/PhotoGallery';
import { useDraft } from '@/features/requests/draft';
import { createEvidenceApi } from '@/features/evidences/api';
import { getLastPhotoError, getPendingPhotos, retryPendingPhotos } from '@/features/evidences/pendingPhotos';
import { ApplianceTile } from '@/features/requests/ApplianceTile';
import { getCurrentCoords, LocationDeniedError } from '@/features/requests/location';
import { requestTitle } from '@/features/requests/RequestCard';
import { invalidateRequest } from '@/features/requests/useRequestSummary';
import { isOpenRequest, REQUEST_STATUS_LABEL, REQUEST_STATUS_TONE } from '@/features/requests/status';
import { api } from '@/shared/api/client';
import { friendlyError } from '@/shared/api/errors';
import { proposalsApi, requestsApi } from '@/shared/api/endpoints';
import { formatWhen, pluralize } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { httpUrl } from '@/shared/safeUrl';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, ConfirmDialog, ErrorState, InfoRow, LoadingState, Screen, ScreenHeader, SectionHeader, StatusChip, Text } from '@/shared/ui';

const evidenceApi = createEvidenceApi(api);

export default function RequestDetail() {
  const router = useRouter();
  const { reset, update } = useDraft();
  const params = useLocalSearchParams<{ id: string; photosFailed?: string }>();
  const id = Number(params.id);
  const request = useApiQuery((signal) => requestsApi.get(id, { signal }), [id], { refetchOnFocus: true });
  const status = request.data?.status;
  const open = status ? isOpenRequest(status) : false;

  const evidences = useApiQuery((signal) => { void signal; return evidenceApi.list(id); }, [id], { enabled: !!request.data });
  const proposals = useApiQuery((signal) => proposalsApi.list(id, { signal }), [id, status], { enabled: status === 'CON_PROPUESTAS' });
  const service = useApiQuery((signal) => requestsApi.service(id, { signal }), [id, status], { enabled: status === 'CERRADA' });

  const [cancelling, setCancelling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const [pendingCount, setPendingCount] = useState(() => getPendingPhotos(id).length);
  const [retrying, setRetrying] = useState(false);

  async function retryPhotos() {
    if (retrying) return;
    setRetrying(true);
    const before = getPendingPhotos(id).length;
    const left = await retryPendingPhotos(id);
    setRetrying(false);
    setPendingCount(left);
    if (left < before) evidences.refetch();
    setNotice(left === 0
      ? { tone: 'success', message: 'Listo, subimos tus fotos.' }
      : { tone: 'danger', message: `Aún no pudimos subir ${pluralize(left, 'foto', 'fotos')}. ${getLastPhotoError(id) ?? "Revisa tu conexión y vuelve a intentar."}` });
  }

  async function cancel() {
    setBusy(true);
    try {
      await requestsApi.cancel(id);
      invalidateRequest(id);
      setCancelling(false);
      request.refetch();
    } catch (cause) {
      setCancelling(false);
      setNotice({ tone: 'danger', message: friendlyError(cause) });
    } finally {
      setBusy(false);
    }
  }

  async function updateLocation() {
    setBusy(true);
    setNotice(null);
    try {
      const { latitude, longitude } = await getCurrentCoords();
      await requestsApi.setLocation(id, latitude, longitude);
      invalidateRequest(id);
      setNotice({ tone: 'success', message: 'Ubicación actualizada con tu GPS.' });
      request.refetch();
    } catch (cause) {
      setNotice({ tone: 'danger', message: cause instanceof LocationDeniedError ? 'Necesitamos permiso de ubicación para actualizarla.' : friendlyError(cause) });
    } finally {
      setBusy(false);
    }
  }

  const header = <ScreenHeader title={`Solicitud #${params.id}`} back fallbackHref="/requests" />;
  if (request.initialLoading) return <Screen header={header}><LoadingState /></Screen>;
  if (!request.data) return <Screen header={header}><ErrorState error={request.error} onRetry={request.refetch} /></Screen>;

  const r = request.data;

  /** Starts a fresh request with the same data; the old one is final and cannot be reopened. */
  function republish() {
    reset();
    update({
      applianceTypeId: r.applianceTypeId,
      description: r.originalDescription,
      brand: r.brand ?? '',
      model: r.model ?? '',
      location: r.latitude !== null && r.longitude !== null ? { latitude: r.latitude, longitude: r.longitude, label: 'Ubicación de la solicitud anterior' } : null,
    });
    router.push('/publish/confirm');
  }

  const proposalCount = proposals.data?.length ?? 0;
  const photos = (evidences.data ?? []).map((e) => httpUrl(e.mediaUrl)).filter((u): u is string => !!u);
  const photosFailed = Number(params.photosFailed ?? 0);

  let footer: React.ReactNode = null;
  if (r.status === 'CON_PROPUESTAS') {
    footer = (
      <Button
        label={proposals.data ? `Comparar ${pluralize(proposalCount, 'propuesta', 'propuestas')}` : 'Comparar propuestas'}
        icon="git-compare-outline"
        onPress={() => router.push({ pathname: '/request/[id]/proposals', params: { id: String(id) } })}
      />
    );
  } else if (r.status === 'CERRADA' && service.data) {
    const serviceId = service.data.id;
    footer = <Button label="Ver seguimiento del servicio" icon="navigate-outline" onPress={() => router.push({ pathname: '/service/[id]', params: { id: String(serviceId) } })} />;
  } else if (r.status === 'CANCELADA' || r.status === 'EXPIRADA') {
    footer = <Button label="Publicar de nuevo" icon="refresh" onPress={republish} accessibilityHint="Abre una solicitud nueva con estos mismos datos" />;
  }

  return (
    <Screen header={header} footer={footer} onRefresh={request.refetch} refreshing={request.loading}>
      {pendingCount > 0 ? (
        <Card style={{ gap: 12 }}>
          <Banner tone="warning" message={`Publicamos tu solicitud, pero ${pluralize(pendingCount, 'foto no se pudo subir', 'fotos no se pudieron subir')}. Las guardamos: reintenta sin volver a tomarlas.${getLastPhotoError(id) ? ` Motivo: ${getLastPhotoError(id)}` : ""}`} />
          <Button label={retrying ? 'Subiendo fotos…' : `Reintentar ${pluralize(pendingCount, 'foto', 'fotos')}`} icon="refresh" loading={retrying} onPress={() => void retryPhotos()} />
        </Card>
      ) : photosFailed > 0 && !evidences.data?.length ? (
        <Banner tone="warning" message={`Publicamos tu solicitud, pero ${pluralize(photosFailed, 'foto no se pudo subir', 'fotos no se pudieron subir')}. Puedes agregarlas aquí abajo.`} />
      ) : null}
      {notice ? <Banner tone={notice.tone} message={notice.message} /> : null}

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ApplianceTile name={r.applianceTypeName} size={52} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="heading" numberOfLines={2}>{requestTitle(r)}</Text>
            <StatusChip label={REQUEST_STATUS_LABEL[r.status]} tone={REQUEST_STATUS_TONE[r.status]} />
          </View>
        </View>
        <Text variant="body" color={colors.textSoft}>«{r.originalDescription}»</Text>
        <View style={{ gap: 6 }}>
          <InfoRow label="Publicada" value={formatWhen(r.createdAt)} />
          {r.model ? <InfoRow label="Modelo" value={r.model} /> : null}
          <InfoRow label="Zona" value={r.latitude !== null && r.longitude !== null ? 'Ubicación registrada' : 'Sin ubicación'} />
        </View>
      </Card>

      {r.status === 'PUBLICADA' ? (
        <Card style={{ gap: 8, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <Text variant="heading">Tu caso fue enviado a técnicos cercanos</Text>
          <Text variant="small" color={colors.textSoft}>Te avisamos aquí cuando llegue la primera propuesta. Desliza hacia abajo para actualizar.</Text>
        </Card>
      ) : null}
      {r.status === 'CANCELADA' ? <Banner tone="info" message="Cancelaste esta solicitud. Puedes publicar una nueva cuando quieras." /> : null}
      {r.status === 'EXPIRADA' ? <Banner tone="warning" message="Esta solicitud expiró sin propuestas. Puedes volver a publicarla." /> : null}

      <SectionHeader title={`Fotos (${photos.length})`} />
      {evidences.initialLoading ? (
        <LoadingState />
      ) : photos.length > 0 ? (
        <PhotoGallery uris={photos} />
      ) : (
        <Text variant="small" color={colors.textMuted}>Aún no hay fotos en esta solicitud.</Text>
      )}
      {open ? <Card style={{ padding: 0 }}><AddPhoto requestId={id} evidenceApi={evidenceApi} onAdded={evidences.refetch} /></Card> : null}

      {open ? (
        <View style={{ gap: 8, paddingTop: 8 }}>
          {r.status === 'PUBLICADA' ? <Button label="Actualizar ubicación con mi GPS" icon="navigate" variant="secondary" onPress={() => void updateLocation()} loading={busy && !cancelling} /> : null}
          <Button label="Cancelar solicitud" variant="danger" onPress={() => setCancelling(true)} />
        </View>
      ) : null}

      <ConfirmDialog
        visible={cancelling}
        title="¿Cancelar esta solicitud?"
        message="Los técnicos dejarán de verla y sus propuestas se descartan. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="Mantenerla"
        destructive
        loading={busy}
        onConfirm={() => void cancel()}
        onCancel={() => setCancelling(false)}
      />
    </Screen>
  );
}
