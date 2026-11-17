import { useLocalSearchParams } from 'expo-router';
import { OwnerActions, PendingPhotosBanner, RequestFooter, RequestPhotosSection, RequestStatusNotice, RequestSummaryCard, useRequestDetail } from '@/features/requests';
import { Banner, ConfirmDialog, ErrorState, LoadingState, Screen, ScreenHeader } from '@/shared/ui';

export default function RequestDetail() {
  const params = useLocalSearchParams<{ id: string; photosFailed?: string }>();
  const id = Number(params.id);
  const detail = useRequestDetail(id);
  const { request, evidences, proposals, service } = detail;

  const header = <ScreenHeader title={`Solicitud #${params.id}`} back fallbackHref="/requests" />;
  if (request.initialLoading) return <Screen header={header}><LoadingState /></Screen>;
  if (!request.data) return <Screen header={header}><ErrorState error={request.error} onRetry={request.refetch} /></Screen>;

  const r = request.data;
  return (
    <Screen
      header={header}
      footer={<RequestFooter request={r} proposalCount={proposals.data?.length} serviceId={service.data?.id} onRepublish={() => detail.republish(r)} />}
      onRefresh={request.refetch}
      refreshing={request.loading}
    >
      <PendingPhotosBanner
        pending={detail.pending}
        failedAtPublish={Number(params.photosFailed ?? 0)}
        savedCount={evidences.data?.length ?? 0}
        onRetry={() => void detail.retryPhotos()}
      />
      {detail.notice ? <Banner tone={detail.notice.tone} message={detail.notice.message} /> : null}
      <RequestSummaryCard request={r} />
      <RequestStatusNotice status={r.status} />
      <RequestPhotosSection requestId={id} photoUrls={detail.photoUrls} loading={evidences.initialLoading} canAdd={detail.open} onAdded={evidences.refetch} />
      {detail.open ? (
        <OwnerActions status={r.status} locating={detail.locating} onUpdateLocation={() => void detail.updateLocation()} onCancel={() => detail.setCancelling(true)} />
      ) : null}
      <ConfirmDialog
        visible={detail.cancelling}
        title="¿Cancelar esta solicitud?"
        message="Los técnicos dejarán de verla y sus propuestas se descartan. Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar"
        cancelLabel="Mantenerla"
        destructive
        loading={detail.cancelBusy}
        onConfirm={() => void detail.cancel()}
        onCancel={() => detail.setCancelling(false)}
      />
    </Screen>
  );
}
