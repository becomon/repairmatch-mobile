import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SignOutDialog, useSignOut, useUser } from '@/features/auth';
import { IdentityCard } from '@/features/identity';
import type { ApplianceType, TechnicianProfile } from '@/shared/api/types';
import { colors } from '@/shared/theme';
import { Avatar, Banner, Button, Card, IdentityPill, RatingSummary, Screen, ScreenHeader, SectionHeader, Text, TextField } from '@/shared/ui';
import { ApplianceToggles } from './ApplianceToggles';
import { CoverageEditor } from './CoverageEditor';
import { opportunityParams } from './opportunityParam';
import { BIO_MAX, PHONE_MAX } from './profileValidation';
import { useProfileForm } from './useProfileForm';

interface Props {
  profile: TechnicianProfile;
  types: ApplianceType[];
  rating: { averageRating: number; reviewCount: number } | undefined;
  onSaved: () => void;
}

/** The technician's profile: identity, what they repair, the coverage zone and a short presentation. */
export function ProfileEditor({ profile, types, rating, onSaved }: Props) {
  const user = useUser();
  const router = useRouter();
  const signOut = useSignOut();
  const form = useProfileForm(profile, types, onSaved);

  return (
    <Screen
      inTabs
      header={<ScreenHeader title="Mi perfil" />}
      footer={<Button label="Guardar perfil" onPress={() => void form.save()} loading={form.busy} />}
    >
      <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <Avatar name={user.name} size={72} />
        <Text variant="heading">{user.name}</Text>
        <Text variant="small" color={colors.textMuted}>{user.email}</Text>
        {rating ? <RatingSummary average={rating.averageRating} count={rating.reviewCount} /> : null}
        {profile.identityVerified ? <View><IdentityPill nameMatches={profile.identityNameMatches} /></View> : null}
      </Card>

      <IdentityCard />

      {!form.complete ? <Banner tone="warning" message="Elige los equipos que reparas y tu zona de atención para empezar a recibir casos." /> : null}
      {form.saved ? <Banner tone="success" message="Perfil guardado. Ya puedes ver casos en tu zona." /> : null}
      {form.error ? <Banner tone="danger" message={form.error} /> : null}

      <SectionHeader title="Qué reparas" />
      <ApplianceToggles types={types} selected={form.selected} onToggle={form.toggleType} />

      <SectionHeader title="Zona de atención" />
      <CoverageEditor
        value={form.location}
        onChange={form.setLocation}
        radiusKm={form.radiusKm}
        onRadiusChange={form.setRadiusKm}
        radiusError={form.errors.radius}
        demand={form.demand}
        onOpenDemand={(p) => router.push({ pathname: '/opportunity/[id]', params: opportunityParams(p.request) })}
      />

      <SectionHeader title="Sobre ti" />
      <TextField label="Años de experiencia" value={form.experience} onChangeText={form.setExperience} error={form.errors.experience} keyboardType="number-pad" maxLength={2} />
      <TextField label="Teléfono" value={form.phone} onChangeText={form.setPhone} error={form.errors.phone} keyboardType="phone-pad" maxLength={PHONE_MAX} hint="Solo lo ves tú; los clientes no lo reciben." />
      <TextField label="Presentación" value={form.bio} onChangeText={form.setBio} error={form.errors.bio} multiline maxLength={BIO_MAX} placeholder="Explico la falla antes de cambiar piezas y dejo el equipo probado." />

      <View style={{ paddingTop: 8 }}>
        <Button label="Cerrar sesión" variant="secondary" icon="log-out-outline" onPress={signOut.ask} />
      </View>
      <SignOutDialog state={signOut} />
    </Screen>
  );
}
