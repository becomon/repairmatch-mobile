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
