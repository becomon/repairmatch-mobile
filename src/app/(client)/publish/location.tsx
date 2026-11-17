import { View } from 'react-native';
import { LocationPicker, useDraft, usePublishSubmit } from '@/features/requests';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, InfoRow, Screen, ScreenHeader, StepProgress, Text } from '@/shared/ui';

export default function PublishLocation() {
  const { update } = useDraft();
  const { draft, busy, progress, error, publish } = usePublishSubmit();

  return (
    <Screen
      header={<ScreenHeader title="¿En qué zona está?" back fallbackHref="/publish" />}
      footer={<Button label={busy && progress ? progress : 'Publicar solicitud'} onPress={() => void publish()} disabled={!draft.location} loading={busy} />}
    >
      <StepProgress step={4} total={4} />
      <Text variant="body" color={colors.textMuted}>
        Solo los técnicos cuyo radio cubre este punto verán tu solicitud. Compartes tu dirección exacta cuando eliges una propuesta.
      </Text>
      {error ? <Banner tone="danger" message={error} /> : null}
      <LocationPicker value={draft.location} onChange={(location) => update({ location })} />
      <Card style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>Resumen</Text>
        <View style={{ gap: 6 }}>
          <InfoRow label="Equipo" value={[draft.brand, draft.model].filter(Boolean).join(' ') || 'Sin marca'} />
          <InfoRow label="Fotos" value={String(draft.photos.length)} />
          <InfoRow label="Falla" value={draft.symptomLabel ?? draft.description.slice(0, 60)} />
        </View>
      </Card>
    </Screen>
  );
}
