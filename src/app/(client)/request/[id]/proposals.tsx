import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { applianceTitle } from '@/features/catalog';
import { PROPOSAL_SORTS, ProposalOfferCard, useCompareProposals } from '@/features/proposals';
import { pluralize } from '@/shared/format';
import { GUTTER } from '@/shared/theme';
import { Banner, Button, ConfirmDialog, EmptyState, ErrorState, FilterChip, LoadingState, Reveal, Screen, ScreenHeader } from '@/shared/ui';

export default function CompareProposals() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const compare = useCompareProposals(Number(params.id));
  const { request, offers, items, selected } = compare;

  const header = (
    <ScreenHeader
      title={offers.data ? pluralize(offers.data.length, 'propuesta', 'propuestas') : 'Propuestas'}
      subtitle={request.data ? applianceTitle(request.data.applianceTypeName, request.data.brand) : undefined}
      back
      fallbackHref="/requests"
    />
  );

  if (offers.initialLoading) return <Screen header={header}><LoadingState label="Comparando propuestas…" /></Screen>;
  if (!offers.data) return <Screen header={header}><ErrorState error={offers.error} onRetry={offers.refetch} /></Screen>;

  const firstName = selected?.proposal.technicianName.split(' ')[0] ?? 'El técnico';
  return (
    <Screen
      header={header}
      onRefresh={compare.refresh}
      refreshing={offers.loading}
      footer={
        items.length > 0 && compare.canAccept ? (
          <Button
            label={selected ? `Elegir a ${selected.proposal.technicianName}` : 'Elige una propuesta'}
            disabled={!selected}
            onPress={() => compare.setConfirming(true)}
          />
        ) : null
      }
    >
      {compare.error ? <Banner tone="danger" message={compare.error} /> : null}
      {request.data && !compare.canAccept ? <Banner tone="info" message="Esta solicitud ya no recibe propuestas, por eso no puedes elegir una." /> : null}

      {items.length === 0 ? (
        <EmptyState icon="hourglass-outline" title="Aún no hay propuestas" message="Los técnicos cercanos están viendo tu caso. Te las mostramos aquí en cuanto lleguen." actionLabel="Volver a mi solicitud" onAction={() => router.back()} />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER }} style={{ marginHorizontal: -GUTTER, flexGrow: 0 }}>
            {PROPOSAL_SORTS.map((s) => (
              <FilterChip key={s.value} label={s.label} selected={compare.sort === s.value} onPress={() => compare.setSort(s.value)} />
            ))}
          </ScrollView>

          {items.map((offer, index) => (
            <Reveal key={offer.proposal.id} index={index}>
              <ProposalOfferCard
                offer={offer}
                selected={offer.proposal.id === compare.selectedId}
                top={offer.recommended && compare.sort === 'recommended'}
                selectable={compare.canAccept}
                onToggle={() => compare.toggle(offer.proposal.id)}
              />
            </Reveal>
          ))}
        </>
      )}

      <ConfirmDialog
        visible={compare.confirming}
        title={`¿Elegir a ${selected?.proposal.technicianName ?? ''}?`}
        message={`Solo puedes elegir una propuesta. Las otras se cierran y la solicitud deja de recibir ofertas. ${firstName} verá tu dirección exacta.`}
        confirmLabel="Seleccionar"
        cancelLabel="Seguir viendo"
        loading={compare.busy}
        onConfirm={() => void compare.accept()}
        onCancel={() => compare.setConfirming(false)}
      />
    </Screen>
  );
}
