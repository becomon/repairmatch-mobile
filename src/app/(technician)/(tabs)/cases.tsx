import { CaseList } from '@/features/technicians/CaseList';
import { OpportunityCard } from '@/features/technicians/OpportunityCard';
import { techniciansApi } from '@/shared/api/endpoints';
import { timeAgo } from '@/shared/format';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { useUser } from '@/features/auth/AuthProvider';
import { Screen, ScreenHeader } from '@/shared/ui';

/** "Para ti": open compatible requests ranked by distance, experience, freshness and competition. */
export default function ForYouTab() {
  const user = useUser();
  const list = usePagedList((page, signal) => techniciansApi.recommendedRequests(page, 10, { signal }), [], { refetchOnFocus: true });
  return (
    <Screen
      scroll={false}
      inTabs
      header={<ScreenHeader title="Casos para ti" subtitle={`Hola, ${user.name.split(' ')[0]}${list.total ? ` · ${list.total} disponibles` : ''}`} />}
    >
      <CaseList
        list={list}
        keyExtractor={(c) => String(c.request.requestId)}
        renderItem={(c) => (
          <OpportunityCard request={c.request} timeLabel={timeAgo(c.createdAt)} reason={c.reasons[0]?.label} proposalCount={c.proposalCount} />
        )}
      />
    </Screen>
  );
}
