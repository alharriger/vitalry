import * as React from 'react';

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  /** Diameter in px. */
  size?: number;
  /** Stroke width in px. */
  thickness?: number;
  /** Progress stroke color (token or hex). */
  color?: string;
  /** Track (unfilled) color. */
  track?: string;
  /** Rounded stroke caps (default true). */
  rounded?: boolean;
  /** Center content — a numeral, label, or icon. */
  children?: React.ReactNode;
}

/**
 * Circular progress dial. Generic ring behind the daily score and per-goal
 * completion rates. Animates on value change with a gentle spring.
 */
export function ProgressRing(props: ProgressRingProps): JSX.Element;
