import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/features/auth/AuthProvider';
import { ApplianceTile } from '@/features/requests/ApplianceTile';
import { useDraft } from '@/features/requests/draft';
import { RequestCard } from '@/features/requests/RequestCard';
import { isOpenRequest } from '@/features/requests/status';
import { listApplianceTypes, requestsApi } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, radius } from '@/shared/theme';
import { Button, Card, EmptyState, ErrorState, Icon, LoadingState, Screen, SectionHeader, Text, TextField } from '@/shared/ui';

const MIN_CHARS = 10;

export default function ClientHome() {
  const router = useRouter();
  const user = useUser();
  const { update, reset } = useDraft();
  const [text, setText] = useState('');
  const types = useApiQuery((signal) => listApplianceTypes({ signal }), []);
  const recent = useApiQuery((signal) => requestsApi.list({ page: 0, size: 10, sort: 'newest' }, { signal }), [], { refetchOnFocus: true });

  const active = (recent.data?.content ?? []).filter((r) => isOpenRequest(r.status)).slice(0, 3);
  const canAnalyse = text.trim().length >= MIN_CHARS;

  function analyse() {
    reset();
    update({ description: text.trim() });
    router.push('/publish/confirm');
  }

  function startWith(applianceTypeId: number) {
    reset();
    update({ applianceTypeId });
    router.push('/publish');
  }

  return (
    <Screen inTabs onRefresh={() => { types.refetch(); recent.refetch(); }} refreshing={(types.loading && !!types.data) || (recent.loading && !!recent.data)}>
      <View style={{ gap: 2, paddingTop: 8 }}>
        <Text variant="small" color={colors.textMuted}>Hola, {user.name.split(' ')[0]}</Text>
        <Text variant="display">¿Qué se malogró?</Text>
      </View>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={20} color={colors.primary} />
          <Text variant="bodyStrong" style={{ flex: 1 }}>Cuéntanos la falla</Text>
          <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text variant="caption" color={colors.primary}>IA</Text>
          </View>
        </View>
        <TextField
          label="Descripción"
          value={text}
          onChangeText={setText}
          placeholder="Describe la falla… ej. mi refri Samsung dejó de enfriar desde ayer"
          multiline
          maxLength={5000}
        />
        <Button label="Entender mi problema" icon="sparkles" onPress={analyse} disabled={!canAnalyse} accessibilityHint="Prepara tu solicitud con la descripción" />
        <Button
          label="Buscar en mis solicitudes"
          icon="search"
          variant="ghost"
          onPress={() => router.push({ pathname: '/search', params: { q: text.trim() } })}
          disabled={text.trim().length < 3}
        />
      </Card>

      <SectionHeader title="O elige tu equipo" />
      {types.initialLoading ? (
        <LoadingState />
      ) : types.error ? (
        <ErrorState error={types.error} onRetry={types.refetch} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {(types.data ?? []).map((t) => (
            <View key={t.id} style={{ width: '48%', flexGrow: 1 }}>
              <Card onPress={() => startWith(t.id)} accessibilityLabel={`Publicar solicitud de ${t.name}`} style={{ gap: 10 }}>
                <ApplianceTile name={t.name} size={56} />
                <Text variant="heading">{t.name}</Text>
                <Text variant="small" color={colors.textMuted} numberOfLines={2}>{t.description || 'Publica tu solicitud'}</Text>
              </Card>
            </View>
          ))}
        </View>
      )}

      <SectionHeader title="Mis solicitudes activas" actionLabel="Ver todas" onAction={() => router.push('/requests')} />
      {recent.initialLoading ? (
        <LoadingState />
      ) : recent.error && !recent.data ? (
        <ErrorState error={recent.error} onRetry={recent.refetch} />
      ) : active.length === 0 ? (
        <EmptyState icon="construct-outline" title="Sin solicitudes activas" message="Cuando publiques una falla, la verás aquí con sus propuestas." />
      ) : (
        <View style={{ gap: 10 }}>
          {active.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </View>
      )}
    </Screen>
  );
}
