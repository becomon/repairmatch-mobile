import { View } from 'react-native';
import type { ServiceStatus } from '@/shared/api/types';
import { formatWhen } from '@/shared/format';
import { colors } from '@/shared/theme';
import { Card, Icon, SectionHeader, Text } from '@/shared/ui';

const STEPS: { status: ServiceStatus; label: string }[] = [
  { status: 'PROGRAMADO', label: 'Programado' },
  { status: 'EN_ATENCION', label: 'En atención' },
  { status: 'COMPLETADO', label: 'Completado' },
];

const SUMMARY: Record<ServiceStatus, string> = {
  PROGRAMADO: 'El servicio está agendado y a la espera de que el técnico inicie la atención.',
  EN_ATENCION: 'El técnico está realizando la reparación.',
  COMPLETADO: 'La reparación terminó. El cliente ya puede dejar su reseña.',
  CANCELADO: 'Este servicio se canceló antes de comenzar.',
};

function stepState(step: ServiceStatus, current: ServiceStatus): 'done' | 'current' | 'pending' {
  if (current === 'CANCELADO') return step === 'PROGRAMADO' ? 'done' : 'pending';
  const order = STEPS.findIndex((s) => s.status === step);
  const now = STEPS.findIndex((s) => s.status === current);
  if (order < now || current === 'COMPLETADO') return 'done';
  return order === now ? 'current' : 'pending';
}

/** "Estado del servicio": a one-line summary and the three steps with where the service is. */
export function ServiceTimeline({ status, createdAt }: { status: ServiceStatus; createdAt: string }) {
  return (
    <>
      <SectionHeader title="Estado del servicio" />
      <Text variant="small" color={colors.textSoft}>{SUMMARY[status]}</Text>
      <Card style={{ gap: 0 }}>
        {STEPS.map((step, index) => {
          const state = stepState(step.status, status);
          const last = index === STEPS.length - 1;
          const done = state === 'done';
          const current = state === 'current';
          return (
            <View key={step.status} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', width: 24 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.fresh : current ? colors.primary : colors.border }}>
                  {done ? <Icon name="checkmark" size={16} color={colors.white} /> : current ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} /> : null}
                </View>
                {!last ? <View style={{ width: 2, flex: 1, minHeight: 28, backgroundColor: done ? colors.success : colors.border }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                <Text variant="bodyStrong" color={state === 'pending' ? colors.textMuted : colors.text}>{step.label}</Text>
                <Text variant="small" color={colors.textMuted}>
                  {step.status === 'PROGRAMADO' ? formatWhen(createdAt) : done ? 'Listo' : current ? 'En curso' : 'Pendiente'}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>
    </>
  );
}
