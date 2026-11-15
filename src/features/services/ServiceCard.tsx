import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { requestsApi } from '@/shared/api/endpoints';
import type { Role, Service } from '@/shared/api/types';
import { formatDay } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors } from '@/shared/theme';
import { Card, StatusChip, Text } from '@/shared/ui';
import { ApplianceTile } from '../requests/ApplianceTile';
import { requestTitle } from '../requests/RequestCard';
import { SERVICE_STATUS_LABEL, SERVICE_STATUS_TONE } from '../requests/status';
import { ServiceActions } from './ServiceActions';

interface Props {
  service: Service;
  role: Role;
  onChanged: (service: Service) => void;
}

/** Row in the services lists. The appliance name comes from the request; the card works without it. */
export function ServiceCard({ service, role, onChanged }: Props) {
  const router = useRouter();
  const request = useApiQuery((signal) => requestsApi.get(service.requestId, { signal }), [service.requestId]);
  const title = request.data ? requestTitle(request.data) : `Solicitud #${service.requestId}`;
  const who = role === 'CLIENT' ? `con ${service.technicianName}` : `solicitud #${service.requestId}`;
  const path = role === 'CLIENT' ? '/service/[id]' : '/job/[id]';
  return (
    <Card
      accessibilityLabel={`${title}, ${SERVICE_STATUS_LABEL[service.status]}`}
      onPress={() => router.push({ pathname: path, params: { id: String(service.id) } })}
      style={{ gap: 12 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={request.data?.applianceTypeName ?? ''} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{title}</Text>
          <Text variant="small" color={colors.textMuted} numberOfLines={1}>
            {who} · {formatDay(service.createdAt)}
          </Text>
        </View>
        <StatusChip label={SERVICE_STATUS_LABEL[service.status]} tone={SERVICE_STATUS_TONE[service.status]} shape="square" />
      </View>
      {role === 'TECHNICIAN' ? <ServiceActions service={service} role={role} onChanged={onChanged} primaryOnly /> : null}
    </Card>
  );
}
