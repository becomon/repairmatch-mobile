import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/features/auth/AuthProvider';
import { useDraft } from '@/features/requests/draft';
import { RequestCard } from '@/features/requests/RequestCard';
import { ServiceCard } from '@/features/services/ServiceCard';
import { applianceLabel } from '@/features/catalog/appliances';
import { listApplianceTypes, requestsApi, servicesApi } from '@/shared/api/endpoints';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, radius } from '@/shared/theme';
import { AiSearchBox, Button, Card, EmptyState, ErrorState, Icon, LoadingState, Reveal, ScenePanel, Screen, SectionHeader, Text } from '@/shared/ui';

const MIN_CHARS = 10;

export default function ClientHome() {
  const router = useRouter();
  const user = useUser();
  const { update, reset } = useDraft();
  const [text, setText] = useState('');
  const types = useApiQuery((signal) => listApplianceTypes({ signal }), []);
  // The API filters by one status at a time, so the two open states are read separately (newest 3 each).
  const withOffers = useApiQuery((signal) => requestsApi.list({ page: 0, size: 3, status: 'CON_PROPUESTAS', sort: 'newest' }, { signal }), [], { refetchOnFocus: true });
  const published = useApiQuery((signal) => requestsApi.list({ page: 0, size: 3, status: 'PUBLICADA', sort: 'newest' }, { signal }), [], { refetchOnFocus: true });
  const services = useApiQuery((signal) => servicesApi.list({ signal }), [], { refetchOnFocus: true });

  // Requests with offers need an answer first, so they lead.
  const active = [...(withOffers.data?.content ?? []), ...(published.data?.content ?? [])].slice(0, 3);
  const recentLoading = withOffers.initialLoading || published.initialLoading;
  const recentError = (withOffers.error && !withOffers.data) || (published.error && !published.data) ? (withOffers.error ?? published.error) : null;
  const liveServices = (services.data ?? []).filter((s) => s.status === 'PROGRAMADO' || s.status === 'EN_ATENCION').slice(0, 2);
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
    <Screen inTabs band="mint" onRefresh={() => { types.refetch(); withOffers.refetch(); published.refetch(); services.refetch(); }} refreshing={(types.loading && !!types.data) || (withOffers.loading && !!withOffers.data) || (published.loading && !!published.data)}>
      <View style={{ gap: 2, paddingTop: 8 }}>
        <Text variant="small" color={colors.textMuted}>Hola, {user.name.split(' ')[0]}</Text>
        <Text variant="display">¿Qué se malogró?</Text>
      </View>

      <Reveal index={1}>
      <Card glow style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={20} color={colors.primary} />
          <Text variant="bodyStrong" style={{ flex: 1 }}>Cuéntanos la falla</Text>
          <View style={{ backgroundColor: colors.freshSoft, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text variant="caption" color={colors.freshStrong}>IA</Text>
          </View>
        </View>
        <AiSearchBox
          label="Descripción"
          value={text}
          onChangeText={setText}
          placeholder="ej. 'Mi lavadora hace ruido y no bota agua'"
          multiline
          maxLength={5000}
        />
        <Button label="Entender mi problema" icon="sparkles" sweep onPress={analyse} disabled={!canAnalyse} accessibilityHint="Prepara tu solicitud con la descripción" />
        <Button
          label="Buscar en mis solicitudes"
          icon="search"
          variant="ghost"
          onPress={() => router.push({ pathname: '/search', params: { q: text.trim() } })}
          disabled={text.trim().length < 3}
        />
      </Card>
      </Reveal>

      <SectionHeader title="O elige tu equipo" />
      {types.initialLoading ? (
        <LoadingState />
      ) : types.error ? (
        <ErrorState error={types.error} onRetry={types.refetch} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {(types.data ?? []).map((t, i) => (
            <Reveal key={t.id} index={i + 2} style={{ width: '48%', flexGrow: 1 }}>
              <Card onPress={() => startWith(t.id)} accessibilityLabel={`Publicar solicitud de ${applianceLabel(t.name)}`} style={{ gap: 10 }}>
                <ScenePanel name={t.name} height={84} />
                <Text variant="heading" numberOfLines={2}>{applianceLabel(t.name)}</Text>
                <Text variant="small" color={colors.textMuted}>Publicar solicitud</Text>
              </Card>
            </Reveal>
          ))}
        </View>
      )}

      <SectionHeader title="Mis solicitudes activas" actionLabel="Ver todas" onAction={() => router.push('/requests')} />
      {recentLoading ? (
        <LoadingState />
      ) : recentError ? (
        <ErrorState error={recentError} onRetry={() => { withOffers.refetch(); published.refetch(); }} />
      ) : active.length === 0 ? (
        <EmptyState icon="construct-outline" title="Sin solicitudes activas" message="Cuando publiques una falla, la verás aquí con sus propuestas." />
      ) : (
        <View style={{ gap: 10 }}>
          {active.map((r, i) => (
            <Reveal key={r.id} index={i}><RequestCard request={r} /></Reveal>
          ))}
        </View>
      )}

      {liveServices.length > 0 ? (
        <>
          <SectionHeader title="Servicios en curso" actionLabel="Ver todos" onAction={() => router.push('/services')} />
          <View style={{ gap: 10 }}>
            {liveServices.map((s) => (
              <ServiceCard key={s.id} service={s} role="CLIENT" onChanged={() => services.refetch()} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
