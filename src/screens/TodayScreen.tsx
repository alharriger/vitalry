import { Badge, Button, Card, DateNav, DayRecordRow, DayScore, GoalRow, MonthSheet, SaveIndicator, Stepper, StreakFlame } from '../components';
import { DAILY_9, GOAL_COUNT, isGoalDone } from '../lib/goals';
import { useTodayLog } from '../lib/useTodayLog';
import type { GoalStates } from '../types';
import './TodayScreen.css';

function greeting(hour: number): string {
  if (hour < 5) return 'Good night'; // 00:00–04:59
  if (hour < 12) return 'Good morning'; // 05:00–11:59
  if (hour < 17) return 'Good afternoon'; // 12:00–16:59
  if (hour < 22) return 'Good evening'; // 17:00–21:59
  return 'Good night'; // 22:00–23:59
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
 * Phase 2.4: the day-browser reaches the WHOLE run — prev now floors at
 * `start_date`, next ceils at today. Today + yesterday render the editable
 * check-in within the grace window (autosaving to `daily_logs` via the 2.1
 * engine); every earlier day renders as a read-only record, and a day with
 * nothing logged takes the kind missed-day treatment. The month-sheet picker
 * (2.5) is still to come; until then the centre date is a label, not a button.
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
    isEditable,
    isToday,
    dayNumber,
    totalDays,
    canStepPrev,
    canStepNext,
    stepPrev,
    stepNext,
    goToToday,
    selectDate,
    competition,
    today,
    finalDate,
    classByDate,
    isDayEditable,
    pickerOpen,
    openPicker,
    closePicker,
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

  return (
    <div>
      {/* One header slot on every day: the greeting on editable days, a muted
          "Looking back" on locked past days. Same element/height so the DateNav
          below never shifts position as you step between days. */}
      <header className="today__header">
        <div className={`today__greeting${isEditable ? '' : ' today__greeting--muted'}`}>
          {isEditable ? `${greeting(localHour)}, ${name}` : 'Looking back'}
        </div>
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
        onOpenPicker={openPicker}
      />

      {competition ? (
        <MonthSheet
          open={pickerOpen}
          onClose={closePicker}
          onSelect={selectDate}
          startDate={competition.startDate}
          finalDate={finalDate}
          today={today}
          viewedDate={viewedDate}
          classByDate={classByDate}
          dayNumber={dayNumber}
          totalDays={totalDays}
          isEditable={isDayEditable}
        />
      ) : null}

      {isEditable ? (
        <EditableDay
          viewedResult={viewedResult}
          viewedState={viewedState}
          setGoal={setGoal}
          saveStatus={saveStatus}
          isToday={isToday}
          canStepPrev={canStepPrev}
        />
      ) : (
        <ReadOnlyDay viewedState={viewedState} doneCount={viewedResult.doneCount} onBackToToday={goToToday} />
      )}
    </div>
  );
}

/** The check-in for an editable day (today or yesterday, within grace). */
function EditableDay({
  viewedResult,
  viewedState,
  setGoal,
  saveStatus,
  isToday,
  canStepPrev,
}: {
  viewedResult: { doneCount: number; isPerfect: boolean; total: number };
  viewedState: GoalStates;
  setGoal: (key: string, value: boolean | number) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isToday: boolean;
  canStepPrev: boolean;
}) {
  const doneCount = viewedResult.doneCount;
  const perfect = viewedResult.isPerfect;

  // Grace copy is a REAL affordance (2.3): on today it points to yesterday;
  // on yesterday it names the day being edited. Only shown when yesterday is
  // actually reachable (a competition that started today has no yesterday).
  const graceCopy = isToday
    ? canStepPrev
      ? 'Yesterday is still editable until midnight'
      : null
    : 'This day is still editable until midnight';

  return (
    <>
      <div className="today__hero">
        <DayScore done={doneCount} total={GOAL_COUNT} points={viewedResult.total} size={172} thickness={15} renderSize="clamp(150px, 44vw, 200px)" />
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
                <Stepper value={value} max={g.counterMax} color={g.color} onChange={(v) => setGoal(g.key, v)} />
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
    </>
  );
}

/**
 * A past day, read-only (handoff frames 2c/2d). Unmistakably non-interactive: a
 * lock banner, that day's record, and a single "Back to today" action. When
 * nothing was logged (doneCount 0) it takes the kinder missed-day treatment —
 * never red, never "failed", never a count of misses.
 */
function ReadOnlyDay({
  viewedState,
  doneCount,
  onBackToToday,
}: {
  viewedState: GoalStates;
  doneCount: number;
  onBackToToday: () => void;
}) {
  const missed = doneCount === 0;

  return (
    <>
      {/* One banner for every locked day, and it sits OUTSIDE .readonly-content
          so it keeps its calm periwinkle tint while the record below desaturates. */}
      <div className="today__lock">
        <i className="ph-bold ph-lock-simple" aria-hidden="true" />
        <span>You're viewing a past day — logging is locked.</span>
      </div>

      <div className="readonly-content">
        <div className="today__readonly-hero">
          {missed ? (
            <>
              <div className="today__missed-marker" aria-hidden="true">
                <i className="ph-bold ph-moon-stars" />
              </div>
              <div className="today__missed-title">Nothing logged this day</div>
            </>
          ) : (
            <>
              <DayScore done={doneCount} total={GOAL_COUNT} size={132} thickness={13} renderSize="clamp(116px, 34vw, 152px)" />
              <div className="today__readonly-caption">Logged that day</div>
            </>
          )}
        </div>

        <div className="today__record-label">What was logged</div>
        <div className="today__goals">
          {DAILY_9.map((g) => {
            const value = viewedState[g.key];
            return (
              <DayRecordRow
                key={g.key}
                name={g.name}
                target={g.target}
                icon={g.icon}
                color={g.color}
                done={isGoalDone(g, value)}
              />
            );
          })}
        </div>

        <Button variant="primary" size="lg" block icon="ph-bold ph-arrow-u-up-left" onClick={onBackToToday} className="today__back">
          Back to today
        </Button>
      </div>
    </>
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
