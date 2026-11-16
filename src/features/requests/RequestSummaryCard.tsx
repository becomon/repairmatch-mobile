import { View } from 'react-native';
import { ApplianceTile } from '@/features/catalog';
import type { ServiceRequest } from '@/shared/api/types';
import { formatWhen } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Card, InfoRow, StatusChip, Text } from '@/shared/ui';
import { requestTitle } from './requestTitle';
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_TONE } from './status';

/** Header card of the request detail: appliance, status, the client's words and the key facts. */
export function RequestSummaryCard({ request: r }: { request: ServiceRequest }) {
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={r.applianceTypeName} size={52} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="heading" numberOfLines={2}>{requestTitle(r)}</Text>
          <StatusChip label={REQUEST_STATUS_LABEL[r.status]} tone={REQUEST_STATUS_TONE[r.status]} />
        </View>
      </View>
      <Text variant="body" color={colors.textSoft}>«{r.originalDescription}»</Text>
      <View style={{ gap: 6 }}>
        <InfoRow label="Publicada" value={formatWhen(r.createdAt)} />
        {r.model ? <InfoRow label="Modelo" value={r.model} /> : null}
        <InfoRow label="Zona" value={r.latitude !== null && r.longitude !== null ? 'Ubicación registrada' : 'Sin ubicación'} />
      </View>
    </Card>
  );
}
