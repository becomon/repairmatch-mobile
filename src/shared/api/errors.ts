export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Status 0 means the request never reached the server (offline, DNS, CORS, timeout). */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

const BY_STATUS: Record<number, string> = {
  400: 'Revisa los datos e inténtalo de nuevo.',
  401: 'Tu sesión expiró. Inicia sesión otra vez.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No encontramos lo que buscabas.',
  409: 'Esta acción ya no es posible porque el estado cambió.',
  500: 'Algo falló de nuestro lado. Inténtalo en un momento.',
};

// Server messages are mixed Spanish/English; keep only the ones that are already Spanish.
const SPANISH_HINT = /[áéíóúñ¿¡]|\b(el|la|los|las|de|del|no|se|tu|tus|para|con|solicitud|propuesta|servicio)\b/i;

/** Turns any thrown value into Spanish text that is safe to show to the user. */
export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'No pudimos conectar con el servidor. Revisa tu internet e inténtalo otra vez.';
    const firstField = Object.values(error.fieldErrors)[0];
    if (error.status === 400 && firstField) return firstField;
    if (error.status === 401) return BY_STATUS[401]!;
    if (error.message && SPANISH_HINT.test(error.message)) return error.message;
    return BY_STATUS[error.status] ?? 'Algo salió mal. Inténtalo otra vez.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Algo salió mal. Inténtalo otra vez.';
}
