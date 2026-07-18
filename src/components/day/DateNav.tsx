import './DateNav.css';

export interface DateNavProps {
  /** The full date label for the centre button, e.g. "Wednesday, Jul 22". */
  label: string;
  /** 1-based day number of the viewed day within the competition. */
  dayNumber: number;
  /** Total days in the competition. */
  totalDays: number;
  /** Whether the viewed day is today (adds the "· today" caption). */
  isToday: boolean;
  /** Enable the previous-day step (disabled at the reachable floor). */
  canPrev: boolean;
  /** Enable the next-day step (disabled at today — never step into the future). */
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  /**
   * Opens the month-sheet picker. Undefined until Phase 2.5 — while undefined the
   * centre renders as a plain (non-interactive) date label.
   */
  onOpenPicker?: () => void;
}

/**
 * The "step and open" date-navigation control — prev / date / next — that sits
 * at the top of every day-based screen. The single source of day navigation.
 *
 * Phase 2.3: prev floors at yesterday, next ceils at today, and the centre is a
 * label only (the picker arrives in 2.5, wired via `onOpenPicker`). Built as a
 * reusable presentational component so the read-only day view (2.4) and Phase 5
 * History reuse it unchanged.
 */
export function DateNav({
  label,
  dayNumber,
  totalDays,
  isToday,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onOpenPicker,
}: DateNavProps) {
  const caption = isToday
    ? `Day ${dayNumber} of ${totalDays} · today`
    : `Day ${dayNumber} of ${totalDays}`;

  return (
    <div className="vt-datenav">
      <div className="vt-datenav__row">
        <button
          type="button"
          className="vt-datenav__step"
          aria-label="Previous day"
          disabled={!canPrev}
          aria-disabled={!canPrev || undefined}
          onClick={canPrev ? onPrev : undefined}
        >
          <i className="ph-bold ph-caret-left" aria-hidden="true" />
        </button>

        {onOpenPicker ? (
          <button
            type="button"
            className="vt-datenav__date vt-datenav__date--button"
            aria-haspopup="dialog"
            onClick={onOpenPicker}
          >
            <i className="ph-bold ph-calendar-blank" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ) : (
          <div className="vt-datenav__date">
            <i className="ph-bold ph-calendar-blank" aria-hidden="true" />
            <span>{label}</span>
          </div>
        )}

        <button
          type="button"
          className="vt-datenav__step"
          aria-label="Next day"
          disabled={!canNext}
          aria-disabled={!canNext || undefined}
          onClick={canNext ? onNext : undefined}
        >
          <i className="ph-bold ph-caret-right" aria-hidden="true" />
        </button>
      </div>
      <div className="vt-datenav__caption">{caption}</div>
    </div>
  );
}
