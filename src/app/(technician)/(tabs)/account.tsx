import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuth, useUser } from '@/features/auth/AuthProvider';
import { applianceLabel } from '@/features/catalog/appliances';
import { ApplianceTile } from '@/features/requests/ApplianceTile';
import type { PickedLocation } from '@/features/requests/location';
import { CoverageEditor } from '@/features/technicians/CoverageEditor';
import { reverseGeocode } from '@/features/technicians/geocoding';
import {
  BIO_MAX,
  DEFAULT_RADIUS_KM,
  PHONE_MAX,
  validateProfileFields,
  validateRadius,
  type ProfileErrors,
} from '@/features/technicians/profileValidation';
import { friendlyError } from '@/shared/api/errors';
import { listApplianceTypes, techniciansApi } from '@/shared/api/endpoints';
import type { ApplianceType, TechnicianProfile } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { colors, radius } from '@/shared/theme';
import { Avatar, Banner, Button, Card, ConfirmDialog, ErrorState, Icon, LoadingState, RatingSummary, Screen, ScreenHeader, SectionHeader, Text, TextField } from '@/shared/ui';

const SAVED_LABEL = 'Zona guardada';

export default function TechnicianAccountTab() {
  const user = useUser();
  const profile = useApiQuery((signal) => techniciansApi.profile({ signal }), []);
  const types = useApiQuery((signal) => listApplianceTypes({ signal }), []);
  const reputation = useApiQuery((signal) => techniciansApi.reputation(user.id, { signal }), [user.id]);

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
    <ProfileScreen
      key={profile.data.id}
      profile={profile.data}
      types={types.data}
      rating={reputation.data}
      onSaved={profile.refetch}
    />
  );
}

interface ScreenProps {
  profile: TechnicianProfile;
  types: ApplianceType[];
  rating: { averageRating: number; reviewCount: number } | undefined;
  onSaved: () => void;
}

function ProfileScreen({ profile, types, rating, onSaved }: ScreenProps) {
  const user = useUser();
  const { logout } = useAuth();
  const [experience, setExperience] = useState(profile.experienceYears !== undefined ? String(profile.experienceYears) : '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [selected, setSelected] = useState<number[]>(() => types.filter((t) => profile.applianceTypes.includes(t.name)).map((t) => t.id));
  const [radiusKm, setRadiusKm] = useState(profile.maxRadiusKm ?? DEFAULT_RADIUS_KM);
  const [location, setLocation] = useState<PickedLocation | null>(
    profile.latitude !== undefined && profile.longitude !== undefined ? { latitude: profile.latitude, longitude: profile.longitude, label: SAVED_LABEL } : null,
  );
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Name the saved point once so the zone reads as an address instead of "Zona guardada".
  const savedLat = profile.latitude;
  const savedLng = profile.longitude;
  useEffect(() => {
    if (savedLat === undefined || savedLng === undefined) return;
    const controller = new AbortController();
    reverseGeocode(savedLat, savedLng, controller.signal)
      .then((label) => {
        if (label && !controller.signal.aborted) setLocation((current) => (current?.label === SAVED_LABEL ? { ...current, label } : current));
      })
      .catch(() => {
        // Keep "Zona guardada"; the coordinates are what matters.
      });
    return () => controller.abort();
  }, [savedLat, savedLng]);

  function toggle(id: number) {
    setSaved(false);
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function save() {
    const next: ProfileErrors = { ...validateProfileFields({ experience, phone, bio }) };
    const radiusError = location ? validateRadius(radiusKm) : undefined;
    if (radiusError) next.radius = radiusError;
    setErrors(next);
    setError('');
    setSaved(false);
    if (Object.keys(next).length > 0) {
      setError('Revisa los campos marcados en rojo.');
      return;
    }
    setBusy(true);
    let profileSaved = false;
    try {
      const years = experience.trim() === '' ? null : Number(experience);
      await techniciansApi.updateProfile({ experienceYears: years, bio: bio.trim() || null, phone: phone.trim() || null, applianceTypeIds: selected });
      profileSaved = true;
      if (location) await techniciansApi.updateArea({ latitude: location.latitude, longitude: location.longitude, maxRadiusKm: radiusKm });
      setSaved(true);
      onSaved();
    } catch (cause) {
      setError(profileSaved ? `Tu perfil se guardó, pero la zona no. ${friendlyError(cause)}` : friendlyError(cause));
      if (profileSaved) onSaved();
    } finally {
      setBusy(false);
    }
  }

  const complete = selected.length > 0 && !!location;
  return (
    <Screen
      inTabs
      header={<ScreenHeader title="Mi perfil" />}
      footer={<Button label="Guardar perfil" onPress={() => void save()} loading={busy} />}
    >
      <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 24 }}>
        <Avatar name={user.name} size={72} />
        <Text variant="heading">{user.name}</Text>
        <Text variant="small" color={colors.textMuted}>{user.email}</Text>
        {rating ? <RatingSummary average={rating.averageRating} count={rating.reviewCount} /> : null}
      </Card>

      {!complete ? <Banner tone="warning" message="Elige los equipos que reparas y tu zona de atención para empezar a recibir casos." /> : null}
      {saved ? <Banner tone="success" message="Perfil guardado. Ya puedes ver casos en tu zona." /> : null}
      {error ? <Banner tone="danger" message={error} /> : null}

      <SectionHeader title="Qué reparas" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityLabel="Equipos que reparas">
        {types.map((t) => {
          const on = selected.includes(t.id);
          return (
            <Pressable
              key={t.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={applianceLabel(t.name)}
              onPress={() => toggle(t.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                minHeight: 48,
                paddingLeft: 8,
                paddingRight: 14,
                borderRadius: radius.pill,
                borderWidth: on ? 2 : 1,
                borderColor: on ? colors.primary : colors.border,
                backgroundColor: on ? colors.primarySoft : colors.surface,
              }}
            >
              <ApplianceTile name={t.name} size={32} />
              <Text variant="smallStrong" color={on ? colors.primary : colors.text}>{applianceLabel(t.name)}</Text>
              {on ? <Icon name="checkmark-circle" size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
      {selected.length === 0 ? <Text variant="small" color={colors.textMuted}>Marca al menos un equipo para que te lleguen casos.</Text> : null}

      <SectionHeader title="Zona de atención" />
      <CoverageEditor
        value={location}
        onChange={(next) => { setSaved(false); setLocation(next); }}
        radiusKm={radiusKm}
        onRadiusChange={(km) => { setSaved(false); setRadiusKm(km); }}
        radiusError={errors.radius}
      />

      <SectionHeader title="Sobre ti" />
      <TextField label="Años de experiencia" value={experience} onChangeText={(v) => { setSaved(false); setExperience(v.replace(/\D/g, '')); }} error={errors.experience} keyboardType="number-pad" maxLength={2} />
      <TextField label="Teléfono" value={phone} onChangeText={(v) => { setSaved(false); setPhone(v); }} error={errors.phone} keyboardType="phone-pad" maxLength={PHONE_MAX} hint="Solo lo ves tú; los clientes no lo reciben." />
      <TextField label="Presentación" value={bio} onChangeText={(v) => { setSaved(false); setBio(v); }} error={errors.bio} multiline maxLength={BIO_MAX} placeholder="Explico la falla antes de cambiar piezas y dejo el equipo probado." />

      <View style={{ paddingTop: 8 }}>
        <Button label="Cerrar sesión" variant="secondary" icon="log-out-outline" onPress={() => setConfirming(true)} />
      </View>
      <ConfirmDialog
        visible={confirming}
        title="¿Cerrar sesión?"
        message="Tendrás que ingresar tu correo y contraseña la próxima vez."
        confirmLabel="Cerrar sesión"
        destructive
        loading={signingOut}
        onConfirm={() => { setSigningOut(true); void logout(); }}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}
