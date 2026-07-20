/**
 * Leaderboard standings — pure, deterministic, no React, no Supabase.
 *
 * Turns a competition's members + everyone's logs into a ranked board by
 * running each player through the scoring engine (`scoreCompetition`) — so the
 * leaderboard and the day breakdown are, by construction, the SAME math the
 * rest of the app uses. Ranking is by goal completion only (never raw stats):
 * total score, then the contract's tie-breakers (perfect days → longest perfect
 * streak → shared rank).
 *
 * Also holds the realtime reducer (`applyLogChange`) that folds a single
 * `daily_logs` change into the logs-by-user map so the board updates live from
 * one player's tap without a full refetch.
 */

import {
  countDone,
  currentPerfectStreak,
  dayClass,
  scoreCompetition,
  type DayClass,
  type DayScoreResult,
  type ScoringRules,
} from './scoring';
import { colorForName } from './avatarColor';
import type { CompetitionMember } from './dailyLogs';
import type { GoalStates } from '../types';

/** One player's ranked standing — everything a `LeaderboardRow` + breakdown need. */
export interface PlayerStanding {
  userId: string;
  name: string;
  /** Avatar color (the player's chosen avatar, else derived from their name). */
  avatarColor: string;
  /** 1-based rank; equal on a full three-key tie (shared rank). */
  rank: number;
  /** Sum of every scored day (the ranking key). */
  totalScore: number;
  /** Perfect-day count (tie-breaker 1; shown in the breakdown). */
  perfectDays: number;
  /** Longest perfect-day run in the window (tie-breaker 2). */
  longestStreak: number;
  /** Current perfect-day run ending today (the flame). */
  currentStreak: number;
  /** Goals completed today (the 9-pip "today" tracker). */
  doneToday: number;
  /** Today's day class — colors the "today" pips (perfect/active/some/nothing). */
  todayClass: DayClass;
  /** Whether this row is the viewer. */
  isYou: boolean;
  /** Per-day breakdown across the window (drives the breakdown sheet). */
  days: DayScoreResult[];
}

export interface ComputeStandingsInput {
  /** The competition's group members — the player list. */
  members: CompetitionMember[];
  /** Every player's logs, `{ userId: { 'YYYY-MM-DD': states } }`. */
  logsByUser: Record<string, Record<string, GoalStates>>;
  /** Competition start (window left edge). */
  startDate: string;
  /** The viewer's local today (window right edge + the "today" for pips/flame). */
  today: string;
  /** Scoring contract; defaults to the engine's default. */
  rules?: ScoringRules;
  /** The viewer's user id, to mark the `isYou` row. */
  viewerId: string | null;
}

/**
 * Rank a competition's members into an ordered leaderboard.
 *
 * Every player is scored over the same `startDate..today` window (a missing day
 * scores 0, so streaks reset correctly — the engine walks the full range). The
 * board is sorted by total score, then perfect days, then longest streak; a
 * fully-tied pair shares a rank (competition ranking: the next distinct player
 * skips the shared positions). Ties beyond the three keys fall back to a stable
 * name/id order so the output is deterministic (never `Math.random`/insertion).
 */
export function computeStandings(input: ComputeStandingsInput): PlayerStanding[] {
  const { members, logsByUser, startDate, today, rules, viewerId } = input;
  // Clamp the right edge so a not-yet-started competition yields an empty range
  // rather than throwing (localDateRange returns [] when asOf < startDate).
  const asOf = today >= startDate ? today : startDate;

  const scored: PlayerStanding[] = members.map((m) => {
    const logs = logsByUser[m.userId] ?? {};
    const standing = scoreCompetition({ startDate, asOf, logsByDate: logs, rules });
    const doneToday = countDone(logs[today]);
    return {
      userId: m.userId,
      name: m.name,
      avatarColor: m.avatar ?? colorForName(m.name),
      rank: 0, // assigned after sort
      totalScore: standing.totalScore,
      perfectDays: standing.perfectDays,
      longestStreak: standing.longestStreak,
      currentStreak: currentPerfectStreak(standing.days, today),
      doneToday,
      todayClass: dayClass(doneToday, rules),
      isYou: viewerId != null && m.userId === viewerId,
      days: standing.days,
    };
  });

  scored.sort(byRankThenName);

  // Competition ranking with shared ranks: a player ties the one above only when
  // all three ranking keys match; the next distinct player takes their ordinal.
  scored.forEach((p, i) => {
    p.rank = i > 0 && sameRankKeys(p, scored[i - 1]) ? scored[i - 1].rank : i + 1;
  });

  return scored;
}

/** Do two players tie on every ranking key (→ they share a rank)? */
function sameRankKeys(a: PlayerStanding, b: PlayerStanding): boolean {
  return (
    a.totalScore === b.totalScore &&
    a.perfectDays === b.perfectDays &&
    a.longestStreak === b.longestStreak
  );
}

/** Sort: score desc → perfect days desc → longest streak desc → stable name/id. */
function byRankThenName(a: PlayerStanding, b: PlayerStanding): number {
  return (
    b.totalScore - a.totalScore ||
    b.perfectDays - a.perfectDays ||
    b.longestStreak - a.longestStreak ||
    a.name.localeCompare(b.name) ||
    a.userId.localeCompare(b.userId)
  );
}

/**
 * A realtime `daily_logs` change, as the Supabase channel delivers it (snake_case
 * row columns). Only the fields the board needs are typed.
 */
export interface LogChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: { user_id?: string; local_date?: string; goal_states?: GoalStates } | null;
  old?: { user_id?: string; local_date?: string } | null;
}

/**
 * Fold one realtime change into the logs-by-user map, returning a NEW map
 * (immutable update, so React re-renders and re-scores). INSERT/UPDATE write the
 * row's states; DELETE removes the day when the payload carries its keys (a
 * default replica identity may omit non-key columns — we only need the keys).
 * An unrecognized/incomplete payload returns the map unchanged (referentially
 * equal, so no needless render).
 */
export function applyLogChange(
  logsByUser: Record<string, Record<string, GoalStates>>,
  payload: LogChangePayload,
): Record<string, Record<string, GoalStates>> {
  if (payload.eventType === 'DELETE') {
    const uid = payload.old?.user_id;
    const date = payload.old?.local_date;
    if (!uid || !date || !logsByUser[uid] || !(date in logsByUser[uid])) return logsByUser;
    const nextForUser = { ...logsByUser[uid] };
    delete nextForUser[date];
    return { ...logsByUser, [uid]: nextForUser };
  }

  // INSERT or UPDATE.
  const row = payload.new;
  if (!row?.user_id || !row.local_date) return logsByUser;
  return {
    ...logsByUser,
    [row.user_id]: {
      ...(logsByUser[row.user_id] ?? {}),
      [row.local_date]: row.goal_states ?? {},
    },
  };
}
