import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { RecommendedProposal } from '@/shared/api/types';
import { formatDistance, formatMoney, formatWhen } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Avatar, Card, IdentityPill, InfoChip, RatingSummary, Text, VerifiedPill } from '@/shared/ui';

interface Props {
  offer: RecommendedProposal;
  selected: boolean;
  /** Shown as the top pick (only while sorted by "Recomendado"). */
  top: boolean;
  /** The request still accepts proposals, so the card can be selected. */
  selectable: boolean;
  onToggle: () => void;
}

/** One technician's offer in the comparison: who, how much, when, and why it was recommended. */
export function ProposalOfferCard({ offer: o, selected, top, selectable, onToggle }: Props) {
  const router = useRouter();
  const p = o.proposal;
  return (
    <Card
      glow={!top}
      highlight={top || selected}
      onPress={selectable ? onToggle : undefined}
      accessibilityLabel={`Propuesta de ${p.technicianName}, ${formatMoney(p.diagnosticCost)}`}
      style={{ gap: 10, ...(selected ? { borderColor: colors.primary, backgroundColor: colors.primarySoft } : null) }}
    >
      {top ? <VerifiedPill label={`Recomendado${o.reasons[0] ? `: ${o.reasons[0].label}` : ''}`} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={p.technicianName} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>{p.technicianName}</Text>
          {p.identityVerified ? <IdentityPill nameMatches={p.identityNameMatches} /> : null}
          <RatingSummary average={o.averageRating} count={o.reviewCount} />
          {o.distanceKm !== null ? <Text variant="small" color={colors.textMuted}>a {formatDistance(o.distanceKm)}</Text> : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="heading" style={{ fontSize: 20 }}>{formatMoney(p.diagnosticCost)}</Text>
          <Text variant="small" color={colors.textMuted}>diagnóstico</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <InfoChip label={formatWhen(p.availableAt)} />
        {(top ? o.reasons.slice(1) : o.reasons).slice(0, 2).map((reason) => (
          <InfoChip key={reason.code} label={reason.label} />
        ))}
      </View>
      <Text variant="small" color={colors.textSoft}>«{p.conditions}»</Text>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push({ pathname: '/technician/[id]', params: { id: p.technicianId } })}
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <Text variant="smallStrong" color={colors.link}>Ver perfil de {p.technicianName.split(' ')[0]}</Text>
      </Pressable>
    </Card>
  );
}
