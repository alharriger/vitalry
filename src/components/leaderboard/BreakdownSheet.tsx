import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { StreakFlame } from '../goals/StreakFlame';
import type { PlayerStanding } from '../../lib/standings';
import type { DayClass, DayScoreResult } from '../../lib/scoring';
import './BreakdownSheet.css';

export interface BreakdownSheetProps {
  /** The player whose breakdown to show, or null when closed. */
  player: PlayerStanding | null;
  /** Close the sheet. */
  onClose: () => void;
  /** Goals per day (bar height denominator); defaults to the v1 nine. */
  goalCount?: number;
}

/** Full a11y date label, e.g. "Sunday, July 19" (parsed at local noon). */
function fullLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * A player's day-by-day breakdown — the transparency requirement, shown as a
 * bottom sheet. Per Amber's Phase-3 decision it reveals **scores per day, never
 * which goals**: each bar's height is that day's goals-completed and its color
 * is the day class (perfect / active / below), with the player's totals in the
 * header. Built entirely from the engine's own `DayScoreResult[]`, so the bars
 * and the leaderboard rank can never disagree.
 */
export function BreakdownSheet({ player, onClose, goalCount = 9 }: BreakdownSheetProps) {
  return (
    <BottomSheet
      open={player != null}
      onClose={onClose}
      ariaLabel={player ? `${player.name}'s breakdown` : 'Breakdown'}
      handleContent={
        player ? (
          <div className="vt-bd__header">
            <div className="vt-bd__id">
              <div className="vt-bd__name">{player.name}</div>
              <div className="vt-bd__stats">
                {player.totalScore} points · {player.perfectDays} perfect{' '}
                {player.perfectDays === 1 ? 'day' : 'days'}
              </div>
            </div>
            <StreakFlame count={player.currentStreak} size="md" />
          </div>
        ) : null
      }
    >
      {player ? <BreakdownBody days={player.days} goalCount={goalCount} /> : null}

      <Button block variant="secondary" onClick={onClose}>
        Close
      </Button>
    </BottomSheet>
  );
}

/** The bar chart + legend. Split out so the sheet stays declarative. */
function BreakdownBody({ days, goalCount }: { days: DayScoreResult[]; goalCount: number }) {
  if (days.length === 0) {
    return <p className="vt-bd__empty">This competition hasn’t started yet.</p>;
  }
  return (
    <>
      <div className="vt-bd__chart" role="group" aria-label="Goals completed each day">
        {days.map((d) => (
          <BreakdownBar key={d.localDate} day={d} goalCount={goalCount} />
        ))}
      </div>

      <div className="vt-bd__legend" aria-hidden="true">
        <span className="vt-bd__legend-item">
          <span className="vt-bd__sw vt-bd__sw--perfect" /> Perfect
        </span>
        <span className="vt-bd__legend-item">
          <span className="vt-bd__sw vt-bd__sw--active" /> Active (6+)
        </span>
        <span className="vt-bd__legend-item">
          <span className="vt-bd__sw vt-bd__sw--some" /> Below
        </span>
      </div>
    </>
  );
}

/** One day's bar — height ∝ goals done, color by day class. */
function BreakdownBar({ day, goalCount }: { day: DayScoreResult; goalCount: number }) {
  const dayNum = Number(day.localDate.slice(8, 10));
  // A hair of height even at 0 done, so a missed day still reads as a bar stub.
  const pct = Math.max(6, Math.round((day.doneCount / goalCount) * 100));
  const fillClass = `vt-bd__fill--${barClass(day.dayClass)}`;
  const label = `${fullLabel(day.localDate)}: ${day.doneCount} of ${goalCount} goals, ${day.total} points`;
  return (
    <span className="vt-bd__bar" role="img" aria-label={label} title={label}>
      <span className="vt-bd__bar-track" aria-hidden="true">
        <span className={`vt-bd__fill ${fillClass}`} style={{ height: `${pct}%` }} />
      </span>
      <span className="vt-bd__bar-num" aria-hidden="true">
        {dayNum}
      </span>
    </span>
  );
}

/** Collapse the 4-way day class to the 3 breakdown buckets (some ← some/nothing). */
function barClass(cls: DayClass): 'perfect' | 'active' | 'some' {
  if (cls === 'perfect') return 'perfect';
  if (cls === 'active') return 'active';
  return 'some';
}
