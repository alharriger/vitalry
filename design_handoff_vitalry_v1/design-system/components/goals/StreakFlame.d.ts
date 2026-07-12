import * as React from 'react';

export interface StreakFlameProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Current active-day streak count. */
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Append "day streak" label. */
  showLabel?: boolean;
}

/**
 * Streak indicator — flame + active-day count. Pulses gently while alive,
 * goes gray and static at zero. A streak is built from "active days" (6+/9).
 */
export function StreakFlame(props: StreakFlameProps): JSX.Element;
