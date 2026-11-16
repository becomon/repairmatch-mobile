import { Platform } from 'react-native';

// OpenStreetMap Nominatim, the same service the web app uses for the coverage zone. Public usage
// policy: at most 1 request per second and no bulk use, so callers debounce and abort stale lookups.
const BASE = 'https://nominatim.openstreetmap.org';

export interface AddressSuggestion {
  id: string;
  /** Street, district and city, cleaned for display. */
  primary: string;
  secondary: string;
  latitude: number;
  longitude: number;
}

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state_district?: string;
  state?: string;
  country?: string;
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: NominatimAddress;
}

function headers(): Record<string, string> {
  const base: Record<string, string> = { Accept: 'application/json', 'Accept-Language': 'es' };
  // Browsers forbid setting User-Agent; native clients must identify themselves to Nominatim.
  if (Platform.OS !== 'web') base['User-Agent'] = 'RepairMatch-Mobile/1.0';
  return base;
}

/** Same cleanup the web app applies: "Calle 123, Distrito, Ciudad, País" without postal codes. */
export function formatGeocodedItem(item: NominatimItem): AddressSuggestion {
  const addr = item.address;
  const street = [addr?.road ?? addr?.pedestrian ?? item.name, addr?.house_number].filter(Boolean).join(' ');
  const locality = addr?.suburb ?? addr?.city_district ?? addr?.neighbourhood ?? addr?.town ?? addr?.village;
  const city = addr?.city ?? addr?.state_district ?? addr?.state;
  const parts = [street, locality, city]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p));
  const deduped: string[] = [];
  for (const part of parts) {
    if (!deduped.some((existing) => existing.toLowerCase() === part.toLowerCase())) deduped.push(part);
  }
  const cleanDisplay = item.display_name
    .split(',')
    .map((s) => s.trim())
    .filter((s) => !/^\d{4,6}$/.test(s))
    .slice(0, 4)
    .join(', ');
  const primary = deduped.length >= 2 ? deduped.join(', ') : cleanDisplay;
  return {
    id: String(item.place_id),
    primary,
    secondary: cleanDisplay || primary,
    latitude: Number(Number(item.lat).toFixed(6)),
    longitude: Number(Number(item.lon).toFixed(6)),
  };
}

/** Real addresses inside Peru that match the text. An empty list means "nothing found", not an error. */
export async function searchAddresses(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const text = query.trim();
  if (text.length < 3) return [];
  const url = `${BASE}/search?format=jsonv2&countrycodes=pe&addressdetails=1&limit=5&accept-language=es&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, { signal: signal ?? null, headers: headers() });
  if (!response.ok) throw new Error('No pudimos buscar la dirección.');
  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as NominatimItem[]).map(formatGeocodedItem) : [];
}

/** Street and district under a pin. Null when the point has no address (open water, rural). */
export async function reverseGeocode(latitude: number, longitude: number, signal?: AbortSignal): Promise<string | null> {
  const url = `${BASE}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es`;
  const response = await fetch(url, { signal: signal ?? null, headers: headers() });
  if (!response.ok) return null;
  const data = (await response.json()) as Partial<NominatimItem> | null;
  if (!data || typeof data.display_name !== 'string' || typeof data.place_id !== 'number') return null;
  return formatGeocodedItem(data as NominatimItem).primary;
}
