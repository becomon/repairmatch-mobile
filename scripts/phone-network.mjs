import { networkInterfaces } from 'node:os';
import { isIPv4 } from 'node:net';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function isPrivateIp(ip) {
  return isIPv4(ip) && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
}
export function selectPhoneIp(interfaces = networkInterfaces(), preferred) {
  const candidates = Object.entries(interfaces).flatMap(([name, entries]) =>
    (entries || []).filter(entry => !entry.internal && entry.family === 'IPv4' && isPrivateIp(entry.address))
      .map(entry => ({ name, ip: entry.address })));
  if (preferred) {
    if (!candidates.some(entry => entry.ip === preferred)) throw new Error('La IP indicada no pertenece a una conexión privada activa de esta PC.');
    return preferred;
  }
  const wifi = candidates.filter(entry => /wi-?fi|wlan|wireless/i.test(entry.name));
  if (wifi.length === 1) return wifi[0].ip;
  const physical = candidates.filter(entry => !/vethernet|wsl|virtual|docker|vpn|loopback/i.test(entry.name));
  if (physical.length === 1) return physical[0].ip;
  throw new Error('No se pudo elegir la red Wi-Fi. Usa npm run backend:phone -- --ip=TU_IP_WIFI.');
}
export function setMobileApiUrl(file, ip) {
  if (!isPrivateIp(ip)) throw new Error('La dirección de prueba debe ser una IPv4 privada.');
  const url = `http://${ip}:8080/api`;
  const original = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const line = `EXPO_PUBLIC_API_BASE_URL=${url}`;
  const updated = /^EXPO_PUBLIC_API_BASE_URL\s*=.*$/m.test(original)
    ? original.replace(/^EXPO_PUBLIC_API_BASE_URL\s*=.*$/m, line)
    : `${original.trimEnd()}\n${line}\n`;
  writeFileSync(file, updated);
  return url;
}
