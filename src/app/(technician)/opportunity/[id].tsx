import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApplianceTile } from '@/features/catalog';
import { MAX_CONDITIONS_CHARS, ProposalScheduleFields, useSubmitProposal } from '@/features/proposals';
import { opportunityTitle, parseOpportunity } from '@/features/technicians';
import { formatDistance, formatMoney } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, EmptyState, Screen, ScreenHeader, Text, TextField } from '@/shared/ui';

/** Send a proposal: diagnostic cost, when the technician can go, and conditions. */
export default function SendProposal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const opportunity = parseOpportunity(params.data);
  const form = useSubmitProposal(Number(params.id));

  const header = <ScreenHeader title="Enviar propuesta" back fallbackHref="/cases" />;
  if (!opportunity) {
    return (
      <Screen header={header}>
        <EmptyState icon="alert-circle-outline" title="No pudimos abrir este caso" message="Vuelve a la lista y elígelo otra vez." actionLabel="Volver a los casos" onAction={() => router.replace('/cases')} />
      </Screen>
    );
  }

  if (form.sent) {
    return (
      <Screen header={<ScreenHeader title="Propuesta enviada" />}>
        <EmptyState icon="checkmark-circle-outline" title="¡Propuesta enviada!" message="El cliente la comparará con las de otros técnicos. Sigue su estado en Mi trabajo." actionLabel="Ver mis propuestas" onAction={() => router.replace('/work')} />
      </Screen>
    );
  }

  return (
    <Screen header={header} footer={<Button label="Enviar propuesta" onPress={() => void form.submit()} loading={form.busy} />}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ApplianceTile name={opportunity.applianceTypeName} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong" numberOfLines={1}>{opportunityTitle(opportunity)}</Text>
            <Text variant="small" color={colors.textMuted}>A {formatDistance(opportunity.distanceKm)} de tu zona</Text>
          </View>
        </View>
        <Text variant="small" color={colors.textSoft}>«{opportunity.description}»</Text>
      </Card>

      {form.formError ? <Banner tone="danger" message={form.formError} /> : null}

      <TextField
        label="Costo de visita y diagnóstico (S/)"
        value={form.cost}
        onChangeText={form.setCost}
        error={form.errors.cost}
        keyboardType="decimal-pad"
        placeholder="30"
        hint={form.costPreview !== null ? `El cliente verá ${formatMoney(form.costPreview)}` : undefined}
      />

      <ProposalScheduleFields
        days={form.days}
        dayOffset={form.dayOffset}
        hour={form.hour}
        onDayChange={form.setDayOffset}
        onHourChange={form.setHour}
        error={form.errors.when}
      />

      <TextField
        label="Mensaje y condiciones"
        value={form.conditions}
        onChangeText={form.setConditions}
        error={form.errors.conditions}
        multiline
        maxLength={MAX_CONDITIONS_CHARS}
        placeholder="El costo cubre visita y diagnóstico. Los repuestos se cotizan aparte."
      />
      <Text variant="small" color={colors.textMuted}>El cliente compara tu propuesta con las de otros técnicos.</Text>
    </Screen>
  );
}
