export function parseCoordinates(latitude: string, longitude: string, required = false): { latitude?: number; longitude?: number } {
  if (!latitude.trim() && !longitude.trim() && !required) return {};
  const lat = Number(latitude), lon = Number(longitude);
  if (!latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('Ingresa latitud entre -90 y 90 y longitud entre -180 y 180.');
  return { latitude: lat, longitude: lon };
}
