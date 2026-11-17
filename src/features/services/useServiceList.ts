import { useState } from 'react';
import { servicesApi } from '@/shared/api/endpoints';
import type { Service } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { isActiveService } from './status';

export type ServiceFilter = 'ACTIVE' | 'DONE';
export type ServiceSort = 'newest' | 'oldest';

const SEARCH_DEBOUNCE_MS = 250;

/** GET /services is a plain array, so filtering, searching and sorting are done here. */
export function useServiceList() {
  const query = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true });
  const [filter, setFilter] = useState<ServiceFilter>('ACTIVE');
  const [sort, setSort] = useState<ServiceSort>('newest');
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim().toLowerCase().replace(/^#/, ''), SEARCH_DEBOUNCE_MS);
  // Status changes made from a card show instantly; they are discarded as soon as a fresh list arrives.
  const [local, setLocal] = useState<{ base: Service[] | undefined; changes: Record<number, Service> }>({ base: undefined, changes: {} });

  const changes = local.base === query.data ? local.changes : {};
  const all = (query.data ?? []).map((s) => changes[s.id] ?? s);
  const activeCount = all.filter(isActiveService).length;

  const shown = all
    .filter((s) => (filter === 'ACTIVE' ? isActiveService(s) : !isActiveService(s)))
    .filter((s) => !term || String(s.id) === term || String(s.requestId) === term || s.technicianName.toLowerCase().includes(term))
    .sort((a, b) => {
      const order = a.createdAt.localeCompare(b.createdAt) || a.id - b.id;
      return sort === 'oldest' ? order : -order;
    });

  return {
    query,
    shown,
    activeCount,
    doneCount: all.length - activeCount,
    filter,
    setFilter,
    sort,
    toggleSort: () => setSort((s) => (s === 'newest' ? 'oldest' : 'newest')),
    search,
    setSearch,
    searching: term.length > 0,
    applyChange: (updated: Service) => setLocal({ base: query.data, changes: { ...changes, [updated.id]: updated } }),
  };
}
