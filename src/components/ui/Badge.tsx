import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Fill treatment. `neutral` is the quiet cream default. */
  variant?: 'solid' | 'tint' | 'outline' | 'neutral';
  /** Accent color (token or hex) — drives solid/tint/outline hues. */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Leading Phosphor icon class. */
  icon?: string;
  /** Show a leading status dot in the accent color. */
  dot?: boolean;
  children?: ReactNode;
}

type SolidStyle = CSSProperties & { '--_solid'?: string };

/**
 * Compact pill for counts, statuses, and category labels. Pair color with an
 * icon or text — never rely on color alone to carry meaning.
 */
export function Badge({
  children,
  variant = 'tint',
  color,
  size = 'md',
  icon,
  dot = false,
  className = '',
  style = {},
  ...rest
}: BadgeProps) {
  const cls = [
    'vt-badge',
    variant !== 'neutral' ? `vt-badge--${variant}` : '',
    size !== 'md' ? `vt-badge--${size}` : '',
    className,
  ].filter(Boolean).join(' ');
  const mergedStyle: SolidStyle = color ? { '--_solid': color, ...style } : style;
  return (
    <span className={cls} style={mergedStyle} {...rest}>
      {dot ? <span className="vt-badge__dot" /> : null}
      {icon ? <i className={icon} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
