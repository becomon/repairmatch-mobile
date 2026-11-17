import { useState } from 'react';
import * as Location from 'expo-location';
import { parseCoordinates } from '../utils/coordinates';
export function useLocation() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  async function locate() {
    if (!(await Location.hasServicesEnabledAsync())) throw new Error('Activa la ubicación del celular o ingresa las coordenadas manualmente.');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') throw new Error('No diste permiso de ubicación. Puedes ingresar las coordenadas manualmente.');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('No se pudo obtener la ubicación. Intenta al aire libre o ingresa las coordenadas manualmente.')), 15000); }),
      ]);
      setLatitude(String(position.coords.latitude)); setLongitude(String(position.coords.longitude));
    } finally { clearTimeout(timer); }
  }
  function coordinates(required = false) {
    return parseCoordinates(latitude, longitude, required);
  }
  return { latitude, longitude, setLatitude, setLongitude, locate, coordinates };
}
