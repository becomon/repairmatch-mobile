import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ProposalRow } from '@/features/technicians/ProposalRow';
import { ServiceList } from '@/features/services/ServiceList';
import { techniciansApi } from '@/shared/api/endpoints';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { GUTTER } from '@/shared/theme';
import { FilterChip, PagedListView, Screen, ScreenHeader } from '@/shared/ui';

type Segment = 'proposals' | 'services';

/** "Mi trabajo": my proposals (round chips = request side) and my services (square chips). */
export default function WorkTab() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('proposals');
  const proposals = usePagedList((page, signal) => techniciansApi.myProposals(page, 10, { signal }), [], { refetchOnFocus: true, enabled: segment === 'proposals' });

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
          list={proposals}
          keyExtractor={(p) => String(p.id)}
          renderItem={(p) => <ProposalRow proposal={p} />}
          empty={{
            icon: 'paper-plane-outline',
            title: 'Aún no enviaste propuestas',
            message: 'Elige un caso en Para ti y envía tu primera propuesta con costo y horario.',
            actionLabel: 'Ver casos para ti',
            onAction: () => router.push('/cases'),
          }}
        />
      ) : (
        <ServiceList role="TECHNICIAN" />
      )}
    </Screen>
  );
}
