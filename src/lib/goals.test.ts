import { describe, it, expect } from 'vitest';
import { DAILY_9, GOAL_COUNT, isGoalDone } from './goals';
import type { Goal } from '../types';

const check: Goal = { key: 'move', name: 'Move', target: '', icon: '', color: '', logType: 'check' };
const water: Goal = { key: 'water', name: 'Water', target: '', icon: '', color: '', logType: 'counter', counterMax: 8 };

describe('DAILY_9', () => {
  it('is the fixed list of 9 goals', () => {
    expect(GOAL_COUNT).toBe(9);
    expect(DAILY_9).toHaveLength(9);
  });

  it('has unique keys', () => {
    const keys = new Set(DAILY_9.map((g) => g.key));
    expect(keys.size).toBe(9);
  });

  it('gives every counter goal a counterMax', () => {
    for (const g of DAILY_9.filter((g) => g.logType === 'counter')) {
      expect(g.counterMax).toBeGreaterThan(0);
    }
  });
});

describe('isGoalDone', () => {
  it('check goal: done only when true', () => {
    expect(isGoalDone(check, true)).toBe(true);
    expect(isGoalDone(check, false)).toBe(false);
    expect(isGoalDone(check, undefined)).toBe(false);
  });

  it('counter goal: done only at or above counterMax', () => {
    expect(isGoalDone(water, 7)).toBe(false);
    expect(isGoalDone(water, 8)).toBe(true);
    expect(isGoalDone(water, 9)).toBe(true);
  });

  it('counter goal: non-number state is not done', () => {
    expect(isGoalDone(water, undefined)).toBe(false);
    expect(isGoalDone(water, true)).toBe(false);
  });
});
