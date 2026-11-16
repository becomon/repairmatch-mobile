const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Backend LocalDateTime has no timezone, so it is parsed as local time. */
export function parseLocal(value: string): Date {
  return new Date(value.length > 23 ? value.slice(0, 23) : value);
}

/** `S/ 30.00` */
export function formatMoney(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

/** `Jue 13 nov · 9:00` */
export function formatWhen(value: string): string {
  const d = parseLocal(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${d.getHours()}:${pad(d.getMinutes())}`;
}

/** `13 nov` */
export function formatDay(value: string): string {
  const d = parseLocal(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** `hace 20 min` */
export function timeAgo(value: string, now: Date = new Date()): string {
  const d = parseLocal(value);
  const minutes = Math.max(0, Math.round((now.getTime() - d.getTime()) / 60000));
  if (Number.isNaN(minutes)) return '';
  if (minutes < 1) return 'justo ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'hace 1 día' : `hace ${days} días`;
}

export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined) return '';
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]!.charAt(0);
  const second = parts.length > 1 ? parts[1]!.charAt(0) : '';
  return (first + second).toUpperCase();
}

/** `YYYY-MM-DDTHH:mm:00`, the LocalDateTime format the API expects. */
export function toLocalDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export function pluralize(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
