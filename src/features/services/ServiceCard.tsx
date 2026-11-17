import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApplianceTile } from '@/features/catalog';
import { requestTitle, useRequestSummary } from '@/features/requests';
import type { Role, Service } from '@/shared/api/types';
import { formatDay } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Card, StatusChip, Text } from '@/shared/ui';
import { ServiceActions } from './ServiceActions';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from './status';

interface Props {
  service: Service;
  role: Role;
  onChanged: (service: Service) => void;
  /** A status change failed; the list should reload. */
  onFailed?: () => void;
}

/** Row in the services lists. The appliance name comes from the request; the card works without it. */
export function ServiceCard({ service, role, onChanged, onFailed }: Props) {
  const router = useRouter();
  const request = useRequestSummary(service.requestId);
  const title = request ? requestTitle(request) : `Solicitud #${service.requestId}`;
  const who = role === 'CLIENT' ? `con ${service.technicianName}` : `solicitud #${service.requestId}`;
  const path = role === 'CLIENT' ? '/service/[id]' : '/job/[id]';
  return (
    <Card
      accessibilityLabel={`${title}, ${SERVICE_STATUS_LABEL[service.status]}`}
      onPress={() => router.push({ pathname: path, params: { id: String(service.id) } })}
      style={{ gap: 12 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={request?.applianceTypeName ?? ''} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{title}</Text>
          <Text variant="small" color={colors.textMuted} numberOfLines={1}>
            {who} · {formatDay(service.createdAt)}
          </Text>
        </View>
        <StatusChip label={SERVICE_STATUS_LABEL[service.status]} tone={SERVICE_STATUS_TONE[service.status]} shape="square" />
      </View>
      {role === 'TECHNICIAN' ? <ServiceActions service={service} role={role} onChanged={onChanged} onFailed={onFailed} primaryOnly /> : null}
    </Card>
  );
}
