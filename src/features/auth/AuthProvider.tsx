import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/shared/api/endpoints';
import {
  clearTokens,
  readRefreshToken,
  restoreSession,
  saveTokens,
  setSessionExpiredHandler,
} from '@/shared/api/client';
import { runSessionCleaners } from '@/shared/api/session';
import type { RegisterBody, User } from '@/shared/api/types';

/** Registration worked but the automatic sign-in after it did not. */
export class AccountCreatedError extends Error {
  constructor(cause: unknown) {
    super("Tu cuenta se creó, pero no pudimos iniciar sesión. Entra desde \"Iniciar sesión\" con tu correo y contraseña.", { cause });
    this.name = "AccountCreatedError";
  }
}

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  // Restore a previous session: exchange the stored refresh token, then load the profile.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (await restoreSession()) {
          const me = await authApi.me();
          if (active) {
            setUser(me);
            setStatus('signedIn');
          }
          return;
        }
      } catch {
        // Falls through to signed out.
      }
      if (active) setStatus('signedOut');
    })();
    return () => {
      active = false;
    };
  }, []);

  // The client calls this when a 401 cannot be recovered by refreshing.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      runSessionCleaners();
      setUser(null);
      setStatus('signedOut');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const pair = await authApi.login(email.trim(), password);
    await saveTokens(pair);
    const me = await authApi.me();
    setUser(me);
    setStatus('signedIn');
  }, []);

  const register = useCallback(
    async (body: RegisterBody) => {
      await authApi.register({ ...body, name: body.name.trim(), email: body.email.trim() });
      try {
        await login(body.email, body.password);
      } catch (cause) {
        // The account exists now: retrying the form would answer "email already registered".
        throw new AccountCreatedError(cause);
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    const refreshToken = await readRefreshToken();
    // Revoke on the server best-effort; the local session ends either way.
    if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined);
    await clearTokens();
    runSessionCleaners();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(() => ({ status, user, login, register, logout }), [status, user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** The signed-in user; only call below a role gate. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useUser requires a signed-in user');
  return user;
}
