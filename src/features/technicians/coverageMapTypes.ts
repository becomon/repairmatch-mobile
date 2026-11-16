export interface CoverageMapProps {
  latitude: number;
  longitude: number;
  radiusKm: number;
  /** The pin was dragged or the map was tapped. */
  onPinMoved: (latitude: number, longitude: number) => void;
}
