import { useState } from 'react';
import { DayScore, GoalRow, Stepper, StreakFlame } from '../components';
import { DAILY_9, GOAL_COUNT, isGoalDone } from '../lib/goals';
import { SAMPLE_YOU, SAMPLE_TODAY_STATE } from '../lib/sampleData';
import type { GoalStates } from '../types';
import './TodayScreen.css';

const PERFECT_BONUS = 3;

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Today — the daily check-in. The home screen and 80% of the product.
 *
 * Phase 0 scaffold: state is local and seeded from sample data; there is no
 * persistence or real scoring yet. Points here are just base + perfect-day
 * bonus for display — the real scoring engine (streaks, active days, grace,
 * per-competition snapshot) arrives in Phase 2.
 */
export function TodayScreen() {
  const [state, setState] = useState<GoalStates>(SAMPLE_TODAY_STATE);

  const doneCount = DAILY_9.filter((g) => isGoalDone(g, state[g.key])).length;
  const perfect = doneCount === GOAL_COUNT;
  const points = doneCount + (perfect ? PERFECT_BONUS : 0);

  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const toggle = (key: string) => setState((s) => ({ ...s, [key]: !s[key] }));
  const setCount = (key: string, value: number) => setState((s) => ({ ...s, [key]: value }));

  return (
    <div>
      <header className="today__header">
        <div>
          <div className="today__greeting">{greeting(now.getHours())}, {SAMPLE_YOU.name}</div>
          <div className="today__date">{dateLabel}</div>
        </div>
        <StreakFlame count={SAMPLE_YOU.streak} size="md" />
      </header>

      <div className="today__hero">
        <DayScore done={doneCount} total={GOAL_COUNT} points={points} size={172} thickness={15} />
        <div className={`today__hero-caption${perfect ? ' today__hero-caption--perfect' : ''}`}>
          {perfect ? (
            <>
              <i className="ph-fill ph-confetti" style={{ fontSize: 22 }} aria-hidden="true" />
              Perfect day — you did it!
            </>
          ) : (
            `${GOAL_COUNT - doneCount} to go for a perfect day`
          )}
        </div>
      </div>

      <div className="today__grace">
        <i className="ph-bold ph-clock-countdown" aria-hidden="true" />
        Yesterday is still editable until midnight
      </div>

      <div className="today__goals">
        {DAILY_9.map((g) => {
          if (g.logType === 'counter') {
            const value = typeof state[g.key] === 'number' ? (state[g.key] as number) : 0;
            return (
              <GoalRow
                key={g.key}
                name={g.name}
                target={g.target}
                icon={g.icon}
                color={g.color}
                done={isGoalDone(g, value)}
                interactive={false}
              >
                <Stepper
                  value={value}
                  max={g.counterMax}
                  color={g.color}
                  onChange={(v) => setCount(g.key, v)}
                />
              </GoalRow>
            );
          }
          return (
            <GoalRow
              key={g.key}
              name={g.name}
              target={g.target}
              icon={g.icon}
              color={g.color}
              done={state[g.key] === true}
              onToggle={() => toggle(g.key)}
            />
          );
        })}
      </div>
    </div>
  );
}
