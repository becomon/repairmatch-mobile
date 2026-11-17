import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PROPOSAL_FILTERS, ProposalRow, useMyProposals } from '@/features/proposals';
import { ServiceList } from '@/features/services';
import { colors, GUTTER } from '@/shared/theme';
import { Card, FilterChip, PagedListView, Screen, ScreenHeader, Text } from '@/shared/ui';

type Segment = 'proposals' | 'services';

/** "Mi trabajo": my proposals (round chips = request side) and my services (square chips). */
export default function WorkTab() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('proposals');
  const mine = useMyProposals(segment === 'proposals');
  const { status, counts } = mine;

  return (
    <Screen band="sand"
      scroll={false}
      inTabs
      header={
        <>
          <ScreenHeader title="Mi trabajo" subtitle={segment === 'proposals' && mine.total ? `${mine.total} propuestas enviadas` : undefined} />
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: GUTTER, paddingBottom: 8 }}>
            <FilterChip label="Propuestas" selected={segment === 'proposals'} onPress={() => setSegment('proposals')} />
            <FilterChip label="Servicios" selected={segment === 'services'} onPress={() => setSegment('services')} />
          </View>
        </>
      }
    >
      {segment === 'proposals' ? (
        <PagedListView
          list={mine.list}
          keyExtractor={(p) => String(p.id)}
          renderItem={(p) => <ProposalRow proposal={p} serviceId={p.status === 'ACCEPTED' ? mine.serviceIdFor(p.id) : undefined} />}
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
                {PROPOSAL_FILTERS.map((f) => (
                  <FilterChip
                    key={f.value}
                    label={counts[f.value] !== undefined ? `${f.label} (${counts[f.value]})` : f.label}
                    selected={status === f.value}
                    onPress={() => mine.setStatus(f.value)}
                  />
                ))}
              </ScrollView>
            </View>
          }
          empty={
            status !== 'ALL'
              ? { icon: 'funnel-outline', title: 'Nada en esta pestaña', message: 'Ninguna de tus propuestas tiene este estado por ahora.', actionLabel: 'Ver todas', onAction: () => mine.setStatus('ALL') }
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
