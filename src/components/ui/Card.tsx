import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `feature`/`raised` lift with shadow; `tint` uses warm cream; `flat` removes shadow. */
  variant?: 'default' | 'flat' | 'raised' | 'feature' | 'tint';
  /** Override the default 20px padding. */
  pad?: 'sm' | 'lg';
  /** Adds a colored left accent bar — pass a goal-category token for context. */
  accentColor?: string;
  /** Adds hover/press affordance for tappable cards. */
  interactive?: boolean;
  children?: ReactNode;
}

/** CSS custom property used by the accent-bar variant. */
type AccentStyle = CSSProperties & { '--_accent'?: string };

/**
 * Rounded surface container — the primary way content sits on the warm app
 * background. Compose goal rows, leaderboard rows, and stats inside it.
 */
export function Card({
  children,
  variant = 'default',
  pad,
  accentColor,
  interactive = false,
  className = '',
  style = {},
  ...rest
}: CardProps) {
  const cls = [
    'vt-card',
    variant !== 'default' ? `vt-card--${variant}` : '',
    pad ? `vt-card--pad-${pad}` : '',
    accentColor ? 'vt-card--accent' : '',
    interactive ? 'vt-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');
  const mergedStyle: AccentStyle = accentColor ? { '--_accent': accentColor, ...style } : style;
  return (
    <div className={cls} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
}
