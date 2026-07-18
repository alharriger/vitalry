import { Badge, Card, DayScore, GoalRow, SaveIndicator, Stepper, StreakFlame } from '../components';
import { DAILY_9, GOAL_COUNT, isGoalDone } from '../lib/goals';
import { useTodayLog } from '../lib/useTodayLog';
import './TodayScreen.css';

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Today — the daily check-in. The home screen and 80% of the product.
 *
 * Phase 2.2: live on `daily_logs` for TODAY ONLY. Every tap optimistically
 * updates local state and autosaves (no Save button); the score is the real
 * 2.1 engine result (base + perfect + streak). Date navigation, yesterday
 * editing, and browsing past days arrive in 2.3–2.5.
 */
export function TodayScreen() {
  const {
    loading,
    loadError,
    noCompetition,
    name,
    todayState,
    setGoal,
    saveStatus,
    todayResult,
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

  const doneCount = todayResult.doneCount;
  const perfect = todayResult.isPerfect;

  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div>
      <header className="today__header">
        <div>
          <div className="today__greeting">{greeting(now.getHours())}, {name}</div>
          <div className="today__date">{dateLabel}</div>
        </div>
        <StreakFlame count={currentStreak} size="md" />
      </header>

      <div className="today__hero">
        <DayScore done={doneCount} total={GOAL_COUNT} points={todayResult.total} size={172} thickness={15} />
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
        {/* Phase 2.2: keep grace copy PASSIVE — reaching/editing yesterday is 2.3. */}
        <div className="today__grace">
          <i className="ph-bold ph-clock-countdown" aria-hidden="true" />
          Grace window: yesterday stays editable until midnight
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      <div className="today__goals">
        {DAILY_9.map((g) => {
          if (g.logType === 'counter') {
            const value = typeof todayState[g.key] === 'number' ? (todayState[g.key] as number) : 0;
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
              done={todayState[g.key] === true}
              onToggle={() => setGoal(g.key, todayState[g.key] !== true)}
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
