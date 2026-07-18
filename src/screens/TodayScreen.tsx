import { Badge, Card, DateNav, DayScore, GoalRow, SaveIndicator, Stepper, StreakFlame } from '../components';
import { DAILY_9, GOAL_COUNT, isGoalDone } from '../lib/goals';
import { useTodayLog } from '../lib/useTodayLog';
import './TodayScreen.css';

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Friendly label for a `'YYYY-MM-DD'` local date, e.g. "Wednesday, Jul 22".
 *  Parsed at local noon so the calendar date can't drift across a tz offset. */
function dateLabel(localDate: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${localDate}T12:00:00`);
  return d.toLocaleDateString(undefined, opts ?? { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * Today — the daily check-in. The home screen and 80% of the product.
 *
 * Phase 2.3: the day-browser reaches today + yesterday, both editable within the
 * grace window. The DateNav steps between them (prev floored at yesterday, next
 * ceiled at today); the hero + goals reflect the viewed day; edits autosave to
 * `daily_logs` via the 2.1 engine. Read-only past days (2.4) and the month-sheet
 * picker (2.5) are still to come — until then no read-only day is reachable.
 */
export function TodayScreen() {
  const {
    loading,
    loadError,
    noCompetition,
    name,
    localHour,
    viewedDate,
    viewedState,
    setGoal,
    saveStatus,
    viewedResult,
    isToday,
    dayNumber,
    totalDays,
    canStepPrev,
    canStepNext,
    stepPrev,
    stepNext,
    currentStreak,
  } = useTodayLog();

  if (loading) {
    return (
      <div className="today__status" role="status" aria-live="polite">
        <i className="ph-bold ph-leaf" aria-hidden="true" />
        Loading your day…
      </div>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        icon="ph-bold ph-cloud-warning"
        color="var(--flame-600)"
        title="Couldn't load today"
        blurb="Something went wrong reaching your competition. Check your connection and pull to refresh — your saved days are safe."
      />
    );
  }

  if (noCompetition) {
    return (
      <EmptyState
        icon="ph-bold ph-flag-banner"
        color="var(--goal-move)"
        title={`Hi ${name}`}
        blurb="You're not in an active competition yet. When your group starts one, your Daily 9 check-in shows up right here."
      />
    );
  }

  const doneCount = viewedResult.doneCount;
  const perfect = viewedResult.isPerfect;

  // Grace copy is now a REAL affordance (2.3): on today it points to yesterday;
  // on yesterday it names the day being edited. Only shown when yesterday is
  // actually reachable (a competition that started today has no yesterday).
  const graceCopy = isToday
    ? canStepPrev
      ? 'Yesterday is still editable until midnight'
      : null
    : 'This day is still editable until midnight';

  return (
    <div>
      <header className="today__header">
        <div className="today__greeting">{greeting(localHour)}, {name}</div>
        <StreakFlame count={currentStreak} size="md" />
      </header>

      <DateNav
        label={dateLabel(viewedDate, { weekday: 'long', month: 'short', day: 'numeric' })}
        dayNumber={dayNumber}
        totalDays={totalDays}
        isToday={isToday}
        canPrev={canStepPrev}
        canNext={canStepNext}
        onPrev={stepPrev}
        onNext={stepNext}
      />

      <div className="today__hero">
        <DayScore done={doneCount} total={GOAL_COUNT} points={viewedResult.total} size={172} thickness={15} />
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

      <div className="today__statusbar">
        {graceCopy ? (
          <div className="today__grace">
            <i className="ph-bold ph-clock-countdown" aria-hidden="true" />
            {graceCopy}
          </div>
        ) : null}
        <SaveIndicator status={saveStatus} />
      </div>

      <div className="today__goals">
        {DAILY_9.map((g) => {
          if (g.logType === 'counter') {
            const value = typeof viewedState[g.key] === 'number' ? (viewedState[g.key] as number) : 0;
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
                  onChange={(v) => setGoal(g.key, v)}
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
              done={viewedState[g.key] === true}
              onToggle={() => setGoal(g.key, viewedState[g.key] !== true)}
            />
          );
        })}
      </div>
    </div>
  );
}

/** A warm, full-height empty/error state for Today (no competition / load fail). */
function EmptyState({ icon, color, title, blurb }: { icon: string; color: string; title: string; blurb: string }) {
  return (
    <div>
      <header className="today__header">
        <div className="today__greeting">{title}</div>
      </header>
      <Card variant="tint" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        <span
          aria-hidden="true"
          style={{
            width: 46, height: 46, borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center',
            background: `color-mix(in srgb, ${color} 15%, transparent)`, color,
          }}
        >
          <i className={icon} style={{ fontSize: 26 }} />
        </span>
        <Badge color={color} icon="ph-bold ph-leaf">Today</Badge>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--lh-normal)' }}>
          {blurb}
        </p>
      </Card>
    </div>
  );
}
