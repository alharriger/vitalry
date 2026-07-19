import { useEffect, useRef } from 'react';
import { localDateRange } from '../../lib/scoring';
import { weekdayOffset } from '../../lib/dayNav';
import type { DayClass } from '../../lib/scoring';
import './MonthSheet.css';

export interface MonthSheetProps {
  /** Whether the sheet is open (mounted + risen). */
  open: boolean;
  /** Close without selecting (scrim tap, Escape, grabber). */
  onClose: () => void;
  /** Select a day — the parent jumps to it; the sheet then closes. */
  onSelect: (date: string) => void;
  /** Competition first day, `'YYYY-MM-DD'`. */
  startDate: string;
  /** Competition final day (start + durationDays − 1). */
  finalDate: string;
  /** The player's local today. */
  today: string;
  /** The day currently open in the day view. */
  viewedDate: string;
  /** Per-day classification for logged days in `start..today`. Missing = nothing. */
  classByDate: Record<string, DayClass>;
  /** 1-based day number of the viewed day (header chip). */
  dayNumber: number;
  /** Total days in the competition (header chip). */
  totalDays: number;
  /** Grace check: is this date editable (today or yesterday)? */
  isEditable: (date: string) => boolean;
}

/** "S M T W T F S" column headers. */
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Short-month + year label for a date, parsed at local noon (no tz drift). */
function monthYear(date: string): { month: string; year: string } {
  const d = new Date(`${date}T12:00:00`);
  return {
    month: d.toLocaleDateString(undefined, { month: 'short' }),
    year: d.toLocaleDateString(undefined, { year: 'numeric' }),
  };
}

/** "Jun–Jul 2026" (or "July 2026") spanning the competition's calendar months. */
function rangeLabel(startDate: string, finalDate: string): string {
  const a = monthYear(startDate);
  const b = monthYear(finalDate);
  if (a.month === b.month && a.year === b.year) return `${a.month} ${a.year}`;
  if (a.year === b.year) return `${a.month}–${b.month} ${b.year}`;
  return `${a.month} ${a.year} – ${b.month} ${b.year}`;
}

/** Full a11y date label, e.g. "Sunday, July 19". */
function fullLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * The month-sheet date picker (handoff frame 2b) — a bottom-sheet heatmap of the
 * whole competition. Every day is coloured by how many goals were completed
 * (`dayClass`); today/yesterday carry the editable ring, the viewed day a base
 * bar. Tapping a selectable (non-future) day jumps to it and closes the sheet.
 *
 * Presentational only: all data arrives via props (Phase 5 History reuses it
 * against any competition + range). The grid is a single continuous
 * `start_date → final_date` calendar, weekday-aligned with leading blanks — a
 * competition that straddles two months reads as one glanceable heatmap
 * (Amber's call, 2026-07-19).
 */
export function MonthSheet({
  open,
  onClose,
  onSelect,
  startDate,
  finalDate,
  today,
  viewedDate,
  classByDate,
  dayNumber,
  totalDays,
  isEditable,
}: MonthSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Focus management + Escape-to-close, only while open.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    // Move focus into the sheet (the current/today cell if present, else the sheet).
    const focusTarget =
      sheetRef.current?.querySelector<HTMLElement>('[data-focus="true"]') ?? sheetRef.current;
    focusTarget?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const days = localDateRange(startDate, finalDate);
  const leadingBlanks = weekdayOffset(startDate);

  return (
    <div className="vt-sheet" role="presentation">
      <div className="vt-sheet__scrim" onClick={onClose} aria-hidden="true" />

      <div
        className="vt-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to a day"
        ref={sheetRef}
        tabIndex={-1}
      >
        <button
          type="button"
          className="vt-sheet__grabber"
          aria-label="Close"
          onClick={onClose}
        />

        <div className="vt-sheet__header">
          <div className="vt-sheet__month">{rangeLabel(startDate, finalDate)}</div>
          <div className="vt-sheet__chip">
            <i className="ph-bold ph-flag-checkered" aria-hidden="true" />
            Day {dayNumber} of {totalDays}
          </div>
        </div>

        <div className="vt-sheet__weekdays" aria-hidden="true">
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="vt-sheet__grid" role="grid" aria-label="Competition days">
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`blank-${i}`} className="vt-sheet__cell vt-sheet__cell--blank" aria-hidden="true" />
          ))}

          {days.map((date) => {
            const isFuture = date > today;
            const isToday = date === today;
            const isViewing = date === viewedDate;
            const editable = isEditable(date);
            const cls: DayClass = isFuture ? 'nothing' : classByDate[date] ?? 'nothing';
            const dayNum = Number(date.slice(8, 10));

            const stateLabel = isFuture
              ? 'upcoming'
              : cls === 'perfect'
                ? 'perfect day'
                : cls === 'active'
                  ? 'active day'
                  : cls === 'some'
                    ? 'some goals logged'
                    : 'nothing logged';
            const label = `${fullLabel(date)} — ${stateLabel}${isToday ? ', today' : ''}`;

            const classNames = [
              'vt-sheet__cell',
              `vt-sheet__cell--${isFuture ? 'future' : cls}`,
              isToday && 'vt-sheet__cell--today',
              !isToday && editable && 'vt-sheet__cell--editable',
              !isToday && isViewing && 'vt-sheet__cell--viewing',
            ]
              .filter(Boolean)
              .join(' ');

            if (isFuture) {
              return (
                <div key={date} className={classNames} aria-hidden="true">
                  <span className="vt-sheet__num">{dayNum}</span>
                </div>
              );
            }

            return (
              <button
                key={date}
                type="button"
                className={classNames}
                aria-label={label}
                aria-current={isToday ? 'date' : undefined}
                data-focus={isViewing ? 'true' : undefined}
                onClick={() => {
                  onSelect(date);
                  onClose();
                }}
              >
                <span className="vt-sheet__num">{dayNum}</span>
                {cls === 'perfect' && (
                  <i className="ph-fill ph-star vt-sheet__star" aria-hidden="true" />
                )}
                {isToday && <span className="vt-sheet__todaylabel">Today</span>}
              </button>
            );
          })}
        </div>

        <div className="vt-sheet__legend">
          <LegendItem className="vt-sheet__sw--perfect" star>Perfect</LegendItem>
          <LegendItem className="vt-sheet__sw--active">Active</LegendItem>
          <LegendItem className="vt-sheet__sw--some">Some goals</LegendItem>
          <LegendItem className="vt-sheet__sw--nothing">Nothing logged</LegendItem>
          <LegendItem className="vt-sheet__sw--editable">Editable</LegendItem>
          <LegendItem className="vt-sheet__sw--today">Today</LegendItem>
          <LegendItem className="vt-sheet__sw--viewing">Viewing</LegendItem>
        </div>
      </div>
    </div>
  );
}

/** One legend swatch + label. */
function LegendItem({
  className,
  star,
  children,
}: {
  className: string;
  star?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="vt-sheet__legend-item">
      <span className={`vt-sheet__sw ${className}`} aria-hidden="true">
        {star && <i className="ph-fill ph-star" />}
      </span>
      {children}
    </span>
  );
}
