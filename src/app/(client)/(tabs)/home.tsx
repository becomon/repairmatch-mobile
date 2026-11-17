import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/features/auth';
import { applianceLabel } from '@/features/catalog';
import { HomeIntentCard, useClientHome } from '@/features/home';
import { RequestCard } from '@/features/requests';
import { ServiceCard } from '@/features/services';
import { colors } from '@/shared/theme';
import { Card, EmptyState, ErrorState, LoadingState, Reveal, ScenePanel, Screen, SectionHeader, Text } from '@/shared/ui';

export default function ClientHome() {
  const router = useRouter();
  const user = useUser();
  const home = useClientHome();

  return (
    <Screen inTabs band="mint" onRefresh={home.refreshAll} refreshing={home.refreshing}>
      <View style={{ gap: 2, paddingTop: 8 }}>
        <Text variant="small" color={colors.textMuted}>Hola, {user.name.split(' ')[0]}</Text>
        <Text variant="display">¿Qué se malogró?</Text>
      </View>

      <Reveal index={1}>
        <HomeIntentCard
          text={home.text}
          onChangeText={home.setText}
          canAnalyse={home.canAnalyse}
          canSearch={home.canSearch}
          onAnalyse={home.analyse}
          onSearch={home.search}
        />
      </Reveal>

      <SectionHeader title="O elige tu equipo" />
      {home.types.initialLoading ? (
        <LoadingState />
      ) : home.types.error ? (
        <ErrorState error={home.types.error} onRetry={home.types.refetch} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {(home.types.data ?? []).map((t, i) => (
            <Reveal key={t.id} index={i + 2} style={{ width: '48%', flexGrow: 1 }}>
              <Card onPress={() => home.startWith(t.id)} accessibilityLabel={`Publicar solicitud de ${applianceLabel(t.name)}`} style={{ gap: 10 }}>
                <ScenePanel name={t.name} height={84} />
                <Text variant="heading" numberOfLines={2}>{applianceLabel(t.name)}</Text>
                <Text variant="small" color={colors.textMuted}>Publicar solicitud</Text>
              </Card>
            </Reveal>
          ))}
        </View>
      )}

      <SectionHeader title="Mis solicitudes activas" actionLabel="Ver todas" onAction={() => router.push('/requests')} />
      {home.recentLoading ? (
        <LoadingState />
      ) : home.recentError ? (
        <ErrorState error={home.recentError} onRetry={home.retryRecent} />
      ) : home.active.length === 0 ? (
        <EmptyState icon="construct-outline" title="Sin solicitudes activas" message="Cuando publiques una falla, la verás aquí con sus propuestas." />
      ) : (
        <View style={{ gap: 10 }}>
          {home.active.map((r, i) => (
            <Reveal key={r.id} index={i}><RequestCard request={r} /></Reveal>
          ))}
        </View>
      )}

      {home.liveServices.length > 0 ? (
        <>
          <SectionHeader title="Servicios en curso" actionLabel="Ver todos" onAction={() => router.push('/services')} />
          <View style={{ gap: 10 }}>
            {home.liveServices.map((s) => (
              <ServiceCard key={s.id} service={s} role="CLIENT" onChanged={home.refetchServices} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
