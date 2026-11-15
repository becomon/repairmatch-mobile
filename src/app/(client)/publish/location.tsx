import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDraft } from '@/features/requests/draft';
import { LocationPicker } from '@/features/requests/LocationPicker';
import { publishDraft } from '@/features/requests/publish';
import { friendlyError } from '@/shared/api/errors';
import type { ServiceRequest } from '@/shared/api/types';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, InfoRow, Screen, ScreenHeader, StepProgress, Text } from '@/shared/ui';

export default function PublishLocation() {
  const router = useRouter();
  const { draft, update, reset } = useDraft();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  // Once the request exists, retrying must not create a duplicate.
  const [created, setCreated] = useState<{ request: ServiceRequest; failedPhotos: number } | null>(null);

  function finish(result: { request: ServiceRequest; failedPhotos: number }) {
    reset();
    router.replace({ pathname: '/request/[id]', params: { id: String(result.request.id), photosFailed: String(result.failedPhotos) } });
  }

  async function publish() {
    if (created) return finish(created);
    setBusy(true);
    setError('');
    try {
      const result = await publishDraft(draft, setProgress);
      setCreated(result);
      finish(result);
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

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
