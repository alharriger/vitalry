import type { GoalStates } from '../types';

/**
 * Sample data for the Phase 0 scaffold ONLY. Ported from the design handoff
 * (app-reference/data.js) so the screens render something realistic before the
 * Supabase backend exists (Phase 1+). Delete once screens read live data.
 */

export interface SamplePlayer {
  id: string;
  name: string;
  points: number;
  doneToday: number;
  streak: number;
  perfectDays: number;
  /** Avatar color override (a `--avatar-*` token); omit to auto-derive. */
  color?: string;
  /** Marks the current viewer. */
  you?: boolean;
}

export const SAMPLE_COMPETITION = {
  name: 'Harriger Summer Streak',
  group: 'Harriger Family',
  daysTotal: 14,
  daysLeft: 4,
  day: 10,
  prize: 'Loser hosts Thanksgiving',
};

export const SAMPLE_PLAYERS: SamplePlayer[] = [
  { id: 'amber', name: 'Amber',     points: 182, doneToday: 8, streak: 11, perfectDays: 6, color: 'var(--avatar-clay)' },
  { id: 'jo',    name: 'Sister Jo', points: 168, doneToday: 9, streak: 11, perfectDays: 4, color: 'var(--avatar-plum)' },
  { id: 'mom',   name: 'Mom',       points: 151, doneToday: 6, streak: 4,  perfectDays: 2, color: 'var(--avatar-mulberry)' },
  { id: 'dad',   name: 'Dad',       points: 140, doneToday: 6, streak: 3,  perfectDays: 1, color: 'var(--avatar-denim)', you: true },
  { id: 'ty',    name: 'Cousin Ty', points: 96,  doneToday: 4, streak: 0,  perfectDays: 0, color: 'var(--avatar-ochre)' },
];

/** The current viewer ("Dad") — the player whose check-in Today shows. */
export const SAMPLE_YOU = SAMPLE_PLAYERS.find((p) => p.you)!;

/** "Dad"'s initial Today check-in state, keyed by goal `key`. */
export const SAMPLE_TODAY_STATE: GoalStates = {
  rainbow: 3,
  protein: true,
  fiber: false,
  move: true,
  sweat: false,
  air: true,
  water: 5,
  sleep: true,
  mind: false,
};
