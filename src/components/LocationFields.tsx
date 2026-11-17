import { Button, Text, TextInput } from 'react-native';
import type { useLocation } from '../hooks/useLocation';
export function LocationFields({ location, busy, onLocate }: { location: ReturnType<typeof useLocation>; busy: boolean; onLocate: () => void }) {
  return <>
    <Text>Comparte la ubicación del electrodoméstico para facilitar la atención. Puedes usar GPS o ingresar coordenadas manualmente.</Text>
    <Button title="Usar mi ubicación (GPS)" disabled={busy} onPress={onLocate} />
    <Text>Latitud</Text><TextInput accessibilityLabel="Latitud" value={location.latitude} onChangeText={location.setLatitude} editable={!busy} keyboardType="numbers-and-punctuation" style={{ borderWidth: 1, padding: 10 }} />
    <Text>Longitud</Text><TextInput accessibilityLabel="Longitud" value={location.longitude} onChangeText={location.setLongitude} editable={!busy} keyboardType="numbers-and-punctuation" style={{ borderWidth: 1, padding: 10 }} />
  </>;
}
