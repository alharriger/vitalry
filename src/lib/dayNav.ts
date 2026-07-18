/**
 * Pure day-navigation math for the reusable day-browser. No React, no Supabase —
 * just local-date string logic layered on the scoring engine's date helpers.
 *
 * Phase 2.3 CAPS stepping to the grace window (yesterday..today). Phase 2.4 will
 * lower the floor to the competition's `start_date` so the whole run is
 * browsable; keep new callers going through these helpers so that change is a
 * one-line edit here.
 */

import { localDateRange, previousLocalDate } from './scoring';

/** The min/max day the viewer can step to. */
export interface StepBounds {
  /** Earliest reachable day. */
  min: string;
  /** Latest reachable day (never the future). */
  max: string;
}

/**
 * The reachable step window for Phase 2.3: `yesterday..today`, floored at the
 * competition start (you can't step before day 1) and never into the future.
 * If the competition started today, yesterday isn't reachable and the window
 * collapses to today alone.
 */
export function stepBounds(startDate: string, today: string): StepBounds {
  const max = today >= startDate ? today : startDate;
  const yesterday = previousLocalDate(max);
  const min = yesterday >= startDate ? yesterday : max;
  return { min, max };
}

/**
 * 1-based day number of `date` within the competition (day 1 = `startDate`).
 * Returns 0 for a day before the competition started.
 */
export function dayNumber(startDate: string, date: string): number {
  if (date < startDate) return 0;
  return localDateRange(startDate, date).length;
}

/**
 * Whether `date` is editable under the grace window: the player's local today
 * or yesterday. Every other day is read-only. Mirrors the server-side
 * `enforce_grace_window()` trigger so client and DB never disagree.
 */
export function isEditableDay(today: string, date: string): boolean {
  return date === today || date === previousLocalDate(today);
}
