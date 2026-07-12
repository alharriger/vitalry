import type { Goal } from '../types';

/**
 * The fixed Daily 9 (v1). Same list for everyone; no configuration.
 * In v1 this lives in code for the scaffold; Phase 1 seeds it into the
 * `goals` table (goals are rows-not-code so v2 can add custom goals).
 *
 * Icons and colors are ported from the design handoff sample data. Colors
 * reference `--goal-*` tokens so they never drift from the design system.
 */
export const DAILY_9: Goal[] = [
  { key: 'rainbow', name: 'Eat the rainbow', target: '5 produce colors',        icon: 'ph-bold ph-rainbow',            color: 'var(--goal-rainbow)', logType: 'counter', counterMax: 5 },
  { key: 'protein', name: 'Protein',         target: 'Hit your protein goal',    icon: 'ph-bold ph-egg',                color: 'var(--goal-protein)', logType: 'check' },
  { key: 'fiber',   name: 'Fiber',           target: 'Hit your fiber goal',      icon: 'ph-bold ph-grains',             color: 'var(--goal-fiber)',   logType: 'check' },
  { key: 'move',    name: 'Move',            target: '30 min moving — any kind', icon: 'ph-bold ph-person-simple-walk', color: 'var(--goal-move)',    logType: 'check' },
  { key: 'sweat',   name: 'Sweat or strength', target: '20+ min workout',        icon: 'ph-bold ph-barbell',            color: 'var(--goal-sweat)',   logType: 'check' },
  { key: 'air',     name: 'Fresh air',       target: '20 min outside',           icon: 'ph-bold ph-sun',                color: 'var(--goal-air)',     logType: 'check' },
  { key: 'water',   name: 'Water',           target: '8 cups',                   icon: 'ph-bold ph-drop',               color: 'var(--goal-water)',   logType: 'counter', counterMax: 8 },
  { key: 'sleep',   name: 'Sleep',           target: '7+ hours',                 icon: 'ph-bold ph-moon',               color: 'var(--goal-sleep)',   logType: 'check' },
  { key: 'mind',    name: 'Mind',            target: 'Read, meditate, or journal', icon: 'ph-bold ph-brain',            color: 'var(--goal-mind)',    logType: 'check' },
];

/** Number of goals in a day (9 in v1). */
export const GOAL_COUNT = DAILY_9.length;

/** Whether a single goal is complete given its logged state. */
export function isGoalDone(goal: Goal, state: boolean | number | undefined): boolean {
  if (goal.logType === 'counter') {
    return typeof state === 'number' && state >= (goal.counterMax ?? Infinity);
  }
  return state === true;
}
