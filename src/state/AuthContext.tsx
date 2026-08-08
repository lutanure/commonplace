import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabaseClient';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Anonymous sign-in is rate-limited per IP, so this must always check for
  // an already-persisted session first — calling signInAnonymously() on
  // every launch is both wrong behavior and a real way to hit that limit.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (data.session) {
          if (!cancelled) {
            setSession(data.session);
          }
          return;
        }

        const { data: signInData, error: signInError } =
          await supabase.auth.signInAnonymously();
        if (signInError) {
          throw signInError;
        }
        if (!cancelled) {
          setSession(signInData.session);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to start a session.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // RN has no browser tab to auto-pause a background refresh timer, so the
  // token-refresh lifecycle has to be driven manually from AppState.
  useEffect(() => {
    function handleAppStateChange(state: AppStateStatus) {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
