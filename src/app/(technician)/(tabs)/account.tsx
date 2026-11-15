import { useState } from 'react';
import { View } from 'react-native';
import { useAuth, useUser } from '@/features/auth/AuthProvider';
import { LocationPicker } from '@/features/requests/LocationPicker';
import type { PickedLocation } from '@/features/requests/location';
import { friendlyError } from '@/shared/api/errors';
import { listApplianceTypes, techniciansApi } from '@/shared/api/endpoints';
import type { ApplianceType, TechnicianProfile } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors } from '@/shared/theme';
import { Avatar, Banner, Button, Card, ConfirmDialog, ErrorState, FilterChip, LoadingState, RatingSummary, Screen, ScreenHeader, SectionHeader, Text, TextField } from '@/shared/ui';

const RADII = [5, 10, 20, 50, 100];

export default function TechnicianAccountTab() {
  const user = useUser();
  const { logout } = useAuth();
  const profile = useApiQuery((signal) => techniciansApi.profile({ signal }), []);
  const types = useApiQuery((signal) => listApplianceTypes({ signal }), []);
  const reputation = useApiQuery((signal) => techniciansApi.reputation(user.id, { signal }), [user.id]);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const header = <ScreenHeader title="Mi perfil" />;
  if (profile.initialLoading || types.initialLoading) return <Screen inTabs header={header}><LoadingState /></Screen>;
  if (!profile.data || !types.data) {
    return (
      <Screen inTabs header={header}>
        <ErrorState error={profile.error ?? types.error} onRetry={() => { profile.refetch(); types.refetch(); }} />
      </Screen>
    );
  }

  return (
    <Screen inTabs header={header}>
      <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <Avatar name={user.name} size={72} />
        <Text variant="heading">{user.name}</Text>
        <Text variant="small" color={colors.textMuted}>{user.email}</Text>
        {reputation.data ? <RatingSummary average={reputation.data.averageRating} count={reputation.data.reviewCount} /> : null}
      </Card>

      <ProfileForm key={profile.data.id} profile={profile.data} types={types.data} onSaved={profile.refetch} />

      <Button label="Cerrar sesión" variant="danger" icon="log-out-outline" onPress={() => setConfirming(true)} />
      <ConfirmDialog
        visible={confirming}
        title="¿Cerrar sesión?"
        message="Tendrás que ingresar tu correo y contraseña la próxima vez."
        confirmLabel="Cerrar sesión"
        destructive
        loading={busy}
        onConfirm={() => { setBusy(true); void logout(); }}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

function ProfileForm({ profile, types, onSaved }: { profile: TechnicianProfile; types: ApplianceType[]; onSaved: () => void }) {
  const [experience, setExperience] = useState(profile.experienceYears !== undefined ? String(profile.experienceYears) : '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [selected, setSelected] = useState<number[]>(() => types.filter((t) => profile.applianceTypes.includes(t.name)).map((t) => t.id));
  const [radius, setRadius] = useState(profile.maxRadiusKm ?? 20);
  const [location, setLocation] = useState<PickedLocation | null>(
    profile.latitude !== undefined && profile.longitude !== undefined ? { latitude: profile.latitude, longitude: profile.longitude, label: 'Zona guardada' } : null,
  );
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [experienceError, setExperienceError] = useState<string>();

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function save() {
    const years = experience.trim() === '' ? null : Number(experience);
    if (years !== null && (!Number.isInteger(years) || years < 0 || years > 70)) {
      setExperienceError('Usa un número entre 0 y 70.');
      return;
    }
    setExperienceError(undefined);
    setError('');
    setSaved(false);
    setBusy(true);
    try {
      await techniciansApi.updateProfile({ experienceYears: years, bio: bio.trim() || null, phone: phone.trim() || null, applianceTypeIds: selected });
      if (location) await techniciansApi.updateArea({ latitude: location.latitude, longitude: location.longitude, maxRadiusKm: radius });
      setSaved(true);
      onSaved();
    } catch (cause) {
      setError(friendlyError(cause));
    } finally {
      setBusy(false);
    }
  }

  const complete = selected.length > 0 && !!location;
  return (
    <>
      {!complete ? <Banner tone="warning" message="Elige los equipos que reparas y tu zona de atención para empezar a recibir casos." /> : null}
      {saved ? <Banner tone="success" message="Perfil guardado. Ya puedes ver casos en tu zona." /> : null}
      {error ? <Banner tone="danger" message={error} /> : null}

      <SectionHeader title="Qué reparas" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {types.map((t) => (
          <FilterChip key={t.id} label={t.name} selected={selected.includes(t.id)} onPress={() => toggle(t.id)} />
        ))}
      </View>

      <SectionHeader title="Zona de atención" />
      <LocationPicker value={location} onChange={setLocation} />
      <View style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>Radio de atención</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {RADII.map((r) => (
            <FilterChip key={r} label={`${r} km`} selected={radius === r} onPress={() => setRadius(r)} />
          ))}
        </View>
      </View>

      <SectionHeader title="Sobre ti" />
      <TextField label="Años de experiencia" value={experience} onChangeText={setExperience} error={experienceError} keyboardType="number-pad" maxLength={2} />
      <TextField label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} hint="Solo lo ves tú; los clientes no lo reciben." />
      <TextField label="Presentación" value={bio} onChangeText={setBio} multiline maxLength={1000} placeholder="Explico la falla antes de cambiar piezas y dejo el equipo probado." />
      <Button label="Guardar perfil" onPress={() => void save()} loading={busy} />
    </>
  );
}
