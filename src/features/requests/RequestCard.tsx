import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { timeAgo } from '@/shared/format';
import type { ServiceRequest } from '@/shared/api/types';
import { colors } from '@/shared/theme';
import { Card, StatusChip, Text } from '@/shared/ui';
import { ApplianceTile } from './ApplianceTile';
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_TONE } from './status';

export function requestTitle(r: Pick<ServiceRequest, 'applianceTypeName' | 'brand'>): string {
  return r.brand ? `${r.applianceTypeName} ${r.brand}` : r.applianceTypeName;
}

export function RequestCard({ request }: { request: ServiceRequest }) {
  const router = useRouter();
  return (
    <Card
      accessibilityLabel={`${requestTitle(request)}, ${REQUEST_STATUS_LABEL[request.status]}`}
      onPress={() => router.push({ pathname: '/request/[id]', params: { id: String(request.id) } })}
      style={{ gap: 10 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={request.applianceTypeName} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{requestTitle(request)}</Text>
          <Text variant="small" color={colors.textMuted} numberOfLines={1}>
            Enviada {timeAgo(request.createdAt)}
          </Text>
        </View>
        <StatusChip label={REQUEST_STATUS_LABEL[request.status]} tone={REQUEST_STATUS_TONE[request.status]} />
      </View>
      <Text variant="small" color={colors.textSoft} numberOfLines={2}>«{request.originalDescription}»</Text>
    </Card>
  );
}
