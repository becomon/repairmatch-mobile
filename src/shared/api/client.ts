import { API_BASE_URL } from './config';
import { ApiError } from './errors';
import { deleteSecret, getSecret, setSecret } from './storage';
import type { TokenPair } from './types';

const REFRESH_KEY = 'repairmatch.refreshToken';
const TIMEOUT_MS = 30_000;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Skips the Bearer header and the refresh-on-401 logic (login, register, refresh). */
  anonymous?: boolean;
}

// The access token lives in memory only; the refresh token is persisted in secure storage.
let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

export async function saveTokens(pair: TokenPair) {
  accessToken = pair.accessToken;
  await setSecret(REFRESH_KEY, pair.refreshToken);
}

export async function clearTokens() {
  accessToken = null;
  await deleteSecret(REFRESH_KEY);
}

export function readRefreshToken() {
  return getSecret(REFRESH_KEY);
}

async function rawFetch(path: string, options: RequestOptions, token: string | null): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort);
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (cause) {
    if (options.signal?.aborted) throw cause;
    throw new ApiError(0, 'Network request failed');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = response.statusText;
  let fields: Record<string, string> = {};
  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object') {
      const record = data as { message?: unknown; errors?: unknown };
      if (typeof record.message === 'string') message = record.message;
      if (record.errors && typeof record.errors === 'object') {
        fields = Object.fromEntries(
          Object.entries(record.errors as Record<string, unknown>).filter(([, v]) => typeof v === 'string'),
        ) as Record<string, string>;
      }
    }
  } catch {
    // Body was not JSON; keep the status text.
  }
  return new ApiError(response.status, message, fields);
}

/** Single-flight refresh: concurrent 401s share one call because refresh tokens are single use. */
function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = await readRefreshToken();
      if (!refreshToken) return false;
      try {
        const response = await rawFetch('/auth/refresh', { method: 'POST', body: { refreshToken } }, null);
        if (!response.ok) {
          if (response.status === 401 || response.status === 400) await clearTokens();
          return false;
        }
        await saveTokens((await response.json()) as TokenPair);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/** Restores the session on app start. Returns false when there is nothing to restore. */
export function restoreSession(): Promise<boolean> {
  return refreshSession();
}

async function execute(path: string, options: RequestOptions): Promise<Response> {
  let response = await rawFetch(path, options, options.anonymous ? null : accessToken);
  if (response.status === 401 && !options.anonymous) {
    if (await refreshSession()) {
      response = await rawFetch(path, options, accessToken);
    }
    if (response.status === 401) {
      await clearTokens();
      onSessionExpired?.();
    }
  }
  if (!response.ok) throw await toApiError(response);
  return response;
}

export const api = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const response = await execute(path, options);
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  },
  async send(path: string, options: RequestOptions = {}): Promise<void> {
    await execute(path, options);
  },
};
