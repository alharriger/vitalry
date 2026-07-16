import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client (singleton). This is a plain SPA — no SSR — so the
 * standard client with a persisted session is all we need.
 *
 * The URL + anon key are public by design; RLS is what actually protects data.
 * They're read from Vite env (`VITE_` prefix = bundled into the client).
 *
 * The client is null when env is absent (e.g. a fresh clone with no `.env`, or
 * the E2E build which stubs auth and never talks to Supabase). Call
 * `getSupabase()` at the point of use so a missing config fails loudly there
 * rather than crashing the whole app at import time.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // Consume the magic-link token from the callback URL, then clean it.
          detectSessionInUrl: true,
        },
      })
    : null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    );
  }
  return supabase;
}
