import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { getCurrentCoords, LocationDeniedError, type PickedLocation } from '@/features/requests/location';
import { friendlyError } from '@/shared/api/errors';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { colors, radius, TOUCH } from '@/shared/theme';
import { Banner, Button, Card, FilterChip, Icon, SearchInput, Text } from '@/shared/ui';
import { CoverageMap } from './CoverageMap';
import { searchAddresses, reverseGeocode, type AddressSuggestion } from './geocoding';
import { radiusStep, RADIUS_MAX, RADIUS_MIN } from './profileValidation';

const LIMA = { latitude: -12.0464, longitude: -77.0428 };
const QUICK_RADII = [2, 5, 10, 20, 50];

interface Props {
  value: PickedLocation | null;
  onChange: (value: PickedLocation) => void;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  radiusError?: string | undefined;
  locationError?: string | undefined;
}

interface SearchState {
  query: string;
  results: AddressSuggestion[];
  failed: boolean;
}

/**
 * Coverage zone editor: search a real address, use the GPS or move the pin on the map, then pick
 * the radius. Every pin move is named through reverse geocoding so the saved zone reads as an address.
 */
export function CoverageEditor({ value, onChange, radiusKm, onRadiusChange, radiusError, locationError }: Props) {
  const [text, setText] = useState('');
  const query = useDebounce(text.trim(), 700);
  const [found, setFound] = useState<SearchState | null>(null);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'warning' | 'danger'; message: string } | null>(null);
  const lookup = useRef(0);

  // Address search: debounced and aborted when the text changes, so only the last lookup wins.
  // A text that is already the chosen address needs no new lookup.
  const settled = value?.label === query;
  useEffect(() => {
    if (query.length < 3 || settled) return;
    const controller = new AbortController();
    searchAddresses(query, controller.signal)
      .then((results) => {
        if (!controller.signal.aborted) setFound({ query, results, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFound({ query, results: [], failed: true });
      });
    return () => controller.abort();
  }, [query, settled]);

  const searching = query.length >= 3 && !settled && found?.query !== query;
  const current = query.length >= 3 && found?.query === query ? found : null;
  const showSuggestions = text.trim().length >= 3 && !!current && value?.label !== text.trim();

  function choose(suggestion: AddressSuggestion) {
    setNotice(null);
    setText(suggestion.primary);
    onChange({ latitude: suggestion.latitude, longitude: suggestion.longitude, label: suggestion.primary });
  }

  /** Puts the point down immediately, then names it. A slow or failed lookup keeps the coordinates. */
  function place(latitude: number, longitude: number, provisional: string) {
    const ticket = ++lookup.current;
    onChange({ latitude, longitude, label: provisional });
    reverseGeocode(latitude, longitude)
      .then((label) => {
        if (label && ticket === lookup.current) {
          setText(label);
          onChange({ latitude, longitude, label });
        }
      })
      .catch(() => {
        // The coordinates are what gets saved; the name is a convenience.
      });
  }

  async function locateWithGps() {
    setLocating(true);
    setNotice(null);
    try {
      const { latitude, longitude } = await getCurrentCoords();
      place(latitude, longitude, 'Ubicación de tu teléfono');
    } catch (cause) {
      setNotice(
        cause instanceof LocationDeniedError
          ? { tone: 'warning', message: 'No tenemos permiso de ubicación. Busca tu dirección o mueve el pin en el mapa.' }
          : { tone: 'danger', message: friendlyError(cause) },
      );
    } finally {
      setLocating(false);
    }
  }

  function bump(direction: 1 | -1) {
    const step = radiusStep(direction === 1 ? radiusKm : radiusKm - 1);
    const next = Math.round((radiusKm + direction * step) * 10) / 10;
    onRadiusChange(Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, next)));
  }

  const map = value ?? LIMA;
  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>Dirección de tu base</Text>
        <SearchInput label="Buscar dirección" value={text} onChangeText={setText} placeholder="Calle, número y distrito" maxLength={150} />
        {searching ? (
          <View style={styles.status}><ActivityIndicator color={colors.primary} /><Text variant="small" color={colors.textMuted}>Buscando…</Text></View>
        ) : null}
        {showSuggestions && current ? (
          current.failed ? (
            <Banner tone="warning" message="No pudimos buscar ahora. Revisa tu conexión o mueve el pin en el mapa." />
          ) : current.results.length === 0 ? (
            <Text variant="small" color={colors.textMuted}>No encontramos esa dirección. Prueba con el distrito o marca el punto en el mapa.</Text>
          ) : (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View>
                {current.results.map((s, index) => (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Usar ${s.primary}`}
                    onPress={() => choose(s)}
                    style={[styles.suggestion, index > 0 ? styles.divider : null]}
                  >
                    <Icon name="location-outline" size={20} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text variant="smallStrong" numberOfLines={1}>{s.primary}</Text>
                      <Text variant="small" color={colors.textMuted} numberOfLines={1}>{s.secondary}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </Card>
          )
        ) : null}
        <Button label={locating ? 'Buscando tu ubicación…' : 'Usar mi ubicación actual'} icon="navigate" variant="secondary" onPress={() => void locateWithGps()} loading={locating} />
      </View>

      {notice ? <Banner tone={notice.tone} message={notice.message} /> : null}

      {value ? (
        <>
          <CoverageMap latitude={map.latitude} longitude={map.longitude} radiusKm={radiusKm} onPinMoved={(lat, lng) => place(lat, lng, 'Punto marcado en el mapa')} />
          <View style={styles.selected}>
            <Icon name="location" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="smallStrong" numberOfLines={2}>{value.label}</Text>
              <Text variant="small" color={colors.textMuted}>{value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}</Text>
            </View>
          </View>
        </>
      ) : (
        <Text variant="small" color={colors.textMuted}>Aún no marcaste tu zona. Busca tu dirección o usa tu ubicación para ver el mapa.</Text>
      )}
      {locationError ? <Text variant="small" color={colors.danger} accessibilityRole="alert">{locationError}</Text> : null}

      <View style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>Radio de atención</Text>
        <View style={styles.stepper}>
          <Pressable accessibilityRole="button" accessibilityLabel="Reducir radio" onPress={() => bump(-1)} disabled={radiusKm <= RADIUS_MIN} style={[styles.stepButton, radiusKm <= RADIUS_MIN ? styles.disabled : null]}>
            <Icon name="remove" size={24} />
          </Pressable>
          <View style={styles.stepValue} accessibilityLabel={`Radio de ${radiusKm} kilómetros`}>
            <Text variant="title">{radiusKm} km</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Aumentar radio" onPress={() => bump(1)} disabled={radiusKm >= RADIUS_MAX} style={[styles.stepButton, radiusKm >= RADIUS_MAX ? styles.disabled : null]}>
            <Icon name="add" size={24} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
          {QUICK_RADII.map((km) => (
            <FilterChip key={km} label={`${km} km`} selected={radiusKm === km} onPress={() => onRadiusChange(km)} />
          ))}
        </ScrollView>
        {radiusError ? <Text variant="small" color={colors.danger} accessibilityRole="alert">{radiusError}</Text> : <Text variant="small" color={colors.textMuted}>Solo verás casos cuyo punto esté dentro de este radio (de {RADIUS_MIN} a {RADIUS_MAX} km).</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: TOUCH + 8, paddingHorizontal: 14, paddingVertical: 8 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  selected: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepButton: { width: TOUCH + 4, height: TOUCH + 4, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1, alignItems: 'center' },
  disabled: { opacity: 0.4 },
});
