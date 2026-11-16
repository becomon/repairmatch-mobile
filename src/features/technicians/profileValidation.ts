// Same limits as the backend (TechnicianProfileUpdate / ServiceAreaUpdate) and the web profile form.

export const EXPERIENCE_MAX = 70;
export const PHONE_MAX = 20;
export const BIO_MAX = 1000;
export const RADIUS_MIN = 1;
export const RADIUS_MAX = 300;
export const DEFAULT_RADIUS_KM = 15;

export interface ProfileFields {
  experience: string;
  phone: string;
  bio: string;
}

export type ProfileErrors = Partial<Record<keyof ProfileFields | 'radius' | 'location' | 'types', string>>;

export function validateProfileFields(fields: ProfileFields): ProfileErrors {
  const errors: ProfileErrors = {};
  const years = fields.experience.trim();
  if (years && (!/^\d+$/.test(years) || Number(years) > EXPERIENCE_MAX)) {
    errors.experience = `Ingresa un número entero entre 0 y ${EXPERIENCE_MAX}.`;
  }
  if (fields.phone.trim().length > PHONE_MAX) errors.phone = `Usa como máximo ${PHONE_MAX} caracteres.`;
  if (fields.bio.trim().length > BIO_MAX) errors.bio = `Usa menos de ${BIO_MAX} caracteres.`;
  return errors;
}

/** Accepts "12", "12,5" and "12.5". Returns NaN for anything else. */
export function parseRadius(text: string): number {
  const normalized = text.trim().replace(',', '.');
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN;
}

export function validateRadius(radiusKm: number): string | undefined {
  if (!Number.isFinite(radiusKm) || radiusKm < RADIUS_MIN || radiusKm > RADIUS_MAX) {
    return `Elige un radio entre ${RADIUS_MIN} y ${RADIUS_MAX} km.`;
  }
  return undefined;
}

/** Step of the +/- buttons: fine control up close, coarse for wide zones. */
export function radiusStep(radiusKm: number): number {
  if (radiusKm < 10) return 1;
  if (radiusKm < 50) return 5;
  return 10;
}
