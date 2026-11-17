import { useEffect, useRef, useState } from 'react';
import { friendlyError } from '@/shared/api/errors';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getCurrentCoords, LocationDeniedError, type PickedLocation } from '@/shared/location';
import { reverseGeocode, searchAddresses, type AddressSuggestion } from './geocoding';

/** Nominatim allows one request per second, so typing waits a little longer than elsewhere. */
const ADDRESS_DEBOUNCE_MS = 700;
const MIN_ADDRESS_CHARS = 3;

interface SearchState {
  query: string;
  results: AddressSuggestion[];
  failed: boolean;
}

export interface CoverageNotice {
  tone: 'warning' | 'danger';
  message: string;
}

/**
 * Where the technician's base is: search a real address, use the GPS or move the pin on the map.
 * Every placement is named through reverse geocoding so the saved zone reads as an address.
 */
export function useCoverage(value: PickedLocation | null, onChange: (value: PickedLocation) => void) {
  const [text, setText] = useState('');
  const query = useDebounce(text.trim(), ADDRESS_DEBOUNCE_MS);
  const [found, setFound] = useState<SearchState | null>(null);
  const [notice, setNotice] = useState<CoverageNotice | null>(null);
  const { busy: locating, run } = useAsyncAction();
  const lookup = useRef(0);

  // Address search: debounced and aborted when the text changes, so only the last lookup wins.
  // A text that is already the chosen address needs no new lookup.
  const settled = value?.label === query;
  useEffect(() => {
    if (query.length < MIN_ADDRESS_CHARS || settled) return;
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

  const searching = query.length >= MIN_ADDRESS_CHARS && !settled && found?.query !== query;
  const current = query.length >= MIN_ADDRESS_CHARS && found?.query === query ? found : null;
  const showSuggestions = text.trim().length >= MIN_ADDRESS_CHARS && !!current && value?.label !== text.trim();

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

  const locateWithGps = () =>
    run(async () => {
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
      }
    });

  return { text, setText, searching, current, showSuggestions, choose, place, locating, locateWithGps, notice };
}
