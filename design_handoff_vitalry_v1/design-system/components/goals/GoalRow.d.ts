import * as React from 'react';

/**
 * @startingPoint section="Goals" subtitle="Daily-9 goal check-in row" viewport="440x92"
 */
export interface GoalRowProps extends React.HTMLAttributes<HTMLElement> {
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
  /** Trailing counter control (a Stepper) — renders full-width below the name. */
  children?: React.ReactNode;
  /** Optional "3 / 5" progress label shown top-right for counter goals. */
  countLabel?: string;
}

/**
 * One row of the Daily-9 check-in — the product's core interaction. Simple
 * goals are a single ≥60px tappable check; counter goals nest a control.
 */
export function GoalRow(props: GoalRowProps): JSX.Element;
