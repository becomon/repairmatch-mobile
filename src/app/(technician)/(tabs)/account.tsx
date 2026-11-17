import { useUser } from '@/features/auth';
import { useApplianceTypes } from '@/features/catalog';
import { ProfileEditor } from '@/features/technicians';
import { techniciansApi } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { ErrorState, LoadingState, Screen, ScreenHeader } from '@/shared/ui';

export default function TechnicianAccountTab() {
  const user = useUser();
  const profile = useApiQuery((signal) => techniciansApi.profile({ signal }), []);
  const types = useApplianceTypes();
  const reputation = useApiQuery((signal) => techniciansApi.reputation(user.id, { signal }), [user.id]);

  const header = <ScreenHeader title="Mi perfil" />;
  if (profile.initialLoading || types.initialLoading) return <Screen inTabs header={header}><LoadingState /></Screen>;
  if (!profile.data || !types.data) {
    return (
      <Screen inTabs header={header}>
        <ErrorState error={profile.error ?? types.error} onRetry={() => { profile.refetch(); types.refetch(); }} />
      </Screen>
    );
  }

  // Keyed by the profile id so the form starts from the saved values of this technician.
  return <ProfileEditor key={profile.data.id} profile={profile.data} types={types.data} rating={reputation.data} onSaved={profile.refetch} />;
}
