import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { RequestCard, useRequestSearch } from '@/features/requests';
import { MAX_SEARCH_CHARS } from '@/shared/constants';
import { colors, radius } from '@/shared/theme';
import { AiSearchBox, Button, EmptyState, ErrorState, Icon, LoadingState, Screen, ScreenHeader, SectionHeader, Text } from '@/shared/ui';

/** Natural-language search over the client's own requests, with the chips the model understood. */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const { text, setText, enabled, search, results, canPublish, publishNew } = useRequestSearch(params.q ?? '');

  return (
    <Screen
      band="sand"
      header={<ScreenHeader title="Buscar o describir" back fallbackHref="/home" />}
      footer={
        <View style={{ gap: 4 }}>
          <Text variant="smallStrong">¿Es un problema nuevo?</Text>
          <Text variant="small" color={colors.textMuted}>Publica una solicitud con estos datos ya llenos. Tú los revisas antes de enviar.</Text>
          <View style={{ paddingTop: 8 }}>
            <Button label="Publicar con estos datos" icon="sparkles" sweep onPress={publishNew} disabled={!canPublish} />
          </View>
        </View>
      }
    >
      <AiSearchBox
        label="Tu búsqueda"
        value={text}
        onChangeText={setText}
        placeholder="ej. 'Mi lavadora hace ruido y no bota agua'"
        autoFocus={!params.q}
        returnKeyType="search"
        maxLength={MAX_SEARCH_CHARS}
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
                  <View key={`${chip.key}-${chip.value}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.freshSoft, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 32 }}>
                    <Icon name="sparkles" size={12} color={colors.freshStrong} />
                    <Text variant="smallStrong" color={colors.freshStrong}>{chip.label}</Text>
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
