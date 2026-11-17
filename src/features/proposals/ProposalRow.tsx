import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Proposal } from '@/shared/api/types';
import { formatMoney, formatWhen } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Card, Icon, InfoChip, StatusChip, Text } from '@/shared/ui';
import { ApplianceTile } from '@/features/catalog';
import { requestTitle, useRequestSummary } from '@/features/requests';
import { PROPOSAL_STATUS_LABEL, PROPOSAL_STATUS_TONE } from './status';

interface Props {
  proposal: Proposal;
  /** Service created when the client accepted this proposal; makes the row open its tracking. */
  serviceId?: number;
}

/** One of the technician's own proposals; the appliance name is looked up from the request. */
export function ProposalRow({ proposal, serviceId }: Props) {
  const router = useRouter();
  const request = useRequestSummary(proposal.requestId);
  const title = request ? requestTitle(request) : `Solicitud #${proposal.requestId}`;
  const open = serviceId !== undefined ? () => router.push({ pathname: '/job/[id]', params: { id: String(serviceId) } }) : undefined;
  return (
    <Card onPress={open} accessibilityLabel={`${title}, ${PROPOSAL_STATUS_LABEL[proposal.status]}`} style={{ gap: 10, opacity: proposal.status === 'REJECTED' ? 0.75 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ApplianceTile name={request?.applianceTypeName ?? ''} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{title}</Text>
          <Text variant="small" color={colors.textMuted} numberOfLines={1}>{formatMoney(proposal.diagnosticCost)} · visita</Text>
        </View>
        <StatusChip label={PROPOSAL_STATUS_LABEL[proposal.status]} tone={PROPOSAL_STATUS_TONE[proposal.status]} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <InfoChip label={formatWhen(proposal.availableAt)} />
        {request && request.status === 'CANCELADA' ? <InfoChip label="Solicitud cancelada" /> : null}
      </View>
      <Text variant="small" color={colors.textSoft} numberOfLines={2}>«{proposal.conditions}»</Text>
      {open ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 }}>
          <Text variant="smallStrong" color={colors.link} style={{ flex: 1 }}>El cliente eligió tu propuesta · Ver servicio</Text>
          <Icon name="chevron-forward" size={18} color={colors.link} />
        </View>
      ) : null}
    </Card>
  );
}
