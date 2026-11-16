import { useEffect, useState } from 'react';
import { servicesApi, techniciansApi } from '@/shared/api/endpoints';
import type { ProposalStatus } from '@/shared/api/types';
import { API_MAX_PAGE_SIZE, LIST_PAGE_SIZE } from '@/shared/constants';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { usePagedList } from '@/shared/hooks/usePagedList';

export type ProposalFilter = ProposalStatus | 'ALL';

export const PROPOSAL_FILTERS: { value: ProposalFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ACCEPTED', label: 'Aceptadas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'REJECTED', label: 'No elegidas' },
];

/** Fewer rows than this after filtering means "load another page" before showing an empty list. */
const MIN_VISIBLE_ROWS = 4;

/**
 * The technician's own proposals: a paged list, a status filter applied to the pages loaded, the
 * totals per status and the service created by each accepted proposal (so a row can open it).
 * `enabled` pauses all the requests while another tab is showing.
 */
export function useMyProposals(enabled: boolean) {
  const [status, setStatus] = useState<ProposalFilter>('ALL');
  const proposals = usePagedList((page, signal) => techniciansApi.myProposals(page, LIST_PAGE_SIZE, { signal }), [], { refetchOnFocus: true, enabled });
  // Totals come from the newest proposals the API returns in one page, so they stay right while the list pages.
  const totals = useApiQuery((signal) => techniciansApi.myProposals(0, API_MAX_PAGE_SIZE, { signal }), [], { refetchOnFocus: true, enabled });
  const services = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true, enabled });

  const serviceByProposal = new Map((services.data ?? []).map((s) => [s.proposalId, s.id]));
  const all = totals.data?.content ?? [];
  const count = (s: ProposalStatus) => (totals.data ? all.filter((p) => p.status === s).length : undefined);
  const counts: Record<ProposalFilter, number | undefined> = {
    ALL: totals.data?.totalElements,
    ACCEPTED: count('ACCEPTED'),
    PENDING: count('PENDING'),
    REJECTED: count('REJECTED'),
  };

  const visible = status === 'ALL' ? proposals.items : proposals.items.filter((p) => p.status === status);
  const { hasMore, loadingMore, loadMoreError, loadMore } = proposals;
  const needsMore = status !== 'ALL' && visible.length < MIN_VISIBLE_ROWS && hasMore && !loadingMore && !loadMoreError;
  useEffect(() => {
    if (needsMore) loadMore();
  }, [needsMore, loadMore, proposals.items.length]);

  return { list: { ...proposals, items: visible }, total: proposals.total, status, setStatus, counts, serviceIdFor: (proposalId: number) => serviceByProposal.get(proposalId) };
}
