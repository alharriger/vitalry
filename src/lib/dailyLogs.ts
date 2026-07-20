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
import { localDateRange, localDateToday, previousLocalDate, type ScoringRules } from './scoring';
import { DAILY_9 } from './goals';
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
  /** Owning group — the membership scope for the leaderboard's player list. */
  groupId: string;
  /** Competition start, `'YYYY-MM-DD'`. The scoring window's left edge. */
  startDate: string;
  durationDays: number;
  /** Optional free-text prize (organizer-set); null until entered. */
  prizeText: string | null;
  /** Frozen scoring snapshot; null until an organizer sets it (falls back to
   *  `DEFAULT_SCORING_RULES` in the engine). */
  scoringRules: ScoringRules | null;
}

/** One member of a competition's group — a player row on the leaderboard. */
export interface CompetitionMember {
  userId: string;
  /** Display name (from `profiles.name`); falls back for a blank profile. */
  name: string;
  /** Chosen avatar token/hex, or null → derive a deterministic color from name. */
  avatar: string | null;
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
    return {
      id: 'e2e-competition',
      name: 'E2E Competition',
      groupId: 'e2e-group',
      startDate: start,
      durationDays: 14,
      prizeText: 'Bragging rights',
      scoringRules: null,
    };
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('competitions')
    .select('id, name, group_id, start_date, duration_days, prize_text, scoring_rules')
    .eq('status', 'active')
    .order('start_date', { ascending: true })
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    groupId: row.group_id,
    startDate: row.start_date,
    durationDays: row.duration_days,
    prizeText: (row.prize_text as string | null) ?? null,
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
 * A `goal_states` marking the first `n` of the Daily 9 done (counter goals
 * filled to max so they count via `isGoalDone`). Shared shape with the seed;
 * used only to build E2E stub data below.
 */
function stubGoalStates(n: number): GoalStates {
  const states: GoalStates = {};
  DAILY_9.slice(0, n).forEach((g) => {
    states[g.key] = g.logType === 'counter' ? (g.counterMax ?? 1) : true;
  });
  return states;
}

/**
 * Load the members of a competition's group — the leaderboard's player list.
 * RLS (`group_members_select` + `profiles_select`) already scopes this to
 * co-members of a group the viewer belongs to, so no client-side trust needed.
 */
export async function loadCompetitionMembers(groupId: string): Promise<CompetitionMember[]> {
  if (E2E) {
    return [
      { userId: 'e2e-user', name: 'Amber', avatar: null },
      { userId: 'e2e-dad', name: 'Dad', avatar: null },
      { userId: 'e2e-mom', name: 'Mom', avatar: null },
    ];
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('group_members')
    .select('user_id, profiles ( name, avatar )')
    .eq('group_id', groupId);
  if (error) throw error;
  return (data ?? []).map((row) => {
    // The embedded profile arrives as an object (one-to-one), but supabase-js
    // types it as possibly-array — normalize either shape.
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      userId: row.user_id as string,
      name: (p?.name as string | null)?.trim() || 'Player',
      avatar: (p?.avatar as string | null) ?? null,
    };
  });
}

/**
 * Load every player's logs for a competition, as `{ userId: { date: states } }`.
 * RLS (`daily_logs_select`) permits reading ALL logs in a competition the viewer
 * belongs to — this is exactly the leaderboard read the policy was written for.
 */
export async function loadCompetitionLogs(
  competitionId: string,
): Promise<Record<string, Record<string, GoalStates>>> {
  if (E2E) {
    // A deterministic 3-player board over the E2E window (start = today−3).
    // Amber leads on a 3-perfect-day run; Dad is steadily active; Mom is mixed.
    const today = localDateToday();
    const start = previousLocalDate(previousLocalDate(previousLocalDate(today)));
    const [d0, d1, d2] = localDateRange(start, previousLocalDate(today)); // 3 past days
    const byUser: Record<string, Record<string, GoalStates>> = {
      'e2e-user': { [d0]: stubGoalStates(9), [d1]: stubGoalStates(9), [d2]: stubGoalStates(9), [today]: stubGoalStates(4) },
      'e2e-dad': { [d0]: stubGoalStates(7), [d1]: stubGoalStates(6), [d2]: stubGoalStates(8), [today]: stubGoalStates(6) },
      'e2e-mom': { [d0]: stubGoalStates(3), [d1]: stubGoalStates(9), [d2]: stubGoalStates(5), [today]: stubGoalStates(2) },
    };
    return byUser;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('daily_logs')
    .select('user_id, local_date, goal_states')
    .eq('competition_id', competitionId);
  if (error) throw error;
  const byUser: Record<string, Record<string, GoalStates>> = {};
  for (const row of data ?? []) {
    const uid = row.user_id as string;
    (byUser[uid] ??= {})[row.local_date as string] = (row.goal_states as GoalStates) ?? {};
  }
  return byUser;
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
