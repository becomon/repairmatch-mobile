import { useState } from 'react';
import { useRouter } from 'expo-router';
import { invalidateRequest, isOpenRequest } from '@/features/requests';
import { friendlyError } from '@/shared/api/errors';
import { proposalsApi, requestsApi } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { sortProposals, type ProposalSort } from './sortProposals';

/** The client compares the proposals of one request, picks one and accepts it (which creates the service). */
export function useCompareProposals(requestId: number) {
  const router = useRouter();
  const request = useApiQuery((signal) => requestsApi.get(requestId, { signal }), [requestId]);
  const offers = useApiQuery((signal) => proposalsApi.recommended(requestId, { signal }), [requestId]);
  const [sort, setSort] = useState<ProposalSort>('recommended');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const { busy, run } = useAsyncAction();

  const items = sortProposals(offers.data ?? [], sort);
  const selected = items.find((o) => o.proposal.id === selectedId) ?? null;
  const canAccept = request.data ? isOpenRequest(request.data.status) : false;

  const accept = () =>
    run(async () => {
      if (!selected) return;
      setError('');
      try {
        const service = await proposalsApi.accept(selected.proposal.id);
        invalidateRequest(requestId);
        setConfirming(false);
        router.replace({ pathname: '/service/[id]', params: { id: String(service.id) } });
      } catch (cause) {
        // Most likely the state changed (cancelled, or another proposal was taken): show the truth.
        setConfirming(false);
        setError(friendlyError(cause));
        invalidateRequest(requestId);
        offers.refetch();
        request.refetch();
      }
    });

  return {
    request,
    offers,
    items,
    selected,
    selectedId,
    canAccept,
    sort,
    setSort,
    toggle: (proposalId: number) => setSelectedId((current) => (current === proposalId ? null : proposalId)),
    confirming,
    setConfirming,
    busy,
    error,
    accept,
    refresh: () => {
      offers.refetch();
      request.refetch();
    },
  };
}
