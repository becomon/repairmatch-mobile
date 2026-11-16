import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApplianceTile } from '@/features/requests/ApplianceTile';
import { opportunityTitle } from '@/features/technicians/OpportunityCard';
import { ApiError, friendlyError } from '@/shared/api/errors';
import { proposalsApi } from '@/shared/api/endpoints';
import type { MatchingRequest } from '@/shared/api/types';
import { formatDistance, formatMoney, toLocalDateTime } from '@/shared/format';
import { colors, GUTTER } from '@/shared/theme';
import { Banner, Button, Card, EmptyState, FilterChip, Screen, ScreenHeader, Text, TextField } from '@/shared/ui';

const HOURS = [8, 10, 12, 14, 16, 18];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function parseOpportunity(raw: string | undefined): MatchingRequest | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<MatchingRequest>;
    return typeof value.requestId === 'number' && typeof value.description === 'string' ? (value as MatchingRequest) : null;
  } catch {
    return null;
  }
}

function dayLabel(offset: number, date: Date) {
  if (offset === 0) return 'Hoy';
  if (offset === 1) return 'Mañana';
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()}`;
}

/** Send a proposal: diagnostic cost, when the technician can go, and conditions. */
export default function SendProposal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const requestId = Number(params.id);
  const opportunity = parseOpportunity(params.data);

  const days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, offset) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
      return { offset, date: d, label: dayLabel(offset, d) };
    });
  }, []);

  const [cost, setCost] = useState('');
  const [dayOffset, setDayOffset] = useState(1);
  const [hour, setHour] = useState(10);
  const [conditions, setConditions] = useState('');
  const [errors, setErrors] = useState<{ cost?: string; when?: string; conditions?: string }>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const header = <ScreenHeader title="Enviar propuesta" back fallbackHref="/cases" />;
  if (!opportunity) {
    return (
      <Screen header={header}>
        <EmptyState icon="alert-circle-outline" title="No pudimos abrir este caso" message="Vuelve a la lista y elígelo otra vez." actionLabel="Volver a los casos" onAction={() => router.replace('/cases')} />
      </Screen>
    );
  }

  if (sent) {
    return (
      <Screen header={<ScreenHeader title="Propuesta enviada" />}>
        <EmptyState icon="checkmark-circle-outline" title="¡Propuesta enviada!" message="El cliente la comparará con las de otros técnicos. Sigue su estado en Mi trabajo." actionLabel="Ver mis propuestas" onAction={() => router.replace('/work')} />
      </Screen>
    );
  }

  async function submit() {
    const amount = Number(cost.replace(',', '.'));
    const availableAt = new Date(days[dayOffset]!.date.getFullYear(), days[dayOffset]!.date.getMonth(), days[dayOffset]!.date.getDate(), hour, 0, 0);
    const next = {
      cost: cost.trim() === '' || !Number.isFinite(amount) || amount < 0 ? 'Escribe un costo válido, por ejemplo 30.' : amount > 99999999 ? 'El costo es demasiado alto.' : undefined,
      when: availableAt.getTime() <= Date.now() ? 'Elige un horario que aún no pasó.' : undefined,
      conditions: conditions.trim() === '' ? 'Cuéntale al cliente qué incluye tu visita.' : undefined,
    };
    setErrors(next);
    setFormError('');
    if (next.cost || next.when || next.conditions) return;
    setBusy(true);
    try {
      await proposalsApi.submit(requestId, { diagnosticCost: Math.round(amount * 100) / 100, availableAt: toLocalDateTime(availableAt), conditions: conditions.trim() });
      setSent(true);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) setFormError('Ya enviaste una propuesta a este caso o el cliente ya cerró la solicitud.');
      else if (cause instanceof ApiError && cause.status === 403) setFormError('Este caso ya no es compatible con tu perfil o tu zona de atención.');
      else setFormError(friendlyError(cause));
    } finally {
      setBusy(false);
    }
  }

  const preview = Number(cost.replace(',', '.'));
  return (
    <Screen header={header} footer={<Button label="Enviar propuesta" onPress={() => void submit()} loading={busy} />}>
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

      {formError ? <Banner tone="danger" message={formError} /> : null}

      <TextField
        label="Costo de visita y diagnóstico (S/)"
        value={cost}
        onChangeText={setCost}
        error={errors.cost}
        keyboardType="decimal-pad"
        placeholder="30"
        hint={Number.isFinite(preview) && cost.trim() !== '' && preview >= 0 ? `El cliente verá ${formatMoney(preview)}` : undefined}
      />

      <View style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>Puedo ir</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER }} style={{ marginHorizontal: -GUTTER, flexGrow: 0 }}>
          {days.map((d) => (
            <FilterChip key={d.offset} label={d.label} selected={dayOffset === d.offset} onPress={() => setDayOffset(d.offset)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER }} style={{ marginHorizontal: -GUTTER, flexGrow: 0 }}>
          {HOURS.map((h) => (
            <FilterChip key={h} label={`${h}:00`} selected={hour === h} disabled={dayOffset === 0 && h <= new Date().getHours()} onPress={() => setHour(h)} />
          ))}
        </ScrollView>
        {errors.when ? <Text variant="small" color={colors.danger}>{errors.when}</Text> : null}
      </View>

      <TextField
        label="Mensaje y condiciones"
        value={conditions}
        onChangeText={setConditions}
        error={errors.conditions}
        multiline
        maxLength={1000}
        placeholder="El costo cubre visita y diagnóstico. Los repuestos se cotizan aparte."
      />
      <Text variant="small" color={colors.textMuted}>El cliente compara tu propuesta con las de otros técnicos.</Text>
    </Screen>
  );
}
