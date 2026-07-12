import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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
  children?: ReactNode;
}

/**
 * Pill-shaped primary action button — chunky, springy press feedback.
 * One dominant (primary/gold) action per screen; pair with secondary/ghost.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  icon,
  iconTrailing,
  disabled = false,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = [
    'vt-btn',
    `vt-btn--${variant}`,
    `vt-btn--${size}`,
    block ? 'vt-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} disabled={disabled} aria-disabled={disabled || undefined} {...rest}>
      {icon ? <i className={icon} aria-hidden="true" /> : null}
      {children ? <span>{children}</span> : null}
      {iconTrailing ? <i className={iconTrailing} aria-hidden="true" /> : null}
    </button>
  );
}
