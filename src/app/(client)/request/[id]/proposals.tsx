import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { isOpenRequest } from '@/features/requests/status';
import { friendlyError } from '@/shared/api/errors';
import { proposalsApi, requestsApi } from '@/shared/api/endpoints';
import type { RecommendedProposal } from '@/shared/api/types';
import { formatDistance, formatMoney, formatWhen } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, GUTTER } from '@/shared/theme';
import { Avatar, Banner, Button, Card, ConfirmDialog, EmptyState, ErrorState, FilterChip, InfoChip, LoadingState, RatingSummary, Screen, ScreenHeader, Text } from '@/shared/ui';

type Sort = 'recommended' | 'cost' | 'rating' | 'soonest';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'recommended', label: 'Recomendado' },
  { value: 'cost', label: 'Menor costo' },
  { value: 'rating', label: 'Mejor calificado' },
  { value: 'soonest', label: 'Más pronto' },
];

function sortProposals(items: RecommendedProposal[], sort: Sort): RecommendedProposal[] {
  const copy = [...items];
  switch (sort) {
    case 'cost':
      return copy.sort((a, b) => a.proposal.diagnosticCost - b.proposal.diagnosticCost);
    case 'rating':
      return copy.sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
    case 'soonest':
      return copy.sort((a, b) => a.proposal.availableAt.localeCompare(b.proposal.availableAt));
    default:
      return copy; // API order: best score first
  }
}

export default function CompareProposals() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const request = useApiQuery((signal) => requestsApi.get(id, { signal }), [id]);
  const offers = useApiQuery((signal) => proposalsApi.recommended(id, { signal }), [id]);
  const [sort, setSort] = useState<Sort>('recommended');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const items = sortProposals(offers.data ?? [], sort);
  const selected = items.find((o) => o.proposal.id === selectedId) ?? null;
  const canAccept = request.data ? isOpenRequest(request.data.status) : false;

  async function accept() {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const service = await proposalsApi.accept(selected.proposal.id);
      setConfirming(false);
      router.replace({ pathname: '/service/[id]', params: { id: String(service.id) } });
    } catch (cause) {
      setConfirming(false);
      setError(friendlyError(cause));
      offers.refetch();
      request.refetch();
    } finally {
      setBusy(false);
    }
  }

  const header = (
    <ScreenHeader
      title={offers.data ? `${offers.data.length} ${offers.data.length === 1 ? 'propuesta' : 'propuestas'}` : 'Propuestas'}
      subtitle={request.data ? `${request.data.applianceTypeName}${request.data.brand ? ` ${request.data.brand}` : ''}` : undefined}
      back
      fallbackHref="/requests"
    />
  );

  if (offers.initialLoading) return <Screen header={header}><LoadingState label="Comparando propuestas…" /></Screen>;
  if (!offers.data) return <Screen header={header}><ErrorState error={offers.error} onRetry={offers.refetch} /></Screen>;

  return (
    <Screen
      header={header}
      onRefresh={() => { offers.refetch(); request.refetch(); }}
      refreshing={offers.loading}
      footer={
        items.length > 0 && canAccept ? (
          <Button
            label={selected ? `Elegir a ${selected.proposal.technicianName}` : 'Elige una propuesta'}
            disabled={!selected}
            onPress={() => setConfirming(true)}
          />
        ) : null
      }
    >
      {error ? <Banner tone="danger" message={error} /> : null}
      {request.data && !canAccept ? <Banner tone="info" message="Esta solicitud ya no recibe propuestas, por eso no puedes elegir una." /> : null}

      {items.length === 0 ? (
        <EmptyState icon="hourglass-outline" title="Aún no hay propuestas" message="Los técnicos cercanos están viendo tu caso. Te las mostramos aquí en cuanto lleguen." actionLabel="Volver a mi solicitud" onAction={() => router.back()} />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER }} style={{ marginHorizontal: -GUTTER, flexGrow: 0 }}>
            {SORTS.map((s) => (
              <FilterChip key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />
            ))}
          </ScrollView>

          {items.map((o) => {
            const p = o.proposal;
            const isSelected = p.id === selectedId;
            const top = o.recommended && sort === 'recommended';
            return (
              <Card
                key={p.id}
                highlight={top || isSelected}
                onPress={canAccept ? () => setSelectedId(isSelected ? null : p.id) : undefined}
                accessibilityLabel={`Propuesta de ${p.technicianName}, ${formatMoney(p.diagnosticCost)}`}
                style={{ gap: 10, ...(isSelected ? { borderColor: colors.primary, backgroundColor: colors.primarySoft } : null) }}
              >
                {top ? (
                  <View style={{ alignSelf: 'flex-start', backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text variant="caption" color={colors.accentDark}>
                      Recomendado{o.reasons[0] ? `: ${o.reasons[0].label}` : ''}
                    </Text>
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Avatar name={p.technicianName} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodyStrong" numberOfLines={1}>{p.technicianName}</Text>
                    <RatingSummary average={o.averageRating} count={o.reviewCount} />
                    {o.distanceKm !== null ? <Text variant="small" color={colors.textMuted}>a {formatDistance(o.distanceKm)}</Text> : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="heading" style={{ fontSize: 20 }}>{formatMoney(p.diagnosticCost)}</Text>
                    <Text variant="small" color={colors.textMuted}>visita y diagnóstico</Text>
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
                  style={{ minHeight: 40, justifyContent: 'center' }}
                >
                  <Text variant="smallStrong" color={colors.primary}>Ver perfil de {p.technicianName.split(' ')[0]}</Text>
                </Pressable>
              </Card>
            );
          })}
        </>
      )}

      <ConfirmDialog
        visible={confirming}
        title={`¿Elegir a ${selected?.proposal.technicianName ?? ''}?`}
        message={`Solo puedes elegir una propuesta. Las otras se cierran y la solicitud deja de recibir ofertas. ${selected?.proposal.technicianName.split(' ')[0] ?? 'El técnico'} verá tu dirección exacta.`}
        confirmLabel="Seleccionar"
        cancelLabel="Seguir viendo"
        loading={busy}
        onConfirm={() => void accept()}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
