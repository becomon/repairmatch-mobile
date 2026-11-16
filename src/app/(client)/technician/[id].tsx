import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { applianceLabel } from '@/features/catalog/appliances';
import { techniciansApi } from '@/shared/api/endpoints';
import { formatDay } from '@/shared/format';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors } from '@/shared/theme';
import { Avatar, Card, EmptyState, ErrorState, IdentityPill, InfoChip, LoadingState, Screen, ScreenHeader, SectionHeader, Stars, Text } from '@/shared/ui';

/** Public technician profile: reputation, specialties and reviews (no contact data). */
export default function TechnicianPublicProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useApiQuery((signal) => techniciansApi.publicProfile(id, { signal }), [id]);
  const reputation = useApiQuery((signal) => techniciansApi.reputation(id, { signal }), [id]);
  const reviews = useApiQuery((signal) => techniciansApi.reviews(id, { signal }), [id]);

  const header = <ScreenHeader title="Perfil del técnico" back fallbackHref="/requests" />;
  if (profile.initialLoading) return <Screen header={header}><LoadingState /></Screen>;
  if (!profile.data) return <Screen header={header}><ErrorState error={profile.error} onRetry={profile.refetch} /></Screen>;

  const p = profile.data;
  const rep = reputation.data;
  return (
    <Screen header={header}>
      <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 24 }}>
        <Avatar name={p.fullName} size={72} />
        <Text variant="title">{p.fullName}</Text>
        {p.identityVerified ? <View><IdentityPill /></View> : null}
        <Text variant="small" color={colors.textMuted}>
          Técnico{p.experienceYears !== undefined ? ` · ${p.experienceYears} ${p.experienceYears === 1 ? 'año' : 'años'} de experiencia` : ''}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[
          { value: rep && rep.reviewCount > 0 ? rep.averageRating.toFixed(1) : '—', label: 'calificación' },
          { value: String(rep?.reviewCount ?? 0), label: 'reseñas' },
          { value: p.maxRadiusKm ? `${p.maxRadiusKm} km` : '—', label: 'radio de atención' },
        ].map((stat) => (
          <Card key={stat.label} style={{ flex: 1, alignItems: 'center', gap: 2, padding: 12 }}>
            <Text variant="heading" style={{ fontSize: 20 }}>{stat.value}</Text>
            <Text variant="small" color={colors.textMuted} align="center">{stat.label}</Text>
          </Card>
        ))}
      </View>

      {p.bio ? <Text variant="body" color={colors.textSoft}>{p.bio}</Text> : null}

      <SectionHeader title="Atiende" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {p.applianceTypes.length > 0 ? p.applianceTypes.map((t) => <InfoChip key={t} label={applianceLabel(t)} />) : <Text variant="small" color={colors.textMuted}>Aún no indicó sus especialidades.</Text>}
      </View>

      <SectionHeader title="Reseñas" />
      {reviews.initialLoading ? (
        <LoadingState />
      ) : reviews.error && !reviews.data ? (
        <ErrorState error={reviews.error} onRetry={reviews.refetch} />
      ) : (reviews.data ?? []).length === 0 ? (
        <EmptyState icon="chatbubble-outline" title="Sin reseñas todavía" message="Cuando termine su primer servicio, las opiniones de sus clientes aparecerán aquí." />
      ) : (
        (reviews.data ?? []).map((r) => (
          <Card key={r.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stars value={r.rating} />
              <Text variant="small" color={colors.textMuted}>{formatDay(r.createdAt)}</Text>
            </View>
            <Text variant="body" color={colors.textSoft}>{r.comment}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
