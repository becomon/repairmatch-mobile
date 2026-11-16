import type { DemandPoint } from './demand';

export interface CoverageMapProps {
  latitude: number;
  longitude: number;
  radiusKm: number;
  /** The pin was dragged or the map was tapped. */
  onPinMoved: (latitude: number, longitude: number) => void;
  /** Approximate nearby requests inside the radius. Omit (or `ready: false`) to draw no overlay. */
  demand?: { points: DemandPoint[]; ready: boolean };
  /** A demand circle or marker was tapped. */
  onOpenDemand?: (point: DemandPoint) => void;
}
