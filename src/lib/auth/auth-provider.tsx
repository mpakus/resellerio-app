import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { ApiError } from '@/src/lib/api/client';
import { getCurrentUsage, getCurrentUser, login, register } from '@/src/lib/api/auth';
import { emptySession, type Session } from '@/src/lib/auth/session';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/src/lib/storage/secure-store';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  session: Session;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_STORAGE_KEY = 'resellerio.mobile.session';

const AuthContext = createContext<AuthContextValue | null>(null);

type StoredSession = {
  token: string;
  expiresAt: string | null;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session>(emptySession);

  useEffect(() => {
    let cancelled = false;

    async function restorePersistedSession() {
      const rawSession = await getSecureItem(AUTH_STORAGE_KEY);

      if (!rawSession) {
        if (!cancelled) {
          setStatus('unauthenticated');
          setSession(emptySession);
        }

        return;
      }

      try {
        const parsed = JSON.parse(rawSession) as StoredSession;
        await hydrateWithToken(parsed.token, parsed.expiresAt);
      } catch {
        await deleteSecureItem(AUTH_STORAGE_KEY);

        if (!cancelled) {
          setStatus('unauthenticated');
          setSession(emptySession);
        }
      }
    }

    void restorePersistedSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function hydrateWithToken(token: string, expiresAt: string | null) {
    try {
      const [meResponse, usageResponse] = await Promise.all([
        getCurrentUser(token),
        getCurrentUsage(token),
      ]);

      setSession({
        token,
        expiresAt,
        user: meResponse.data.user,
        supportedMarketplaces: meResponse.data.supported_marketplaces,
        usage: usageResponse.data.usage,
        limits: usageResponse.data.limits,
      });
      setStatus('authenticated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await deleteSecureItem(AUTH_STORAGE_KEY);
      }

      setSession(emptySession);
      setStatus('unauthenticated');
    }
  }

  async function persistSession(token: string, expiresAt: string | null) {
    const value = JSON.stringify({ token, expiresAt } satisfies StoredSession);
    await setSecureItem(AUTH_STORAGE_KEY, value);
  }

  async function signIn(credentials: { email: string; password: string }) {
    const response = await login(credentials);
    const token = response.data.token;
    const expiresAt = response.data.expires_at ?? null;

    const usageResponse = await getCurrentUsage(token);

    await persistSession(token, expiresAt);
    setSession({
      token,
      expiresAt,
      user: response.data.user,
      supportedMarketplaces: response.data.supported_marketplaces,
      usage: usageResponse.data.usage,
      limits: usageResponse.data.limits,
    });
    setStatus('authenticated');
  }

  async function signUp(credentials: { email: string; password: string }) {
    const response = await register(credentials);
    const token = response.data.token;
    const expiresAt = response.data.expires_at ?? null;

    const usageResponse = await getCurrentUsage(token);

    await persistSession(token, expiresAt);
    setSession({
      token,
      expiresAt,
      user: response.data.user,
      supportedMarketplaces: response.data.supported_marketplaces,
      usage: usageResponse.data.usage,
      limits: usageResponse.data.limits,
    });
    setStatus('authenticated');
  }

  async function signOut() {
    await deleteSecureItem(AUTH_STORAGE_KEY);
    setSession(emptySession);
    setStatus('unauthenticated');
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        session,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
