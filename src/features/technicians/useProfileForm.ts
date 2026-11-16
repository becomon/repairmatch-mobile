import { useEffect, useMemo, useState } from 'react';
import { friendlyError } from '@/shared/api/errors';
import { techniciansApi } from '@/shared/api/endpoints';
import type { ApplianceType, TechnicianProfile } from '@/shared/api/types';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import type { PickedLocation } from '@/shared/location';
import { useNearbyDemand, withinRadius } from './demand';
import { reverseGeocode } from './geocoding';
import { DEFAULT_RADIUS_KM, validateProfileFields, validateRadius, type ProfileErrors } from './profileValidation';

const SAVED_LABEL = 'Zona guardada';

/**
 * State and saving of the technician's profile: what they repair, where (centre and radius) and
 * who they are. Saving is two calls (profile, then service area), so a half-done save is reported honestly.
 */
export function useProfileForm(profile: TechnicianProfile, types: ApplianceType[], onSaved: () => void) {
  const nearby = useNearbyDemand();
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
  const { busy, run } = useAsyncAction();
  const demand = useMemo(() => ({ ready: nearby.ready, points: withinRadius(nearby.points, radiusKm) }), [nearby.ready, nearby.points, radiusKm]);

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

  /** Any edit hides the "saved" notice: what is on screen is no longer what was saved. */
  function edited<T>(setter: (value: T) => void) {
    return (value: T) => {
      setSaved(false);
      setter(value);
    };
  }

  const save = () =>
    run(async () => {
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
      }
    });

  return {
    experience,
    setExperience: edited((value: string) => setExperience(value.replace(/\D/g, ''))),
    phone,
    setPhone: edited(setPhone),
    bio,
    setBio: edited(setBio),
    selected,
    toggleType: (id: number) => {
      setSaved(false);
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    },
    radiusKm,
    setRadiusKm: edited(setRadiusKm),
    location,
    setLocation: edited(setLocation),
    demand,
    errors,
    error,
    saved,
    busy,
    save,
    /** What a technician needs before cases can reach them: at least one type and a zone. */
    complete: selected.length > 0 && !!location,
  };
}
