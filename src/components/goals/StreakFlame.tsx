import type { HTMLAttributes } from 'react';
import './StreakFlame.css';

export interface StreakFlameProps extends HTMLAttributes<HTMLSpanElement> {
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
export function StreakFlame({ count = 0, size = 'md', showLabel = false, className = '', ...rest }: StreakFlameProps) {
  const active = count > 0;
  const cls = [
    'vt-streak',
    `vt-streak--${size}`,
    active ? 'vt-streak--active' : 'vt-streak--muted',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} aria-label={`${count} day streak`} {...rest}>
      <span className="vt-streak__icon">
        <i className={active ? 'ph-fill ph-fire' : 'ph-bold ph-fire'} aria-hidden="true" />
      </span>
      <span>{count}</span>
      {showLabel ? <span className="vt-streak__label">day streak</span> : null}
    </span>
  );
}
