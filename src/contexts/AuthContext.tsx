import { createContext, useContext, useState, type ReactNode } from 'react';
import { createSession, type User } from '../services/client';

type Session = ReturnType<typeof createSession>;
interface AuthState { session: Session | null; user: User | null; connect: (url: string, email?: string, password?: string) => Promise<boolean>; logout: () => Promise<void> }
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  async function connect(url: string, email?: string, password?: string) {
    const candidate = createSession(url, () => { setUser(null); setSession(null); });
    const profile = email !== undefined && password !== undefined ? await candidate.login(email, password) : await candidate.restore();
    if (!profile) return false;
    setUser(profile); setSession(candidate); return true;
  }
  async function logout() { const previous = session; setSession(null); setUser(null); await previous?.logout(); }
  return <AuthContext.Provider value={{ session, user, connect, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('Falta el proveedor de sesión.'); return value; }
