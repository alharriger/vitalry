import { describe, it, expect } from 'vitest';
import { dayNumber, isEditableDay, stepBounds } from './dayNav';

describe('stepBounds (Phase 2.4 — reaches the whole run)', () => {
  it('spans start_date..today mid-competition', () => {
    // Every past day is now reachable, floored at the competition start.
    expect(stepBounds('2026-07-01', '2026-07-18')).toEqual({
      min: '2026-07-01',
      max: '2026-07-18',
    });
  });

  it('collapses to today alone when the competition started today', () => {
    expect(stepBounds('2026-07-18', '2026-07-18')).toEqual({
      min: '2026-07-18',
      max: '2026-07-18',
    });
  });

  it('floors at start_date, not yesterday, when today is the second day', () => {
    expect(stepBounds('2026-07-17', '2026-07-18')).toEqual({
      min: '2026-07-17',
      max: '2026-07-18',
    });
  });

  it('handles a month boundary across the span', () => {
    expect(stepBounds('2026-06-15', '2026-07-01')).toEqual({
      min: '2026-06-15',
      max: '2026-07-01',
    });
  });

  it('does not step before the start even when today precedes it', () => {
    // Defensive: a not-yet-started competition clamps to start_date.
    expect(stepBounds('2026-07-20', '2026-07-18')).toEqual({
      min: '2026-07-20',
      max: '2026-07-20',
    });
  });
});

describe('dayNumber', () => {
  it('is 1-based from the start date', () => {
    expect(dayNumber('2026-07-16', '2026-07-16')).toBe(1);
    expect(dayNumber('2026-07-16', '2026-07-18')).toBe(3);
  });

  it('spans a month boundary correctly', () => {
    expect(dayNumber('2026-06-29', '2026-07-02')).toBe(4); // 29,30,1,2
  });

  it('returns 0 for a day before the competition', () => {
    expect(dayNumber('2026-07-16', '2026-07-15')).toBe(0);
  });
});

describe('isEditableDay', () => {
  const today = '2026-07-18';
  it('today and yesterday are editable', () => {
    expect(isEditableDay(today, '2026-07-18')).toBe(true);
    expect(isEditableDay(today, '2026-07-17')).toBe(true);
  });
  it('two days ago and the future are not editable', () => {
    expect(isEditableDay(today, '2026-07-16')).toBe(false);
    expect(isEditableDay(today, '2026-07-19')).toBe(false);
  });
  it('handles yesterday across a month boundary', () => {
    expect(isEditableDay('2026-07-01', '2026-06-30')).toBe(true);
  });
});
