import { ServiceList } from '@/features/services';
import { Screen, ScreenHeader } from '@/shared/ui';

export default function ClientServicesTab() {
  return (
    <Screen scroll={false} inTabs header={<ScreenHeader title="Mis servicios" subtitle="Seguimiento de tus reparaciones" />}>
      <ServiceList role="CLIENT" />
    </Screen>
  );
}
