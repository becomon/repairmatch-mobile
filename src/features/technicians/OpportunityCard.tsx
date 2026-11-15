import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { MatchingRequest } from '@/shared/api/types';
import { formatDistance } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Button, Card, InfoChip, Text } from '@/shared/ui';
import { ApplianceTile } from '../requests/ApplianceTile';

interface Props {
  request: MatchingRequest;
  /** Relative publish time, only known in "Para ti". */
  timeLabel?: string;
  /** Why this case was recommended. */
  reason?: string;
  proposalCount?: number;
}

export function opportunityTitle(r: Pick<MatchingRequest, 'applianceTypeName' | 'brand'>) {
  return r.brand ? `${r.applianceTypeName} ${r.brand}` : r.applianceTypeName;
}

/** Case card: appliance, distance, the client's words and a single "Enviar propuesta" action. */
export function OpportunityCard({ request, timeLabel, reason, proposalCount }: Props) {
  const router = useRouter();
  const open = () => router.push({ pathname: '/opportunity/[id]', params: { id: String(request.requestId), data: JSON.stringify(request) } });
  return (
    <Card onPress={open} accessibilityLabel={`${opportunityTitle(request)}, a ${formatDistance(request.distanceKm)}`} style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={request.applianceTypeName} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{opportunityTitle(request)}</Text>
          {timeLabel ? <Text variant="small" color={colors.textMuted}>{timeLabel}</Text> : null}
        </View>
        <InfoChip label={formatDistance(request.distanceKm)} />
      </View>
      <Text variant="small" color={colors.textSoft} numberOfLines={3}>«{request.description}»</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {reason ? (
          <View style={{ backgroundColor: colors.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text variant="small" color={colors.accentDark}>{reason}</Text>
          </View>
        ) : null}
        {proposalCount !== undefined ? <InfoChip label={proposalCount === 0 ? 'Sin propuestas aún' : `${proposalCount} ${proposalCount === 1 ? 'propuesta' : 'propuestas'}`} /> : null}
      </View>
      <Button label="Enviar propuesta" onPress={open} />
    </Card>
  );
}
