import { useRouter } from 'expo-router';
import { useUser } from '@/features/auth';
import { CaseList, DemandLink, OpportunityCard, useCaseView, useNearbyDemand } from '@/features/technicians';
import { techniciansApi } from '@/shared/api/endpoints';
import { LIST_PAGE_SIZE } from '@/shared/constants';
import { timeAgo } from '@/shared/format';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { Screen, ScreenHeader } from '@/shared/ui';

/** "Para ti": open compatible requests ranked by distance, experience, freshness and competition. */
export default function ForYouTab() {
  const user = useUser();
  const router = useRouter();
  const demand = useNearbyDemand();
  const list = usePagedList((page, signal) => techniciansApi.recommendedRequests(page, LIST_PAGE_SIZE, { signal }), [], { refetchOnFocus: true });
  const view = useCaseView(list, (c) => ({ request: c.request, createdAt: c.createdAt, proposalCount: c.proposalCount, symptom: c.symptom, score: c.score }), {
    sorts: ['best', 'near', 'recent'],
    recommended: true,
  });
  return (
    <Screen
      scroll={false}
      inTabs
      header={<ScreenHeader title="Casos para ti" subtitle={`Hola, ${user.name.split(' ')[0]}${list.total ? ` · ${list.total} disponibles` : ''}`} right={demand.ready ? <DemandLink count={demand.points.length} onPress={() => router.push('/account')} /> : undefined} />}
    >
      <CaseList
        list={view.list}
        header={view.toolbar}
        filtered={view.filtered}
        onClearFilters={view.clear}
        keyExtractor={(c) => String(c.request.requestId)}
        renderItem={(c) => (
          <OpportunityCard
            request={c.request}
            timeLabel={timeAgo(c.createdAt)}
            reasons={c.reasons.map((r) => r.label)}
            symptom={c.symptom}
            proposalCount={c.proposalCount}
          />
        )}
      />
    </Screen>
  );
}
