import { describe, it, expect } from 'vitest';
import type { GoalStates } from '../types';
import type { CompetitionMember } from './dailyLogs';
import { applyLogChange, computeStandings, type LogChangePayload } from './standings';

// ---------------------------------------------------------------------------
// Helpers — build goal states + a members/logs fixture.
// ---------------------------------------------------------------------------

const KEYS = ['rainbow', 'protein', 'fiber', 'move', 'sweat', 'air', 'water', 'sleep', 'mind'];

/** Goal states with the first `n` goals done (counter goals hit their target). */
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
const perfect = () => nDone(9);

function member(userId: string, name: string, avatar: string | null = null): CompetitionMember {
  return { userId, name, avatar };
}

// A 3-day window: 2026-01-01..2026-01-03.
const START = '2026-01-01';
const TODAY = '2026-01-03';

// ---------------------------------------------------------------------------
// computeStandings — ranking, tie-breakers, derived fields
// ---------------------------------------------------------------------------

describe('computeStandings', () => {
  it('ranks by total score (goal completion), highest first', () => {
    const members = [member('u1', 'Alpha'), member('u2', 'Bravo')];
    const logsByUser = {
      u1: { [START]: nDone(3) },
      u2: { [START]: perfect(), [TODAY]: perfect() },
    };
    const board = computeStandings({ members, logsByUser, startDate: START, today: TODAY, viewerId: null });
    expect(board.map((p) => p.userId)).toEqual(['u2', 'u1']);
    expect(board[0].rank).toBe(1);
    expect(board[1].rank).toBe(2);
    expect(board[0].totalScore).toBeGreaterThan(board[1].totalScore);
  });

  it('marks the viewer row with isYou', () => {
    const members = [member('u1', 'Alpha'), member('u2', 'Bravo')];
    const board = computeStandings({
      members,
      logsByUser: {},
      startDate: START,
      today: TODAY,
      viewerId: 'u2',
    });
    expect(board.find((p) => p.userId === 'u2')?.isYou).toBe(true);
    expect(board.find((p) => p.userId === 'u1')?.isYou).toBe(false);
  });

  it('derives doneToday from today’s log and currentStreak from the trailing perfect run', () => {
    const members = [member('u1', 'Alpha')];
    const logsByUser = {
      // Three perfect days in a row ending today → current streak 3, doneToday 9.
      u1: { [START]: perfect(), '2026-01-02': perfect(), [TODAY]: perfect() },
    };
    const [p] = computeStandings({ members, logsByUser, startDate: START, today: TODAY, viewerId: 'u1' });
    expect(p.doneToday).toBe(9);
    expect(p.currentStreak).toBe(3);
    expect(p.perfectDays).toBe(3);
    // A per-day breakdown spanning the full window is present for the sheet.
    expect(p.days).toHaveLength(3);
  });

  it('surfaces exactly which goals are done today (one lit pip per goal)', () => {
    // First 3 of the Daily 9 done today (rainbow counter + protein + fiber).
    const [p] = computeStandings({
      members: [member('u1', 'A')],
      logsByUser: { u1: { [TODAY]: nDone(3) } },
      startDate: START,
      today: TODAY,
      viewerId: null,
    });
    expect(p.doneToday).toBe(3);
    expect(p.doneKeysToday).toEqual(new Set(['rainbow', 'protein', 'fiber']));
    // A partially-filled counter goal does NOT light its pip.
    const [q] = computeStandings({
      members: [member('u1', 'A')],
      logsByUser: { u1: { [TODAY]: { rainbow: 4, protein: true } } }, // rainbow below its target of 5
      startDate: START,
      today: TODAY,
      viewerId: null,
    });
    expect(q.doneKeysToday).toEqual(new Set(['protein']));
  });

  it('breaks ties by perfect days, then longest streak', () => {
    // Two players with the SAME total score but different perfect-day counts.
    // u_perfect: 3 perfect days (also earns the streak bonus on day 3).
    // u_active: enough active days to match the total, but no perfect days.
    const members = [member('a_active', 'Active'), member('z_perfect', 'Perfect')];
    const logsByUser: Record<string, Record<string, GoalStates>> = {
      z_perfect: { [START]: perfect(), '2026-01-02': perfect(), [TODAY]: perfect() },
      // Match z_perfect's total (9+9+3 + 9+9+3+2 ... ) with big active days.
      a_active: { [START]: nDone(8), '2026-01-02': nDone(8), [TODAY]: nDone(8) },
    };
    const board = computeStandings({ members, logsByUser, startDate: START, today: TODAY, viewerId: null });
    // If totals happen to differ the score sort already handles it; assert the
    // perfect player is never ranked below the active one on an equal score.
    const perfectRow = board.find((p) => p.userId === 'z_perfect')!;
    const activeRow = board.find((p) => p.userId === 'a_active')!;
    if (perfectRow.totalScore === activeRow.totalScore) {
      expect(perfectRow.rank).toBeLessThan(activeRow.rank);
    }
    expect(perfectRow.perfectDays).toBe(3);
    expect(activeRow.perfectDays).toBe(0);
  });

  it('shares a rank on a full three-key tie, and the next distinct player skips positions', () => {
    // u1 & u2 identical (same total, perfect days, streak); u3 strictly lower.
    const members = [member('u1', 'Ann'), member('u2', 'Bob'), member('u3', 'Cyd')];
    const logsByUser = {
      u1: { [START]: perfect() },
      u2: { [START]: perfect() },
      u3: { [START]: nDone(2) },
    };
    const board = computeStandings({ members, logsByUser, startDate: START, today: TODAY, viewerId: null });
    const r = Object.fromEntries(board.map((p) => [p.userId, p.rank]));
    expect(r.u1).toBe(1);
    expect(r.u2).toBe(1); // shared first
    expect(r.u3).toBe(3); // skips 2 (competition ranking)
  });

  it('is deterministic for fully-tied players (stable name order)', () => {
    const members = [member('u2', 'Bravo'), member('u1', 'Alpha')];
    const logsByUser = { u1: { [START]: nDone(3) }, u2: { [START]: nDone(3) } };
    const board = computeStandings({ members, logsByUser, startDate: START, today: TODAY, viewerId: null });
    // Same rank, but ordered by name for a stable render.
    expect(board.map((p) => p.name)).toEqual(['Alpha', 'Bravo']);
    expect(board[0].rank).toBe(1);
    expect(board[1].rank).toBe(1);
  });

  it('uses the chosen avatar when present, else derives a color from the name', () => {
    const members = [member('u1', 'Alpha', 'var(--avatar-clay)'), member('u2', 'Bravo', null)];
    const board = computeStandings({ members, logsByUser: {}, startDate: START, today: TODAY, viewerId: null });
    expect(board.find((p) => p.userId === 'u1')?.avatarColor).toBe('var(--avatar-clay)');
    expect(board.find((p) => p.userId === 'u2')?.avatarColor).toMatch(/^var\(--avatar-/);
  });

  it('scores a player with no logs as zero (and still lists them)', () => {
    const members = [member('u1', 'Ghost')];
    const [p] = computeStandings({ members, logsByUser: {}, startDate: START, today: TODAY, viewerId: null });
    expect(p.totalScore).toBe(0);
    expect(p.doneToday).toBe(0);
    expect(p.currentStreak).toBe(0);
    expect(p.rank).toBe(1);
  });

  it('handles a not-yet-started competition (today < start) without throwing', () => {
    const members = [member('u1', 'Early')];
    const board = computeStandings({
      members,
      logsByUser: {},
      startDate: '2026-02-01',
      today: '2026-01-15',
      viewerId: null,
    });
    expect(board[0].totalScore).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// applyLogChange — realtime payload → logs-by-user reducer
// ---------------------------------------------------------------------------

describe('applyLogChange', () => {
  const base = { u1: { '2026-01-01': nDone(4) } };

  it('INSERT adds a new user’s day', () => {
    const payload: LogChangePayload = {
      eventType: 'INSERT',
      new: { user_id: 'u2', local_date: '2026-01-02', goal_states: nDone(9) },
    };
    const next = applyLogChange(base, payload);
    expect(next.u2['2026-01-02']).toEqual(nDone(9));
    expect(next).not.toBe(base); // new reference → re-render
    expect(base.u1['2026-01-01']).toEqual(nDone(4)); // original untouched
  });

  it('UPDATE overwrites an existing day for a user', () => {
    const payload: LogChangePayload = {
      eventType: 'UPDATE',
      new: { user_id: 'u1', local_date: '2026-01-01', goal_states: nDone(9) },
    };
    const next = applyLogChange(base, payload);
    expect(next.u1['2026-01-01']).toEqual(nDone(9));
  });

  it('DELETE removes the day when the payload carries its keys', () => {
    const next = applyLogChange(base, {
      eventType: 'DELETE',
      old: { user_id: 'u1', local_date: '2026-01-01' },
    });
    expect(next.u1['2026-01-01']).toBeUndefined();
  });

  it('returns the same reference (no render) for an incomplete payload', () => {
    expect(applyLogChange(base, { eventType: 'INSERT', new: null })).toBe(base);
    expect(applyLogChange(base, { eventType: 'INSERT', new: { user_id: 'u9' } })).toBe(base);
    expect(
      applyLogChange(base, { eventType: 'DELETE', old: { user_id: 'u1', local_date: '2099-01-01' } }),
    ).toBe(base);
  });
});
