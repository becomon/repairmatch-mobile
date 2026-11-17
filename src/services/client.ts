import { AxiosHeaders, create, isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface User { id: string; name: string; email: string; role: 'CLIENT' | 'TECHNICIAN' }
interface Tokens { accessToken: string; refreshToken: string }
export interface ApiClient { request<T>(path: string, options?: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; signal?: AbortSignal }): Promise<T> }

export function validateBaseUrl(value: string) {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error('Ingresa una dirección válida del backend, incluyendo https:// y /api.'); }
  const local = /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(url.hostname);
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && local))) throw new Error('Usa HTTPS para el servidor público o HTTP con la IP de tu red local.');
  return url.toString().replace(/\/$/, '');
}

export function errorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado. Intenta nuevamente.';
    if (!error.response) return 'No se pudo conectar. Revisa tu conexión y vuelve a intentar.';
    const status = error.response.status;
    if (status === 401) return 'Tu sesión venció o los datos de acceso son incorrectos. Inicia sesión nuevamente.';
    if (status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';
    if (status === 404) return 'No se encontró el recurso solicitado.';
    if (status === 409) return 'El estado cambió. Actualiza la información antes de continuar.';
    if (status === 429) return 'Hay demasiadas solicitudes. Espera un momento e intenta nuevamente.';
    if (status >= 500) return 'El servidor no está disponible. Intenta más tarde.';
    return 'Revisa los datos ingresados. No se pudo completar la operación.';
  }
  return error instanceof Error ? error.message : 'No se pudo completar la operación.';
}

export function createSession(baseUrl: string, onExpired: () => void) {
  const baseURL = validateBaseUrl(baseUrl);
  const key = `repairmatch.${encodeURIComponent(baseURL).replace(/%/g, '_')}`;
  const transport = create({ baseURL, timeout: 15000, headers: { Accept: 'application/json' } });
  const auth = create({ baseURL, timeout: 15000, headers: { Accept: 'application/json' } });
  let tokens: Tokens | null = null;
  let refreshing: Promise<void> | null = null;
  let revision = 0;
  async function persist(value: Tokens) {
    if (typeof value.accessToken !== 'string' || !value.accessToken || typeof value.refreshToken !== 'string' || !value.refreshToken) throw new Error('La respuesta de autenticación no es válida.');
    await SecureStore.setItemAsync(key, JSON.stringify(value), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    tokens = value;
  }
  async function clear() { revision++; tokens = null; await SecureStore.deleteItemAsync(key); }
  transport.interceptors.request.use(config => {
    // Only relative paths on this backend may receive the JWT.
    if (!config.url?.startsWith('/') || config.url.startsWith('//') || config.url.includes('..')) throw new Error('Ruta del servidor no válida.');
    config.headers = AxiosHeaders.from(config.headers);
    if (tokens) config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    return config;
  });
  transport.interceptors.response.use(response => response, async error => {
    const config = error.config;
    if (error.response?.status === 401 && config && !config.sessionRetried && tokens?.refreshToken) {
      config.sessionRetried = true;
      const version = revision;
      try {
        if (!refreshing) refreshing = (async () => {
          const response = await auth.post<Tokens>('/auth/refresh', { refreshToken: tokens!.refreshToken });
          if (version !== revision) throw new Error('La sesión cambió.');
          await persist(response.data);
        })().finally(() => { refreshing = null; });
        await refreshing;
        return transport(config);
      } catch (cause) {
        if (version === revision) { await clear(); onExpired(); }
        throw cause;
      }
    }
    if (error.response?.status === 401) { await clear(); onExpired(); }
    // Retry only safe reads, once. Never automatically repeat a write.
    if (config && !config.signal?.aborted && config.method === 'get' && !config.readRetried && (!error.response || [502, 503, 504].includes(error.response.status))) {
      config.readRetried = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      return transport(config);
    }
    throw error;
  });
  const api: ApiClient = { async request<T>(path: string, options?: Parameters<ApiClient['request']>[1]) {
    return (await transport.request<T>({ url: path, method: options?.method ?? 'GET', data: options?.body, signal: options?.signal })).data;
  } };
  return {
    api,
    async restore() {
      const saved = await SecureStore.getItemAsync(key);
      if (!saved) return null;
      try { tokens = JSON.parse(saved); } catch { await clear(); return null; }
      if (!tokens?.accessToken || !tokens.refreshToken) { await clear(); return null; }
      return api.request<User>('/users/me');
    },
    async login(email: string, password: string) {
      await persist((await auth.post<Tokens>('/auth/login', { email: email.trim(), password })).data);
      return api.request<User>('/users/me');
    },
    async logout() {
      const refreshToken = tokens?.refreshToken;
      await clear();
      if (refreshToken) await auth.post('/auth/logout', { refreshToken });
    },
  };
}
