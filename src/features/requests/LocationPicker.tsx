import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { friendlyError } from '@/shared/api/errors';
import { colors } from '@/shared/theme';
import { Banner, Button, Card, FilterChip, Icon, Text } from '@/shared/ui';
import { LocationDeniedError, getCurrentCoords, type PickedLocation } from '@/shared/location';
import { DISTRICTS } from './districts';

interface Props {
  value: PickedLocation | null;
  onChange: (value: PickedLocation) => void;
}

/** GPS first (sensor), district list as the fallback when permission is denied. */
export function LocationPicker({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [denied, setDenied] = useState(false);

  async function pickGps() {
    setBusy(true);
    setError('');
    try {
      const coords = await getCurrentCoords();
      setDenied(false);
      onChange({ ...coords, label: 'GPS de tu teléfono' });
    } catch (cause) {
      if (cause instanceof LocationDeniedError) setDenied(true);
      else setError(friendlyError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="location" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyStrong" numberOfLines={1}>{value ? value.label : 'Sin ubicación todavía'}</Text>
            <Text variant="small" color={colors.textMuted}>
              {value ? `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}` : 'Usa tu GPS o elige tu distrito.'}
            </Text>
          </View>
        </View>
        <Button label={value ? 'Actualizar con mi GPS' : 'Usar mi ubicación'} icon="navigate" variant={value ? 'secondary' : 'primary'} onPress={() => void pickGps()} loading={busy} />
      </Card>
      {denied ? <Banner tone="warning" message="No tenemos permiso de ubicación. Elige tu distrito aquí abajo." /> : null}
      {error ? <Banner tone="danger" message={error} /> : null}
      <View style={{ gap: 8 }}>
        <Text variant="smallStrong" color={colors.textSoft}>¿Sin permiso de ubicación? Elige tu distrito</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {DISTRICTS.map((d) => (
            <FilterChip key={d.label} label={d.label} selected={value?.label === d.label} onPress={() => onChange(d)} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
