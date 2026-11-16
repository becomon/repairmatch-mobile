import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProposalRow } from '@/features/technicians/ProposalRow';
import { ServiceList } from '@/features/services/ServiceList';
import { servicesApi, techniciansApi } from '@/shared/api/endpoints';
import type { ProposalStatus } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { colors, GUTTER } from '@/shared/theme';
import { Card, FilterChip, PagedListView, Screen, ScreenHeader, Text } from '@/shared/ui';

type Segment = 'proposals' | 'services';
type StatusFilter = ProposalStatus | 'ALL';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ACCEPTED', label: 'Aceptadas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'REJECTED', label: 'No elegidas' },
];

/** "Mi trabajo": my proposals (round chips = request side) and my services (square chips). */
export default function WorkTab() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('proposals');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const proposals = usePagedList((page, signal) => techniciansApi.myProposals(page, 10, { signal }), [], { refetchOnFocus: true, enabled: segment === 'proposals' });
  // Totals come from the newest 100 proposals (the API maximum), so they stay right while the list pages.
  const totals = useApiQuery((signal) => techniciansApi.myProposals(0, 100, { signal }), [], { refetchOnFocus: true, enabled: segment === 'proposals' });
  const services = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true, enabled: segment === 'proposals' });

  const serviceByProposal = new Map((services.data ?? []).map((s) => [s.proposalId, s.id]));
  const all = totals.data?.content ?? [];
  const count = (s: ProposalStatus) => all.filter((p) => p.status === s).length;
  const counts: Record<StatusFilter, number | undefined> = {
    ALL: totals.data?.totalElements,
    ACCEPTED: totals.data ? count('ACCEPTED') : undefined,
    PENDING: totals.data ? count('PENDING') : undefined,
    REJECTED: totals.data ? count('REJECTED') : undefined,
  };

  const visible = status === 'ALL' ? proposals.items : proposals.items.filter((p) => p.status === status);
  const { hasMore, loadingMore, loadMoreError, loadMore } = proposals;
  const needsMore = status !== 'ALL' && visible.length < 4 && hasMore && !loadingMore && !loadMoreError;
  useEffect(() => {
    if (needsMore) loadMore();
  }, [needsMore, loadMore, proposals.items.length]);

  return (
    <Screen
      scroll={false}
      inTabs
      header={
        <>
          <ScreenHeader title="Mi trabajo" subtitle={segment === 'proposals' && proposals.total ? `${proposals.total} propuestas enviadas` : undefined} />
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: GUTTER, paddingBottom: 8 }}>
            <FilterChip label="Propuestas" selected={segment === 'proposals'} onPress={() => setSegment('proposals')} />
            <FilterChip label="Servicios" selected={segment === 'services'} onPress={() => setSegment('services')} />
          </View>
        </>
      }
    >
      {segment === 'proposals' ? (
        <PagedListView
          list={{ ...proposals, items: visible }}
          keyExtractor={(p) => String(p.id)}
          renderItem={(p) => <ProposalRow proposal={p} serviceId={p.status === 'ACCEPTED' ? serviceByProposal.get(p.id) : undefined} />}
          header={
            <View style={{ gap: 12, paddingBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  { label: 'Enviadas', value: counts.ALL },
                  { label: 'Aceptadas', value: counts.ACCEPTED },
                  { label: 'Pendientes', value: counts.PENDING },
                ].map((kpi) => (
                  <Card key={kpi.label} style={{ flex: 1, alignItems: 'center', gap: 2, padding: 12 }}>
                    <Text variant="heading" style={{ fontSize: 20 }}>{kpi.value ?? '—'}</Text>
                    <Text variant="small" color={colors.textMuted} numberOfLines={1}>{kpi.label}</Text>
                  </Card>
                ))}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: GUTTER }}>
                {STATUS_FILTERS.map((f) => (
                  <FilterChip
                    key={f.value}
                    label={counts[f.value] !== undefined ? `${f.label} (${counts[f.value]})` : f.label}
                    selected={status === f.value}
                    onPress={() => setStatus(f.value)}
                  />
                ))}
              </ScrollView>
            </View>
          }
          empty={
            status !== 'ALL'
              ? { icon: 'funnel-outline', title: 'Nada en esta pestaña', message: 'Ninguna de tus propuestas tiene este estado por ahora.', actionLabel: 'Ver todas', onAction: () => setStatus('ALL') }
              : {
                  icon: 'paper-plane-outline',
                  title: 'Aún no enviaste propuestas',
                  message: 'Elige un caso en Para ti y envía tu primera propuesta con costo y horario.',
                  actionLabel: 'Ver casos para ti',
                  onAction: () => router.push('/cases'),
                }
          }
        />
      ) : (
        <ServiceList role="TECHNICIAN" />
      )}
    </Screen>
  );
}
