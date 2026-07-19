/**
 * Live `daily_logs` data access — the thin Supabase layer behind Today.
 *
 * No React here (that's `useTodayLog`); just typed reads/writes scoped by RLS.
 * Every call goes through the browser client, so the viewer only ever sees or
 * writes rows RLS allows (their own logs, in a competition they belong to).
 *
 * IMPORTANT (Phase 2 gotcha): the Supabase host has a NetworkOnly workbox rule,
 * so these requests are never served from the SPA cache — a write is always a
 * real round-trip. Do not add caching in front of this layer.
 */

import { getSupabase } from './supabase';
import { localDateToday, previousLocalDate, type ScoringRules } from './scoring';
import type { GoalStates } from '../types';

/**
 * E2E bypass — mirrors the auth.tsx pattern. The Playwright build stubs auth
 * and must never talk to Supabase, so these calls return canned data and the
 * upsert is a no-op (edits live in React state for the length of the test).
 */
const E2E = import.meta.env.VITE_E2E === 'true';

/** The viewer's active competition, as Today needs it. */
export interface ActiveCompetition {
  id: string;
  name: string;
  /** Competition start, `'YYYY-MM-DD'`. The scoring window's left edge. */
  startDate: string;
  durationDays: number;
  /** Frozen scoring snapshot; null until an organizer sets it (falls back to
   *  `DEFAULT_SCORING_RULES` in the engine). */
  scoringRules: ScoringRules | null;
}

/** The viewer's minimal profile — name for the greeting, timezone for the day
 *  boundary. */
export interface ViewerProfile {
  name: string;
  timezone: string;
}

/**
 * Load the viewer's profile (name + timezone). The timezone drives the local
 * day boundary, so a missing/blank one falls back to the schema default rather
 * than the runtime zone — keeps scoring stable across devices.
 */
export async function loadViewerProfile(userId: string): Promise<ViewerProfile> {
  if (E2E) return { name: 'Amber', timezone: 'America/New_York' };
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('name, timezone')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return {
    name: data?.name?.trim() || 'there',
    timezone: data?.timezone || 'America/New_York',
  };
}

/**
 * Sync the viewer's stored timezone to their device's actual IANA zone.
 *
 * The day boundary (today/yesterday, the grace window) is computed from
 * `profiles.timezone` on BOTH the client and the server-side grace-window
 * trigger — so the two must agree, or a legitimate edit could be rejected at the
 * midnight edge. Keeping the stored zone in step with the device the player is
 * actually on is what keeps "today" honest to their local clock. No-op when the
 * zone is unchanged; there's no timezone-picker UI yet, so the device is the
 * best available signal.
 */
export async function updateProfileTimezone(userId: string, timezone: string): Promise<void> {
  if (E2E) return;
  const supabase = getSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({ timezone })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Find the viewer's single active competition. RLS (`competitions_select`)
 * already scopes this to competitions in a group they belong to, so a plain
 * `status='active'` filter can only ever return their own. v1 assumes one
 * active game per player; if several exist we take the earliest-starting one
 * deterministically.
 */
export async function findActiveCompetition(): Promise<ActiveCompetition | null> {
  if (E2E) {
    // A stub in-progress game; start a few days back so "today" is safely
    // inside the window whatever the runner's timezone.
    const start = previousLocalDate(previousLocalDate(previousLocalDate(localDateToday())));
    return { id: 'e2e-competition', name: 'E2E Competition', startDate: start, durationDays: 14, scoringRules: null };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('competitions')
    .select('id, name, start_date, duration_days, scoring_rules')
    .eq('status', 'active')
    .order('start_date', { ascending: true })
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    durationDays: row.duration_days,
    scoringRules: (row.scoring_rules as ScoringRules | null) ?? null,
  };
}

/**
 * Load all of the viewer's logs for a competition, keyed by `local_date`.
 * The full history (not just today) is what lets the engine compute streaks
 * and a true day score. RLS restricts reads to competitions the viewer belongs
 * to; we additionally filter to their own `user_id`.
 */
export async function loadUserLogs(
  competitionId: string,
  userId: string,
): Promise<Record<string, GoalStates>> {
  if (E2E) return {};
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('local_date, goal_states')
    .eq('competition_id', competitionId)
    .eq('user_id', userId);
  if (error) throw error;
  const byDate: Record<string, GoalStates> = {};
  for (const row of data ?? []) {
    byDate[row.local_date as string] = (row.goal_states as GoalStates) ?? {};
  }
  return byDate;
}

/**
 * Upsert one day's goal states. Conflict target is the natural key
 * `(competition_id, user_id, local_date)` — the same day is updated in place,
 * never duplicated. RLS's insert/update checks enforce that the viewer can only
 * write their own row in a competition they belong to.
 *
 * `updated_at` is bumped so realtime subscribers (leaderboards) see the change.
 */
export async function upsertDayLog(params: {
  competitionId: string;
  userId: string;
  localDate: string;
  goalStates: GoalStates;
}): Promise<void> {
  if (E2E) return; // edits live in React state only during E2E
  const supabase = getSupabase();
  const { error } = await supabase.from('daily_logs').upsert(
    {
      competition_id: params.competitionId,
      user_id: params.userId,
      local_date: params.localDate,
      goal_states: params.goalStates,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'competition_id,user_id,local_date' },
  );
  if (error) throw error;
}
