/**
 * Vitalry scoring engine — pure, deterministic, no React, no Supabase.
 *
 * This module is the single source of truth for how points are earned. It
 * encodes the scoring contract from `fit-friends-and-fam-plan.md` §6 and the
 * product invariants in `ai_docs/working_sprint.md`. Because scoring is a
 * contract, changes here require re-running `scoring.test.ts` and logging the
 * delta (see CLAUDE.md hard rules).
 *
 * Everything operates on `'YYYY-MM-DD'` local-date strings — there is no UTC
 * math anywhere in this file, so a player's day boundary is always their own
 * local midnight and time zones never fight the clock.
 */

import type { GoalStates } from '../types';
import { DAILY_9, GOAL_COUNT, isGoalDone } from './goals';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The full, self-describing scoring contract. Frozen into
 * `competitions.scoring_rules` (jsonb) at competition start so a competition's
 * scoring can never drift when the defaults change, and used as the engine's
 * fallback when a competition has no snapshot yet. Storing the actual thresholds
 * (not just a version tag) keeps the engine free of hidden constants.
 */
export interface ScoringRules {
  /** Number of goals in a day (9 in v1). Base points cap at this value. */
  goalCount: number;
  /**
   * Goals completed to make a day "active". 6 in v1. In v1 this drives ONLY the
   * calendar-cell color (`dayClass`) — it is not a scoring input. The streak is
   * built from perfect days, not active days.
   */
  activeThreshold: number;
  /** Bonus for completing every goal in a day. +3 in v1. */
  perfectBonus: number;
  /**
   * Consecutive perfect days required before the streak bonus starts paying out.
   * 3 in v1 — days 1 and 2 of a perfect run earn no streak bonus; day 3 onward
   * does.
   */
  streakThreshold: number;
  /**
   * Flat bonus awarded on each perfect day once the streak has reached
   * `streakThreshold`. +2 in v1, every qualifying day (no ramp, no cap beyond
   * the flat value).
   */
  streakBonus: number;
}

/** The kind of a day, used for both scoring and calendar-cell language. */
export type DayClass = 'perfect' | 'active' | 'some' | 'nothing';

/** The score breakdown for one player on one day. */
export interface DayScoreResult {
  /** The day this result is for, as `'YYYY-MM-DD'`. */
  localDate: string;
  /** Goals completed this day (0..goalCount). */
  doneCount: number;
  /** Base points — 1 per completed goal, capped at goalCount. */
  base: number;
  /** Perfect-day bonus (perfectBonus if all goals done, else 0). */
  perfectBonus: number;
  /** Streak bonus this day: 0, or the flat `rules.streakBonus` once the perfect
   *  run has reached `rules.streakThreshold`. */
  streakBonus: number;
  /** base + perfectBonus + streakBonus. */
  total: number;
  /** Calendar-cell / breakdown classification. */
  dayClass: DayClass;
  /** Whether this day counts as active (doneCount >= activeThreshold). */
  isActive: boolean;
  /** Whether every goal was completed. */
  isPerfect: boolean;
}

/** A player's standing across a competition window, with tie-breaker fields. */
export interface StandingResult {
  /** Sum of every day's total across the window. */
  totalScore: number;
  /** Count of perfect days (tie-breaker 1). */
  perfectDays: number;
  /** Longest run of consecutive perfect days — the streak (tie-breaker 2). */
  longestStreak: number;
  /** Count of active days (6+/9). A stat only; not a scoring input in v1. */
  activeDays: number;
  /** Per-day breakdown, one entry per day in `startDate..asOf` inclusive. */
  days: DayScoreResult[];
}

// ---------------------------------------------------------------------------
// The contract's default values
// ---------------------------------------------------------------------------

/**
 * The v1 scoring contract. This constant is BOTH the seed written into
 * `competitions.scoring_rules` at competition start AND the engine's fallback
 * default when no snapshot exists. Max daily score = 9 base + 3 perfect + 2
 * streak = 14 (on the 3rd and each later day of a perfect-day streak).
 */
export const DEFAULT_SCORING_RULES: ScoringRules = {
  goalCount: GOAL_COUNT,
  activeThreshold: 6,
  perfectBonus: 3,
  streakThreshold: 3,
  streakBonus: 2,
};

// ---------------------------------------------------------------------------
// Local-date helpers — string math only, no UTC/Date arithmetic
// ---------------------------------------------------------------------------

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Upper bound on the number of days {@link localDateRange} will walk. A v1
 * competition is at most ~a few weeks and Phase 5 scores each competition's
 * window separately, so ~10 years is comfortably beyond any real range while
 * turning a crafted/garbage span into a fast `RangeError` instead of a
 * multi-million-iteration hang (defense-in-depth for the 2.2 DB-fed dates).
 */
const MAX_DATE_RANGE_DAYS = 3660;

/**
 * Assert `date` is a real `'YYYY-MM-DD'` calendar date. Validates BOTH the
 * format and the semantics (month 1–12, day within that month) so downstream
 * date math can't be handed something like `2026-13-99` or `2026-02-30` and
 * loop off into the weeds.
 */
function assertLocalDate(date: string): void {
  if (!DATE_RE.test(date)) {
    throw new RangeError(`Expected a 'YYYY-MM-DD' local date, got: ${date}`);
  }
  const [y, m, d] = date.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) {
    throw new RangeError(`Not a valid calendar date: ${date}`);
  }
}

/** Days in a given month (1-indexed), accounting for leap years. */
function daysInMonth(year: number, month: number): number {
  // Feb: leap year if divisible by 4, except centuries not divisible by 400.
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Zero-pad a year to 4 digits so lexicographic string ordering stays correct. */
function pad4(n: number): string {
  return `${n}`.padStart(4, '0');
}

/**
 * Today's local date in the given IANA time zone as `'YYYY-MM-DD'`.
 *
 * Uses `Intl.DateTimeFormat` with `en-CA` (which formats as YYYY-MM-DD) so the
 * calendar date is resolved in the player's own zone — never via `toISOString`,
 * which would shift by the UTC offset and land on the wrong day near midnight.
 * `timeZone` defaults to the runtime's zone. `now` is injectable for testing.
 */
export function localDateToday(timeZone?: string, now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // en-CA yields "YYYY-MM-DD"; normalize any locale surprises to be safe.
  const parts = fmt.formatToParts(now);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

/** The calendar day before `date`, handling month/year/leap rollovers. */
export function previousLocalDate(date: string): string {
  assertLocalDate(date);
  let [y, m, d] = date.split('-').map(Number);
  d -= 1;
  if (d < 1) {
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    d = daysInMonth(y, m);
  }
  return `${pad4(y)}-${pad(m)}-${pad(d)}`;
}

/** The calendar day after `date`, handling month/year/leap rollovers. */
export function nextLocalDate(date: string): string {
  assertLocalDate(date);
  let [y, m, d] = date.split('-').map(Number);
  d += 1;
  if (d > daysInMonth(y, m)) {
    d = 1;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return `${pad4(y)}-${pad(m)}-${pad(d)}`;
}

/** Inclusive `startDate..endDate` as an ordered array of local-date strings. */
export function localDateRange(startDate: string, endDate: string): string[] {
  assertLocalDate(startDate);
  assertLocalDate(endDate);
  if (endDate < startDate) return [];
  const out: string[] = [];
  let cursor = startDate;
  // String comparison is valid ordering for zero-padded YYYY-MM-DD.
  while (cursor <= endDate) {
    if (out.length >= MAX_DATE_RANGE_DAYS) {
      throw new RangeError(
        `Date range ${startDate}..${endDate} exceeds ${MAX_DATE_RANGE_DAYS} days`,
      );
    }
    out.push(cursor);
    cursor = nextLocalDate(cursor);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Count how many of the Daily 9 are complete for a given day's states. */
export function countDone(goalStates: GoalStates | undefined): number {
  if (!goalStates) return 0;
  let done = 0;
  for (const goal of DAILY_9) {
    if (isGoalDone(goal, goalStates[goal.key])) done += 1;
  }
  return done;
}

/** Classify a day by how many goals were completed. */
export function dayClass(doneCount: number, rules: ScoringRules = DEFAULT_SCORING_RULES): DayClass {
  if (doneCount >= rules.goalCount) return 'perfect';
  if (doneCount >= rules.activeThreshold) return 'active';
  if (doneCount >= 1) return 'some';
  return 'nothing';
}

/**
 * Score a single day's goal states — the streak-independent part (base +
 * perfect bonus). Streak bonus is layered on by `scoreCompetition`, which is
 * the only place that has the cross-day context to compute it.
 */
export function scoreDay(
  goalStates: GoalStates | undefined,
  rules: ScoringRules = DEFAULT_SCORING_RULES,
): Omit<DayScoreResult, 'localDate' | 'streakBonus' | 'total'> {
  const doneCount = Math.min(countDone(goalStates), rules.goalCount);
  const isPerfect = doneCount >= rules.goalCount;
  const isActive = doneCount >= rules.activeThreshold;
  const base = doneCount; // 1 pt/goal, already capped at goalCount above.
  const perfectBonus = isPerfect ? rules.perfectBonus : 0;
  return {
    doneCount,
    base,
    perfectBonus,
    dayClass: dayClass(doneCount, rules),
    isActive,
    isPerfect,
  };
}

/** Input for {@link scoreCompetition}. */
export interface ScoreCompetitionInput {
  /** Competition start, `'YYYY-MM-DD'` (a player's join date if joined late). */
  startDate: string;
  /** Score through this day inclusive (usually the player's local today). */
  asOf: string;
  /** Logged goal states keyed by local date. Missing dates score as 0 done. */
  logsByDate: Record<string, GoalStates>;
  /** Scoring contract; defaults to {@link DEFAULT_SCORING_RULES}. */
  rules?: ScoringRules;
}

/**
 * Score a player across the full `startDate..asOf` window.
 *
 * CORRECTNESS: this walks EVERY calendar day in the range — not just the days
 * present in `logsByDate` — so that a missing (unlogged) day is scored as 0
 * done and correctly breaks the streak. Iterating only the sparse logged days
 * would never see the gap and would over-credit streaks.
 *
 * The streak is a run of consecutive PERFECT days (all 9). Once that run
 * reaches `streakThreshold` (3 in v1), each perfect day from that point on
 * earns a flat `streakBonus` (+2); days 1 and 2 of the run earn none, and any
 * non-perfect day (including an unlogged one) resets the run to 0.
 */
export function scoreCompetition(input: ScoreCompetitionInput): StandingResult {
  const rules = input.rules ?? DEFAULT_SCORING_RULES;
  const dates = localDateRange(input.startDate, input.asOf);

  const days: DayScoreResult[] = [];
  let totalScore = 0;
  let perfectDays = 0;
  let activeDays = 0;
  let currentStreak = 0; // consecutive perfect days
  let longestStreak = 0;

  for (const localDate of dates) {
    const day = scoreDay(input.logsByDate[localDate], rules);

    if (day.isPerfect) {
      currentStreak += 1;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }

    // Flat streak bonus once a perfect run has reached the threshold.
    const streakBonus = currentStreak >= rules.streakThreshold ? rules.streakBonus : 0;
    const total = day.base + day.perfectBonus + streakBonus;

    if (day.isPerfect) perfectDays += 1;
    if (day.isActive) activeDays += 1;
    totalScore += total;

    days.push({ localDate, ...day, streakBonus, total });
  }

  return { totalScore, perfectDays, longestStreak, activeDays, days };
}
