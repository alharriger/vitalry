import * as React from 'react';

/**
 * @startingPoint section="Core" subtitle="Pill action button — primary, secondary, ghost, gold" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `gold` is reserved for celebratory / perfect-day CTAs. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
  /** Control height. `lg` (60px) for the primary action on a screen. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to full container width (default for the dominant action on mobile). */
  block?: boolean;
  /** Leading Phosphor icon class, e.g. "ph-bold ph-plus". */
  icon?: string;
  /** Trailing Phosphor icon class. */
  iconTrailing?: string;
  disabled?: boolean;
  /** Render as a different element (e.g. "a" for links). */
  as?: 'button' | 'a';
  children?: React.ReactNode;
}

/**
 * Pill-shaped primary action button — chunky, springy press feedback.
 * One dominant (primary/gold) action per screen; pair with secondary/ghost.
 */
export function Button(props: ButtonProps): JSX.Element;
