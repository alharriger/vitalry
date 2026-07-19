import type { CSSProperties } from 'react';
import './DayRecordRow.css';

export interface DayRecordRowProps {
  /** Goal name, e.g. "Fresh air". */
  name: string;
  /** Plain-language target, e.g. "20 min outside". */
  target?: string;
  /** Phosphor icon class for the category. */
  icon?: string;
  /** Category color — use a `--goal-*` token (fills the disc when done). */
  color?: string;
  /** Whether the goal was completed on the viewed day. */
  done?: boolean;
}

type AccentStyle = CSSProperties & { '--_c'?: string };

/**
 * A read-only record of one goal on a past day (handoff frame 2c). Deliberately
 * NOT a `GoalRow`: a plain `<div>` with no hover, no press, no `<button>`, and
 * never an empty checkbox — a glance must tell you a tap does nothing. Done rows
 * show the goal color + "Done"; not-done rows sink and read "Not logged" (never
 * red, never "failed" — we never shame a miss).
 *
 * Reused by Phase 5 History's read-only day browser.
 */
export function DayRecordRow({ name, target, icon, color = 'var(--green-600)', done = false }: DayRecordRowProps) {
  const style: AccentStyle = { '--_c': color };
  return (
    <div className={`vt-record${done ? ' vt-record--done' : ''}`} style={style}>
      <span className="vt-record__disc">{icon ? <i className={icon} aria-hidden="true" /> : null}</span>
      <span className="vt-record__body">
        <span className="vt-record__name">{name}</span>
        {target ? <span className="vt-record__target">{target}</span> : null}
      </span>
      <span className="vt-record__status">
        {done ? (
          <>
            <i className="ph-fill ph-check-circle" aria-hidden="true" />
            Done
          </>
        ) : (
          <>
            <i className="ph-bold ph-minus" aria-hidden="true" />
            Not logged
          </>
        )}
      </span>
    </div>
  );
}
