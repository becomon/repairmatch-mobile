import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface PickedLocation extends Coords {
  /** Where the point came from, shown to the user: GPS or a district name. */
  label: string;
}

export class LocationDeniedError extends Error {
  constructor() {
    super('Sin permiso de ubicación.');
    this.name = 'LocationDeniedError';
  }
}

/** One-time foreground GPS fix. Throws `LocationDeniedError` when the user refuses. */
export async function getCurrentCoords(): Promise<Coords> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new LocationDeniedError();
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

/** Fallback when location permission is denied: centre of a Lima district. */
export const DISTRICTS: PickedLocation[] = [
  { label: 'Miraflores', latitude: -12.1211, longitude: -77.0297 },
  { label: 'San Isidro', latitude: -12.0977, longitude: -77.0365 },
  { label: 'Surco', latitude: -12.1453, longitude: -76.9915 },
  { label: 'San Borja', latitude: -12.1019, longitude: -77.0027 },
  { label: 'La Molina', latitude: -12.0867, longitude: -76.9054 },
  { label: 'Barranco', latitude: -12.1497, longitude: -77.0206 },
  { label: 'Lince', latitude: -12.0833, longitude: -77.0333 },
  { label: 'Jesús María', latitude: -12.0711, longitude: -77.0517 },
  { label: 'Magdalena', latitude: -12.0889, longitude: -77.0711 },
  { label: 'San Miguel', latitude: -12.0775, longitude: -77.0867 },
  { label: 'Pueblo Libre', latitude: -12.0717, longitude: -77.0636 },
  { label: 'Cercado de Lima', latitude: -12.0464, longitude: -77.0428 },
  { label: 'Los Olivos', latitude: -11.9722, longitude: -77.0711 },
];
