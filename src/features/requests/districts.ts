import type { PickedLocation } from '@/shared/location';

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
