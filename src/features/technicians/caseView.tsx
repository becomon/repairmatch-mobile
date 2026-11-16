import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { applianceLabel } from '@/features/catalog/appliances';
import type { MatchingRequest, Reason } from '@/shared/api/types';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { PagedList } from '@/shared/hooks/usePagedList';
import { colors, GUTTER } from '@/shared/theme';
import { FilterChip, SearchInput, Text } from '@/shared/ui';

/** One row of a technician case list, whether it came from "Para ti" or from "Oportunidades". */
export interface CaseRow {
  request: MatchingRequest;
  createdAt?: string;
  proposalCount?: number;
  symptom?: string | null;
  score?: number;
  reasons?: Reason[];
}

export type CaseTab = 'all' | 'no-offers' | 'near' | 'new';
export type CaseSort = 'near' | 'best' | 'recent';

const FRESH_MS = 3 * 60 * 60 * 1000;
const NEAR_KM = 2;

const TABS: { value: CaseTab; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'no-offers', label: 'Sin ofertas aún' },
  { value: 'near', label: `A menos de ${NEAR_KM} km` },
  { value: 'new', label: 'Nuevos (3 h)' },
];

function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function matches(row: CaseRow, needle: string): boolean {
  if (!needle) return true;
  const r = row.request;
  return fold([r.applianceTypeName, applianceLabel(r.applianceTypeName), r.brand, r.model, r.description, row.symptom].filter(Boolean).join(' ')).includes(needle);
}

interface CaseView<T> {
  /** The list with the filters applied, shaped like the original so it can feed `PagedListView`. */
  list: PagedList<T>;
  toolbar: React.ReactElement;
  filtered: boolean;
  clear: () => void;
}

/**
 * Search, quick tabs and sort for a case list. Filters run on the pages already loaded; when they
 * leave the screen almost empty the next page is requested so the technician never sees a false "nothing here".
 */
export function useCaseView<T>(list: PagedList<T>, toRow: (item: T) => CaseRow, { sorts, recommended }: { sorts: CaseSort[]; recommended: boolean }): CaseView<T> {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<CaseTab>('all');
  const [sort, setSort] = useState<CaseSort>(sorts[0] ?? 'near');
  const [now] = useState(() => Date.now());
  const needle = fold(useDebounce(search, 250));

  const tabs = TABS.filter((t) => recommended || t.value === 'all' || t.value === 'near');
  const filtered = needle.length > 0 || tab !== 'all';

  const items = list.items
    .filter((item) => matches(toRow(item), needle))
    .filter((item) => {
      const row = toRow(item);
      if (tab === 'no-offers') return row.proposalCount === 0;
      if (tab === 'near') return row.request.distanceKm <= NEAR_KM;
      if (tab === 'new') return row.createdAt !== undefined && now - new Date(row.createdAt).getTime() < FRESH_MS;
      return true;
    })
    .sort((a, b) => {
      const ra = toRow(a);
      const rb = toRow(b);
      if (sort === 'best') return (rb.score ?? 0) - (ra.score ?? 0);
      if (sort === 'recent') return (rb.createdAt ?? '').localeCompare(ra.createdAt ?? '');
      return ra.request.distanceKm - rb.request.distanceKm;
    });

  const { hasMore, loadingMore, loadMoreError, loadMore } = list;
  const needsMore = filtered && items.length < 4 && hasMore && !loadingMore && !loadMoreError;
  useEffect(() => {
    if (needsMore) loadMore();
  }, [needsMore, loadMore, list.items.length]);

  const sortLabels: Record<CaseSort, string> = { near: 'Más cercanos', best: 'Mejor oportunidad', recent: 'Más recientes' };
  const toolbar = (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      <SearchInput label="Buscar casos" value={search} onChangeText={setSearch} placeholder="Equipo, marca o falla" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: GUTTER }} keyboardShouldPersistTaps="handled">
        {tabs.map((t) => (
          <FilterChip key={t.value} label={t.label} selected={tab === t.value} onPress={() => setTab(t.value)} />
        ))}
      </ScrollView>
      {sorts.length > 1 ? (
        <View style={{ gap: 6 }}>
          <Text variant="caption" color={colors.textMuted}>ORDENAR POR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: GUTTER }} keyboardShouldPersistTaps="handled">
            {sorts.map((s) => (
              <FilterChip key={s} label={sortLabels[s]} selected={sort === s} onPress={() => setSort(s)} />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

  const clear = () => {
    setSearch('');
    setTab('all');
  };
  return { list: { ...list, items }, toolbar, filtered, clear };
}
