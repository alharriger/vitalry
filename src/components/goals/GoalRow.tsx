import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './GoalRow.css';

export interface GoalRowProps extends HTMLAttributes<HTMLElement> {
  /** Goal name, e.g. "Fresh air". */
  name: string;
  /** Plain-language target, e.g. "20 min outside". */
  target?: string;
  /** Phosphor icon class for the category. */
  icon?: string;
  /** Category color — use a `--goal-*` token. */
  color?: string;
  /** Completed state. */
  done?: boolean;
  /** Toggle handler for check-type goals. */
  onToggle?: () => void;
  /** Whether the whole row is a toggle (true for check goals). */
  interactive?: boolean;
  /** Trailing counter control (a Stepper) — renders inline on the right. */
  children?: ReactNode;
}

type AccentStyle = CSSProperties & { '--_c'?: string };

/**
 * One row of the Daily-9 check-in — the product's core interaction. Simple
 * (check) goals are a single tappable ≥60px row; counter goals nest a Stepper.
 */
export function GoalRow({
  name,
  target,
  icon,
  color = 'var(--green-600)',
  done = false,
  onToggle,
  interactive = true,
  children,
  className = '',
  style = {},
  ...rest
}: GoalRowProps) {
  const hasControl = !!children;
  const tappable = interactive && !hasControl;
  const cls = [
    'vt-goal',
    tappable ? 'vt-goal--tappable' : '',
    // A row with a trailing control IS a counter goal (rainbow / water). The
    // modifier drives the compact-inline stepper + wrapping title (GoalRow.css).
    hasControl ? 'vt-goal--counter' : '',
    done ? 'vt-goal--done' : '',
    className,
  ].filter(Boolean).join(' ');
  const mergedStyle: AccentStyle = { '--_c': color, ...style };

  const inner = (
    <div className="vt-goal__top">
      <span className="vt-goal__disc">{icon ? <i className={icon} aria-hidden="true" /> : null}</span>
      <span className="vt-goal__body">
        <span className="vt-goal__name">{name}</span>
        {target ? <span className="vt-goal__target">{target}</span> : null}
      </span>
      {hasControl
        ? <span className="vt-goal__control">{children}</span>
        : <span className="vt-goal__check"><i className="ph-bold ph-check" aria-hidden="true" /></span>}
    </div>
  );

  if (tappable) {
    return (
      <button
        type="button"
        className={cls}
        style={mergedStyle}
        aria-pressed={done}
        onClick={onToggle}
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={cls} style={mergedStyle} {...rest}>
      {inner}
    </div>
  );
}
