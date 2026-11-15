import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDraft } from '@/features/requests/draft';
import { RequestCard } from '@/features/requests/RequestCard';
import { aiApi } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { colors, radius } from '@/shared/theme';
import { Button, EmptyState, ErrorState, Icon, LoadingState, Screen, ScreenHeader, SectionHeader, Text, TextField } from '@/shared/ui';

const MIN_CHARS = 3;

/** Natural-language search over the client's own requests, with the chips the model understood. */
export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const { reset, update } = useDraft();
  const [text, setText] = useState(params.q ?? '');
  const query = useDebounce(text.trim(), 450);
  const enabled = query.length >= MIN_CHARS;

  const search = useApiQuery((signal) => {
    void signal;
    return aiApi.search(query, 0, 20);
  }, [query], { enabled });

  const results = search.data?.results.content ?? [];

  function publishNew() {
    reset();
    update({ description: text.trim() });
    router.push('/publish/confirm');
  }

  return (
    <Screen
      header={<ScreenHeader title="Buscar o describir" back fallbackHref="/home" />}
      footer={
        <View style={{ gap: 4 }}>
          <Text variant="smallStrong">¿Es un problema nuevo?</Text>
          <Text variant="small" color={colors.textMuted}>Publica una solicitud con estos datos ya llenos. Tú los revisas antes de enviar.</Text>
          <View style={{ paddingTop: 8 }}>
            <Button label="Publicar con estos datos" icon="sparkles" onPress={publishNew} disabled={text.trim().length < 10} />
          </View>
        </View>
      }
    >
      <TextField
        label="Tu búsqueda"
        value={text}
        onChangeText={setText}
        placeholder="Ej. la refri que gotea de la semana pasada"
        autoFocus={!params.q}
        returnKeyType="search"
        maxLength={300}
      />

      {!enabled ? (
        <EmptyState icon="sparkles-outline" title="Busca con tus palabras" message="Escribe equipo, marca, falla o cuándo la publicaste, y la IA local entiende el resto." />
      ) : search.initialLoading ? (
        <LoadingState label="Buscando…" />
      ) : search.error && !search.data ? (
        <ErrorState error={search.error} onRetry={search.refetch} />
      ) : (
        <>
          {search.data && search.data.understood.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text variant="smallStrong" color={colors.textSoft}>Entendí esto</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {search.data.understood.map((chip) => (
                  <View key={`${chip.key}-${chip.value}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 32 }}>
                    <Icon name="sparkles" size={12} color={colors.primary} />
                    <Text variant="smallStrong" color={colors.primary}>{chip.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <SectionHeader title={`En tus solicitudes (${search.data?.results.totalElements ?? 0})`} />
          {results.length === 0 ? (
            <EmptyState icon="search-outline" title="No encontré coincidencias" message="Prueba con otras palabras o publica una solicitud nueva con estos datos." />
          ) : (
            <View style={{ gap: 12 }}>
              {results.map((r) => (
                <RequestCard key={r.id} request={r} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
