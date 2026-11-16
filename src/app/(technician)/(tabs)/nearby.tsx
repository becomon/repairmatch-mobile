import { useCaseView } from '@/features/technicians/caseView';
import { CaseList } from '@/features/technicians/CaseList';
import { OpportunityCard } from '@/features/technicians/OpportunityCard';
import { techniciansApi } from '@/shared/api/endpoints';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { Screen, ScreenHeader } from '@/shared/ui';

/** Oportunidades: every compatible open request inside the radius, nearest first. */
export default function NearbyTab() {
  const list = usePagedList((page, signal) => techniciansApi.matchingRequests(page, 10, { signal }), [], { refetchOnFocus: true });
  const view = useCaseView(list, (r) => ({ request: r }), { sorts: ['near'], recommended: false });
  return (
    <Screen
      scroll={false}
      inTabs
      header={<ScreenHeader title="Oportunidades" subtitle={list.total ? `${list.total} dentro de tu radio` : 'Casos dentro de tu radio'} />}
    >
      <CaseList
        list={view.list}
        header={view.toolbar}
        filtered={view.filtered}
        onClearFilters={view.clear}
        keyExtractor={(r) => String(r.requestId)}
        renderItem={(r) => <OpportunityCard request={r} />}
      />
    </Screen>
  );
}
