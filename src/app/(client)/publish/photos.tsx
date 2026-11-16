import { useState } from 'react';
import { Image, Platform, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { choosePhoto } from '@/features/requests/choosePhoto';
import { useDraft } from '@/features/requests/draft';
import { MAX_PHOTOS } from '@/features/requests/publish';
import { friendlyError } from '@/shared/api/errors';
import { colors, radius } from '@/shared/theme';
import { Banner, Button, Icon, Screen, ScreenHeader, StepProgress, Text } from '@/shared/ui';

export default function PublishPhotos() {
  const router = useRouter();
  const { draft, update } = useDraft();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const full = draft.photos.length >= MAX_PHOTOS;

  async function add(source: 'camera' | 'gallery') {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const photo = await choosePhoto(source);
      if (photo) update({ photos: [...draft.photos, photo] });
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusy(false);
    }
  }

  const next = () => router.push('/publish/location');

  return (
    <Screen
      header={
        <ScreenHeader
          title="Muestra la falla"
          back
          fallbackHref="/publish"
          right={<Button label="Omitir" variant="ghost" compact onPress={next} />}
        />
      }
      footer={<Button label={draft.photos.length ? `Continuar con ${draft.photos.length} ${draft.photos.length === 1 ? 'foto' : 'fotos'}` : 'Continuar sin fotos'} onPress={next} />}
    >
      <StepProgress step={3} total={4} />
      <Text variant="body" color={colors.textMuted}>
        Opcional. Una foto de la etiqueta con el modelo y otra de la parte que falla ayudan a recibir mejores propuestas.
      </Text>

      {error ? <Banner tone="danger" message={error} /> : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {draft.photos.map((p, i) => (
          <View key={`${p.uri}-${i}`} style={{ width: '47%', flexGrow: 1, aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.neutralSoft }}>
            <Image source={{ uri: p.uri }} style={{ width: '100%', height: '100%' }} accessibilityLabel={`Foto ${i + 1} del electrodoméstico`} />
            {i === 0 ? (
              <View style={{ position: 'absolute', left: 8, bottom: 8, backgroundColor: colors.text, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text variant="caption" color="#ffffff">Portada</Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Quitar foto ${i + 1}`}
              onPress={() => update({ photos: draft.photos.filter((_, idx) => idx !== i) })}
              style={{ position: 'absolute', top: 6, right: 6, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(31,26,22,0.7)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="close" size={20} color="#ffffff" />
            </Pressable>
          </View>
        ))}
        {draft.photos.length === 0 ? (
          <View style={{ width: '100%', alignItems: 'center', gap: 8, paddingVertical: 32, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, backgroundColor: colors.surface }}>
            <Icon name="camera-outline" size={36} color={colors.textMuted} />
            <Text variant="small" color={colors.textMuted}>Aún no agregaste fotos</Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 10 }}>
        {Platform.OS !== 'web' ? <Button label="Tomar foto" icon="camera" onPress={() => void add('camera')} disabled={full} loading={busy} /> : null}
        <Button label={Platform.OS === 'web' ? 'Elegir foto' : 'Elegir de la galería'} icon="images" variant="secondary" onPress={() => void add('gallery')} disabled={full || busy} />
        <Text variant="small" color={colors.textMuted} align="center">
          {full ? `Llegaste al máximo de ${MAX_PHOTOS} fotos.` : `Se suben de forma segura al publicar. Hasta ${MAX_PHOTOS} fotos.`}
        </Text>
      </View>
    </Screen>
  );
}
