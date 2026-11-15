import type { EvidenceApiClient } from '../features/evidences/api';

export interface RequestSummary { id: number; originalDescription: string; }
export interface User { id: string; name: string; role: string; }

// Temporary test adapter: credentials and access token remain in memory only.
// Replace with the foundation owner's authenticated client when integrated.
export function createPhotoTestSession(baseUrl: string) {
  const base = new URL(baseUrl.trim());
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error('Enter an HTTP(S) API URL without credentials, query or fragment.');
  }
  if (base.protocol !== 'https:' && !/^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(base.hostname)) {
    throw new Error('Use HTTPS for a remote API, or HTTP with a local network address.');
  }
  let accessToken = '';
  const prefix = base.toString().replace(/\/$/, '');
  async function call<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('..')) throw new Error('Invalid API path.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${prefix}${path}`, {
        method, redirect: 'error', signal: controller.signal,
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(accessToken && !path.startsWith('/auth/') ? { Authorization: `Bearer ${accessToken}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) accessToken = '';
        throw new Error(typeof data?.message === 'string' ? data.message : `API error (${response.status}).`);
      }
      return data as T;
    } finally { clearTimeout(timer); }
  }
  const client: EvidenceApiClient = {
    request: (path, options) => call(path, options?.method, options?.body),
  };
  return {
    client,
    async login(email: string, password: string) {
      const tokens = await call<{ accessToken: string }>('/auth/login', 'POST', { email: email.trim(), password });
      if (typeof tokens.accessToken !== 'string' || !tokens.accessToken) throw new Error("La respuesta de inicio de sesión no es válida.");
      accessToken = tokens.accessToken;
      const user = await call<User>('/users/me');
      if (user.role !== 'CLIENT') { accessToken = ''; throw new Error("Ingresa con la cuenta cliente propietaria de la solicitud."); }
      return user;
    },
    async requests() {
      const data = await call<{ content: RequestSummary[] }>('/requests?page=0&size=100');
      if (!Array.isArray(data.content)) throw new Error("La respuesta de solicitudes no es válida.");
      return data.content;
    },
    clear() { accessToken = ''; },
  };
}
