import { describe, it, expect } from 'vitest';
import type { GoalStates } from '../types';
import {
  DEFAULT_SCORING_RULES,
  countDone,
  dayClass,
  scoreDay,
  scoreCompetition,
  currentPerfectStreak,
  localDateToday,
  previousLocalDate,
  nextLocalDate,
  localDateRange,
} from './scoring';

// ---------------------------------------------------------------------------
// Test helpers — build a day's goal states from the goal keys.
// ---------------------------------------------------------------------------

/** The Daily 9 keys, ordered as in goals.ts. */
const KEYS = ['rainbow', 'protein', 'fiber', 'move', 'sweat', 'air', 'water', 'sleep', 'mind'];

/**
 * Make goal states with the first `n` goals completed. Counter goals (rainbow,
 * water) are set to their target so `isGoalDone` counts them as done.
 */
function nDone(n: number): GoalStates {
  const states: GoalStates = {};
  for (let i = 0; i < n; i += 1) {
    const key = KEYS[i];
    if (key === 'rainbow') states[key] = 5;
    else if (key === 'water') states[key] = 8;
    else states[key] = true;
  }
  return states;
}

/** A full perfect day. */
const perfect = () => nDone(9);

// ---------------------------------------------------------------------------
// countDone — reused isGoalDone, incl. counter goals
// ---------------------------------------------------------------------------

describe('countDone', () => {
  it('counts check goals that are true', () => {
    expect(countDone({ protein: true, fiber: true })).toBe(2);
  });

  it('undefined / empty states = 0 done', () => {
    expect(countDone(undefined)).toBe(0);
    expect(countDone({})).toBe(0);
  });

  it('counter goals only count at or above their target', () => {
    expect(countDone({ rainbow: 4, water: 7 })).toBe(0); // both below target
    expect(countDone({ rainbow: 5, water: 8 })).toBe(2); // both at target
    expect(countDone({ rainbow: 6, water: 9 })).toBe(2); // both above target
  });

  it('a full day counts all 9', () => {
    expect(countDone(perfect())).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// dayClass
// ---------------------------------------------------------------------------

describe('dayClass', () => {
  it('maps all four buckets', () => {
    expect(dayClass(9)).toBe('perfect');
    expect(dayClass(6)).toBe('active');
    expect(dayClass(5)).toBe('some');
    expect(dayClass(1)).toBe('some');
    expect(dayClass(0)).toBe('nothing');
  });
});

// ---------------------------------------------------------------------------
// scoreDay — base, perfect bonus, active threshold, max daily
// ---------------------------------------------------------------------------

describe('scoreDay', () => {
  it('active threshold is exactly 6/9', () => {
    expect(scoreDay(nDone(5)).isActive).toBe(false);
    expect(scoreDay(nDone(6)).isActive).toBe(true);
  });

  it('base is 1 pt per goal', () => {
    expect(scoreDay(nDone(4)).base).toBe(4);
    expect(scoreDay(nDone(7)).base).toBe(7);
  });

  it('perfect day (all 9) earns the +3 bonus', () => {
    const d = scoreDay(perfect());
    expect(d.isPerfect).toBe(true);
    expect(d.doneCount).toBe(9);
    expect(d.base).toBe(9);
    expect(d.perfectBonus).toBe(3);
  });

  it('a non-perfect day earns no perfect bonus', () => {
    expect(scoreDay(nDone(8)).perfectBonus).toBe(0);
  });

  it('an empty day scores nothing', () => {
    const d = scoreDay(undefined);
    expect(d).toMatchObject({ doneCount: 0, base: 0, perfectBonus: 0, isActive: false, dayClass: 'nothing' });
  });
});

// ---------------------------------------------------------------------------
// scoreCompetition — streak accrual, cap, reset, gaps, max daily, join-late
// ---------------------------------------------------------------------------

describe('scoreCompetition — streaks (consecutive perfect days, flat +2 from day 3)', () => {
  it('no streak bonus until the 3rd consecutive perfect day', () => {
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-03',
      logsByDate: {
        '2026-07-01': perfect(), // run 1 → +0
        '2026-07-02': perfect(), // run 2 → +0
        '2026-07-03': perfect(), // run 3 → +2
      },
    });
    expect(r.days.map((d) => d.streakBonus)).toEqual([0, 0, 2]);
  });

  it('the +2 is flat and applies to every perfect day from the 3rd on (no ramp, no cap)', () => {
    const logs: Record<string, GoalStates> = {};
    for (let i = 1; i <= 8; i += 1) logs[`2026-07-0${i}`] = perfect();
    const r = scoreCompetition({ startDate: '2026-07-01', asOf: '2026-07-08', logsByDate: logs });
    expect(r.days.map((d) => d.streakBonus)).toEqual([0, 0, 2, 2, 2, 2, 2, 2]);
  });

  it('an active-but-not-perfect day (6–8/9) does NOT extend the streak', () => {
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-04',
      logsByDate: {
        '2026-07-01': perfect(), // run 1
        '2026-07-02': perfect(), // run 2
        '2026-07-03': nDone(8), // active but not perfect → resets to 0
        '2026-07-04': perfect(), // run 1 again → no bonus
      },
    });
    expect(r.days.map((d) => d.streakBonus)).toEqual([0, 0, 0, 0]);
    // Day 3 still counts as active for the calendar, just not for the streak.
    expect(r.days[2].dayClass).toBe('active');
    expect(r.days[2].isActive).toBe(true);
    expect(r.days[2].isPerfect).toBe(false);
  });

  it('a broken-then-rebuilt streak must reach 3 perfect days again to pay out', () => {
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-08',
      logsByDate: {
        '2026-07-01': perfect(), // 1 → +0
        '2026-07-02': perfect(), // 2 → +0
        '2026-07-03': perfect(), // 3 → +2
        '2026-07-04': nDone(5), // reset
        '2026-07-05': perfect(), // 1 → +0
        '2026-07-06': perfect(), // 2 → +0
        '2026-07-07': perfect(), // 3 → +2
        '2026-07-08': perfect(), // 4 → +2
      },
    });
    expect(r.days.map((d) => d.streakBonus)).toEqual([0, 0, 2, 0, 0, 0, 2, 2]);
  });

  it('a fully-missed interior day (no log at all) resets the streak', () => {
    // Note 07-03 is absent from logsByDate — the walk must still visit it.
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-05',
      logsByDate: {
        '2026-07-01': perfect(),
        '2026-07-02': perfect(),
        // 07-03 missing → 0 done → resets
        '2026-07-04': perfect(),
        '2026-07-05': perfect(),
      },
    });
    expect(r.days.map((d) => d.doneCount)).toEqual([9, 9, 0, 9, 9]);
    expect(r.days.map((d) => d.streakBonus)).toEqual([0, 0, 0, 0, 0]);
    expect(r.days[2].dayClass).toBe('nothing');
  });

  it('longestStreak reflects the longest run of perfect days, not the current one', () => {
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-06',
      logsByDate: {
        '2026-07-01': perfect(),
        '2026-07-02': perfect(),
        '2026-07-03': perfect(), // run of 3
        '2026-07-04': nDone(2), // reset
        '2026-07-05': perfect(), // run of 1
        '2026-07-06': nDone(2), // reset; current streak ends at 0
      },
    });
    expect(r.longestStreak).toBe(3);
  });
});

describe('scoreCompetition — totals & tie-breakers', () => {
  it('max daily score is 14 (9 base + 3 perfect + 2 streak)', () => {
    const logs: Record<string, GoalStates> = {};
    for (let i = 1; i <= 3; i += 1) logs[`2026-07-0${i}`] = perfect();
    const r = scoreCompetition({ startDate: '2026-07-01', asOf: '2026-07-03', logsByDate: logs });
    const day3 = r.days[2];
    expect(day3.base).toBe(9);
    expect(day3.perfectBonus).toBe(3);
    expect(day3.streakBonus).toBe(2);
    expect(day3.total).toBe(14);
  });

  it('counts perfect and active days (active is a stat, not a streak driver)', () => {
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-03',
      logsByDate: {
        '2026-07-01': perfect(), // perfect + active
        '2026-07-02': nDone(6), // active only
        '2026-07-03': nDone(3), // neither
      },
    });
    expect(r.perfectDays).toBe(1);
    expect(r.activeDays).toBe(2);
  });

  it('sums totalScore across the window', () => {
    // 3 perfect days: 12, 12, 12+2 → 38.
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-03',
      logsByDate: { '2026-07-01': perfect(), '2026-07-02': perfect(), '2026-07-03': perfect() },
    });
    expect(r.totalScore).toBe(38);
  });

  it('join-in-progress: a shorter window only scores its own days', () => {
    // Player joined 07-10; the walk starts there, so earlier gaps do not exist.
    const r = scoreCompetition({
      startDate: '2026-07-10',
      asOf: '2026-07-12',
      logsByDate: { '2026-07-10': perfect(), '2026-07-11': perfect(), '2026-07-12': perfect() },
    });
    expect(r.days).toHaveLength(3);
    expect(r.days.map((d) => d.streakBonus)).toEqual([0, 0, 2]);
  });

  it('a single-day window (first day of a competition) works', () => {
    const r = scoreCompetition({
      startDate: '2026-07-01',
      asOf: '2026-07-01',
      logsByDate: { '2026-07-01': perfect() },
    });
    expect(r.days).toHaveLength(1);
    expect(r.days[0].streakBonus).toBe(0);
    expect(r.totalScore).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// Local-date helpers — no UTC off-by-one
// ---------------------------------------------------------------------------

describe('previousLocalDate / nextLocalDate', () => {
  it('steps within a month', () => {
    expect(previousLocalDate('2026-07-17')).toBe('2026-07-16');
    expect(nextLocalDate('2026-07-17')).toBe('2026-07-18');
  });

  it('crosses month boundaries', () => {
    expect(previousLocalDate('2026-07-01')).toBe('2026-06-30');
    expect(nextLocalDate('2026-06-30')).toBe('2026-07-01');
  });

  it('crosses year boundaries', () => {
    expect(previousLocalDate('2026-01-01')).toBe('2025-12-31');
    expect(nextLocalDate('2025-12-31')).toBe('2026-01-01');
  });

  it('handles leap-year February', () => {
    expect(nextLocalDate('2028-02-28')).toBe('2028-02-29'); // 2028 is a leap year
    expect(nextLocalDate('2028-02-29')).toBe('2028-03-01');
    expect(previousLocalDate('2028-03-01')).toBe('2028-02-29');
  });

  it('handles non-leap February', () => {
    expect(nextLocalDate('2026-02-28')).toBe('2026-03-01'); // 2026 is not a leap year
    expect(previousLocalDate('2026-03-01')).toBe('2026-02-28');
  });

  it('rejects malformed dates', () => {
    expect(() => previousLocalDate('2026-7-1')).toThrow();
    expect(() => nextLocalDate('not-a-date')).toThrow();
  });

  it('rejects well-formed but non-existent calendar dates', () => {
    expect(() => nextLocalDate('2026-13-01')).toThrow(); // month 13
    expect(() => nextLocalDate('2026-00-10')).toThrow(); // month 0
    expect(() => nextLocalDate('2026-02-30')).toThrow(); // Feb 30
    expect(() => nextLocalDate('2026-02-29')).toThrow(); // 2026 not a leap year
    expect(() => nextLocalDate('2026-04-31')).toThrow(); // April has 30
    expect(() => previousLocalDate('2026-07-00')).toThrow(); // day 0
  });

  it('zero-pads years below 1000 so ordering stays correct', () => {
    expect(nextLocalDate('0999-12-31')).toBe('1000-01-01');
    expect(previousLocalDate('1000-01-01')).toBe('0999-12-31');
  });
});

describe('localDateToday — resolves in the player local zone, no UTC shift', () => {
  it('returns the correct calendar date near midnight across zones', () => {
    // 2026-07-17T02:30:00Z. In UTC and Berlin it is the 17th; in Los Angeles
    // (UTC-7 in July) it is still 19:30 on the 16th. A naive toISOString would
    // wrongly report the 17th for LA — this asserts we resolve per zone.
    const instant = new Date('2026-07-17T02:30:00Z');
    expect(localDateToday('UTC', instant)).toBe('2026-07-17');
    expect(localDateToday('Europe/Berlin', instant)).toBe('2026-07-17');
    expect(localDateToday('America/Los_Angeles', instant)).toBe('2026-07-16');
  });

  it('handles a zone ahead of UTC rolling into the next day', () => {
    // 22:30Z on the 16th is already 07:30 on the 17th in Tokyo (UTC+9).
    const instant = new Date('2026-07-16T22:30:00Z');
    expect(localDateToday('UTC', instant)).toBe('2026-07-16');
    expect(localDateToday('Asia/Tokyo', instant)).toBe('2026-07-17');
  });
});

describe('localDateRange', () => {
  it('is inclusive of both ends', () => {
    expect(localDateRange('2026-07-01', '2026-07-03')).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ]);
  });

  it('a single-day range returns that day', () => {
    expect(localDateRange('2026-07-01', '2026-07-01')).toEqual(['2026-07-01']);
  });

  it('an inverted range is empty', () => {
    expect(localDateRange('2026-07-03', '2026-07-01')).toEqual([]);
  });

  it('spans a month boundary', () => {
    expect(localDateRange('2026-06-29', '2026-07-02')).toEqual([
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
    ]);
  });

  it('throws on an absurdly large span instead of hanging (DoS guard)', () => {
    // Well-formed dates, but a ~decade+ span exceeds the range cap.
    expect(() => localDateRange('2000-01-01', '2099-12-31')).toThrow(/exceeds/);
  });

  it('rejects an invalid endpoint before walking', () => {
    expect(() => localDateRange('2026-01-01', '2026-13-01')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// currentPerfectStreak — the live "flame" run ending at asOf
// ---------------------------------------------------------------------------

describe('currentPerfectStreak', () => {
  // Score a fixed window so we exercise the real DayScoreResult shape.
  function daysFor(logsByDate: Record<string, GoalStates>, start: string, asOf: string) {
    return scoreCompetition({ startDate: start, asOf, logsByDate }).days;
  }

  it('counts a trailing run of perfect days ending at asOf', () => {
    const days = daysFor(
      { '2026-01-01': perfect(), '2026-01-02': perfect(), '2026-01-03': perfect() },
      '2026-01-01',
      '2026-01-03',
    );
    expect(currentPerfectStreak(days, '2026-01-03')).toBe(3);
  });

  it('does NOT zero a live streak when the final day is in progress (not yet perfect)', () => {
    // Two perfect days, then an incomplete "today" — the run through yesterday
    // still stands (the day isn't lost until it ends).
    const days = daysFor(
      { '2026-01-01': perfect(), '2026-01-02': perfect(), '2026-01-03': nDone(4) },
      '2026-01-01',
      '2026-01-03',
    );
    expect(currentPerfectStreak(days, '2026-01-03')).toBe(2);
  });

  it('a perfect final day extends the run', () => {
    const days = daysFor(
      { '2026-01-01': perfect(), '2026-01-02': perfect(), '2026-01-03': perfect() },
      '2026-01-01',
      '2026-01-03',
    );
    expect(currentPerfectStreak(days, '2026-01-03')).toBe(3);
  });

  it('breaks on an earlier non-perfect day', () => {
    const days = daysFor(
      { '2026-01-01': perfect(), '2026-01-02': nDone(6), '2026-01-03': perfect() },
      '2026-01-01',
      '2026-01-03',
    );
    // Only the trailing perfect day counts; day 2 (active, not perfect) breaks it.
    expect(currentPerfectStreak(days, '2026-01-03')).toBe(1);
  });

  it('is 0 with no trailing perfect day', () => {
    const days = daysFor({ '2026-01-01': nDone(6) }, '2026-01-01', '2026-01-01');
    expect(currentPerfectStreak(days, '2026-01-01')).toBe(0);
    expect(currentPerfectStreak([], '2026-01-01')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Contract snapshot
// ---------------------------------------------------------------------------

describe('DEFAULT_SCORING_RULES', () => {
  it('is the v1 contract (self-describing snapshot for competitions.scoring_rules)', () => {
    expect(DEFAULT_SCORING_RULES).toEqual({
      goalCount: 9,
      activeThreshold: 6,
      perfectBonus: 3,
      streakThreshold: 3,
      streakBonus: 2,
    });
  });
});
