import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Fill treatment. `neutral` is the quiet cream default. */
  variant?: 'solid' | 'tint' | 'outline' | 'neutral';
  /** Accent color (token or hex) — drives solid/tint/outline hues. */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Leading Phosphor icon class. */
  icon?: string;
  /** Show a leading status dot in the accent color. */
  dot?: boolean;
  children?: React.ReactNode;
}

/**
 * Compact pill for counts, statuses, and category labels. Pair color with an
 * icon or text — never rely on color alone to carry meaning.
 */
export function Badge(props: BadgeProps): JSX.Element;
