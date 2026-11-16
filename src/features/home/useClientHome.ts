import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useApplianceTypes } from '@/features/catalog';
import { useDraft } from '@/features/requests';
import { isActiveService } from '@/features/services';
import { requestsApi, servicesApi } from '@/shared/api/endpoints';
import { HOME_PREVIEW_COUNT, MIN_DESCRIPTION_CHARS, MIN_SEARCH_CHARS } from '@/shared/constants';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

/** Data and actions of the client home: describe a fault, recent requests and services in progress. */
export function useClientHome() {
  const router = useRouter();
  const { update, reset } = useDraft();
  const [text, setText] = useState('');
  const types = useApplianceTypes();
  // The API filters by one status at a time, so the two open states are read separately (newest few each).
  const preview = (status: 'CON_PROPUESTAS' | 'PUBLICADA') => (signal: AbortSignal) =>
    requestsApi.list({ page: 0, size: HOME_PREVIEW_COUNT, status, sort: 'newest' }, { signal });
  const withOffers = useApiQuery(preview('CON_PROPUESTAS'), [], { refetchOnFocus: true });
  const published = useApiQuery(preview('PUBLICADA'), [], { refetchOnFocus: true });
  const services = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true });

  // Requests with offers need an answer first, so they lead.
  const active = [...(withOffers.data?.content ?? []), ...(published.data?.content ?? [])].slice(0, HOME_PREVIEW_COUNT);
  const recentError = (withOffers.error && !withOffers.data) || (published.error && !published.data) ? (withOffers.error ?? published.error) : null;
  const trimmed = text.trim();

  return {
    text,
    setText,
    canAnalyse: trimmed.length >= MIN_DESCRIPTION_CHARS,
    canSearch: trimmed.length >= MIN_SEARCH_CHARS,
    types,
    active,
    recentLoading: withOffers.initialLoading || published.initialLoading,
    recentError,
    liveServices: (services.data ?? []).filter(isActiveService).slice(0, 2),
    refreshing: (types.loading && !!types.data) || (withOffers.loading && !!withOffers.data) || (published.loading && !!published.data),
    refetchServices: services.refetch,
    retryRecent: () => {
      withOffers.refetch();
      published.refetch();
    },
    refreshAll: () => {
      types.refetch();
      withOffers.refetch();
      published.refetch();
      services.refetch();
    },
    /** Opens the "Así entendimos tu problema" step with the text already written. */
    analyse: () => {
      reset();
      update({ description: trimmed });
      router.push('/publish/confirm');
    },
    startWith: (applianceTypeId: number) => {
      reset();
      update({ applianceTypeId });
      router.push('/publish');
    },
    search: () => router.push({ pathname: '/search', params: { q: trimmed } }),
  };
}
