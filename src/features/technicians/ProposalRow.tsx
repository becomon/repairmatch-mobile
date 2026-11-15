import { View } from 'react-native';
import { requestsApi } from '@/shared/api/endpoints';
import type { Proposal } from '@/shared/api/types';
import { formatMoney, formatWhen } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors } from '@/shared/theme';
import { Card, InfoChip, StatusChip, Text } from '@/shared/ui';
import { ApplianceTile } from '../requests/ApplianceTile';
import { requestTitle } from '../requests/RequestCard';
import { PROPOSAL_STATUS_LABEL, PROPOSAL_STATUS_TONE } from '../requests/status';

/** One of the technician's own proposals; the appliance name is looked up from the request. */
export function ProposalRow({ proposal }: { proposal: Proposal }) {
  const request = useApiQuery((signal) => requestsApi.get(proposal.requestId, { signal }), [proposal.requestId]);
  const title = request.data ? requestTitle(request.data) : `Solicitud #${proposal.requestId}`;
  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={request.data?.applianceTypeName ?? ''} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{title}</Text>
          <Text variant="small" color={colors.textMuted} numberOfLines={1}>{formatMoney(proposal.diagnosticCost)} · visita</Text>
        </View>
        <StatusChip label={PROPOSAL_STATUS_LABEL[proposal.status]} tone={PROPOSAL_STATUS_TONE[proposal.status]} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <InfoChip label={formatWhen(proposal.availableAt)} />
        {request.data && request.data.status === 'CANCELADA' ? <InfoChip label="Solicitud cancelada" /> : null}
      </View>
      <Text variant="small" color={colors.textSoft} numberOfLines={2}>«{proposal.conditions}»</Text>
    </Card>
  );
}
