import { useState } from 'react';
import { useRouter } from 'expo-router';
import { evidenceApi, usePendingPhotos } from '@/features/evidences';
import { friendlyError } from '@/shared/api/errors';
import { proposalsApi, requestsApi } from '@/shared/api/endpoints';
import type { ServiceRequest } from '@/shared/api/types';
import { pluralize } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { getCurrentCoords, LocationDeniedError } from '@/shared/location';
import { httpUrl } from '@/shared/safeUrl';
import { useDraft } from './draft';
import { invalidateRequest } from './useRequestSummary';
import { isOpenRequest } from './status';

export interface Notice {
  tone: 'success' | 'danger';
  message: string;
}

/**
 * Everything the request detail screen reads and does: the request, its photos, its proposals or
 * service depending on the status, and the actions the owner can take while it is still open.
 */
export function useRequestDetail(id: number) {
  const router = useRouter();
  const { reset, update } = useDraft();

  const request = useApiQuery((signal) => requestsApi.get(id, { signal }), [id], { refetchOnFocus: true });
  const status = request.data?.status;
  const evidences = useApiQuery((signal) => evidenceApi.list(id, { signal }), [id], { enabled: !!request.data });
  const proposals = useApiQuery((signal) => proposalsApi.list(id, { signal }), [id, status], { enabled: status === 'CON_PROPUESTAS' });
  const service = useApiQuery((signal) => requestsApi.service(id, { signal }), [id, status], { enabled: status === 'CERRADA' });
  const pending = usePendingPhotos(id);

  const [cancelling, setCancelling] = useState(false);
  const [activity, setActivity] = useState<'cancel' | 'location' | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  // One lock for every mutation: a request cannot be cancelled while its location is being sent.
  const { busy, run } = useAsyncAction();

  /** After a failed mutation the screen may be out of date (a 409 means the state changed). */
  function failed(cause: unknown) {
    setNotice({ tone: 'danger', message: friendlyError(cause) });
    invalidateRequest(id);
    request.refetch();
  }

  const retryPhotos = async () => {
    const outcome = await pending.retry();
    if (!outcome) return;
    if (outcome.left < outcome.before) evidences.refetch();
    setNotice(
      outcome.left === 0
        ? { tone: 'success', message: 'Listo, subimos tus fotos.' }
        : { tone: 'danger', message: `Aún no pudimos subir ${pluralize(outcome.left, 'foto', 'fotos')}. ${outcome.error ?? 'Revisa tu conexión y vuelve a intentar.'}` },
    );
  };

  const cancel = () =>
    run(async () => {
      setActivity('cancel');
      try {
        await requestsApi.cancel(id);
        invalidateRequest(id);
        setCancelling(false);
        request.refetch();
      } catch (cause) {
        setCancelling(false);
        failed(cause);
      } finally {
        setActivity(null);
      }
    });

  const updateLocation = () =>
    run(async () => {
      setActivity('location');
      setNotice(null);
      try {
        const { latitude, longitude } = await getCurrentCoords();
        await requestsApi.setLocation(id, latitude, longitude);
        invalidateRequest(id);
        setNotice({ tone: 'success', message: 'Ubicación actualizada con tu GPS.' });
        request.refetch();
      } catch (cause) {
        if (cause instanceof LocationDeniedError) setNotice({ tone: 'danger', message: 'Necesitamos permiso de ubicación para actualizarla.' });
        else failed(cause);
      } finally {
        setActivity(null);
      }
    });

  /** Starts a fresh request with the same data; the old one is final and cannot be reopened. */
  function republish(r: ServiceRequest) {
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

  return {
    request,
    evidences,
    proposals,
    service,
    pending,
    photoUrls: (evidences.data ?? []).map((e) => httpUrl(e.mediaUrl)).filter((u): u is string => !!u),
    open: status ? isOpenRequest(status) : false,
    notice,
    cancelling,
    setCancelling,
    cancelBusy: busy && activity === 'cancel',
    locating: busy && activity === 'location',
    retryPhotos,
    cancel,
    updateLocation,
    republish,
  };
}
