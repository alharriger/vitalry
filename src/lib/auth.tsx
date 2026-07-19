import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

/**
 * Passwordless auth for Vitalry — magic link only, no passwords (product rule).
 * AuthProvider tracks the Supabase session; the app renders the sign-in wall
 * until there is one (see the route guard in App.tsx).
 *
 * E2E bypass: when built with VITE_E2E=true, the provider hands back a fake
 * authenticated session and never touches Supabase, so Playwright can exercise
 * the app without a backend or real magic-link round-trip.
 */
const E2E = import.meta.env.VITE_E2E === 'true';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Send a magic link to `email`. Rejects on failure so the UI can show it. */
  signInWithOtp: (email: string) => Promise<void>;
  /**
   * Email+password sign-in. NOT a product feature — the app is passwordless for
   * real users. This exists only for a dev-gated testing shortcut (see
   * SignInScreen), so a preview/localhost session can be obtained without the
   * magic-link email round-trip. Rejects on failure.
   */
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!E2E);

  useEffect(() => {
    if (E2E) return;

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (err) {
      // Misconfigured env (e.g. a clone with no .env). Drop the loading gate so
      // the sign-in screen renders and surfaces the error on submit, rather
      // than hanging forever on the splash.
      console.error(err);
      setLoading(false);
      return;
    }

    // Seed from any persisted session, then subscribe to changes (sign-in,
    // sign-out, token refresh, and the magic-link callback consuming the URL).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(() => {
    if (E2E) {
      return {
        session: { user: { id: 'e2e-user', email: 'e2e@vitalry.xyz' } } as Session,
        user: { id: 'e2e-user', email: 'e2e@vitalry.xyz' } as User,
        loading: false,
        signInWithOtp: async () => {},
        signInWithPassword: async () => {},
        signOut: async () => {},
      };
    }
    return {
      session,
      user: session?.user ?? null,
      loading,
      signInWithOtp: async (email: string) => {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
      },
      signInWithPassword: async (email: string, password: string) => {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        await getSupabase().auth.signOut();
      },
    };
  }, [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
