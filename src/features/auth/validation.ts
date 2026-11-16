const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Escribe tu correo.';
  if (v.length > 254 || !EMAIL.test(v)) return 'Escribe un correo válido.';
  return undefined;
}

/** Same rule as the backend: 8-72 chars with upper, lower, digit and symbol. */
export function validatePassword(value: string): string | undefined {
  if (value.length < 8) return 'Usa al menos 8 caracteres.';
  if (value.length > 72) return 'Usa 72 caracteres como máximo.';
  if (!/[A-Z]/.test(value)) return 'Incluye una mayúscula.';
  if (!/[a-z]/.test(value)) return 'Incluye una minúscula.';
  if (!/\d/.test(value)) return 'Incluye un número.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Incluye un símbolo, por ejemplo ! o #.';
  return undefined;
}

export function validateName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Escribe tu nombre.';
  if (v.length > 100) return 'Usa 100 caracteres como máximo.';
  return undefined;
}
