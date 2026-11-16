import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApplianceTile, applianceTitle } from '@/features/catalog';
import type { MatchingRequest } from '@/shared/api/types';
import { formatDistance, pluralize } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Button, Card, IdentityPill, InfoChip, Text } from '@/shared/ui';
import { opportunityParams } from './opportunityParam';

interface Props {
  request: MatchingRequest;
  /** Relative publish time, only known in "Para ti". */
  timeLabel?: string;
  /** Why this case was recommended (the API sends up to three). */
  reasons?: string[];
  /** The fault the local AI read from the description, when it was confident. */
  symptom?: string | null;
  proposalCount?: number;
}

export function opportunityTitle(r: Pick<MatchingRequest, 'applianceTypeName' | 'brand'>) {
  return applianceTitle(r.applianceTypeName, r.brand);
}

/** Case card: appliance, distance, the client's words and a single "Enviar propuesta" action. */
export function OpportunityCard({ request, timeLabel, reasons = [], symptom, proposalCount }: Props) {
  const router = useRouter();
  const open = () => router.push({ pathname: '/opportunity/[id]', params: opportunityParams(request) });
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
      {request.clientIdentityVerified ? <IdentityPill label="Cliente verificado" /> : null}
      <Text variant="small" color={colors.textSoft} numberOfLines={3}>«{request.description}»</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {reasons.slice(0, 3).map((reason) => (
          <View key={reason} style={{ backgroundColor: colors.freshSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text variant="small" color={colors.freshStrong}>{reason}</Text>
          </View>
        ))}
        {symptom ? <InfoChip label={symptom} /> : null}
        {proposalCount !== undefined ? <InfoChip label={proposalCount === 0 ? 'Sin propuestas aún' : pluralize(proposalCount, 'propuesta', 'propuestas')} /> : null}
      </View>
      <Button label="Enviar propuesta" onPress={open} />
    </Card>
  );
}
