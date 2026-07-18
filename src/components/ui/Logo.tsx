import { Mark, type MarkVariant } from './Mark';
import { Wordmark } from './Wordmark';
import './Logo.css';

export interface LogoProps {
  /** Side-by-side (primary) or stacked (centered contexts). */
  orientation?: 'horizontal' | 'stacked';
  /** Overall scale — sizes the mark and wordmark together. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the "Fit Friends & Fam" tagline (stacked lockup only). */
  tagline?: boolean;
  /** Mark color treatment (full on light, reverse on dark). */
  variant?: MarkVariant;
  className?: string;
}

// Mark pixel size paired with the matching Wordmark type scale.
const SIZES: Record<NonNullable<LogoProps['size']>, { mark: number; word: 'sm' | 'md' | 'lg' | 'xl' }> = {
  sm: { mark: 30, word: 'sm' },
  md: { mark: 42, word: 'md' },
  lg: { mark: 60, word: 'lg' },
  xl: { mark: 80, word: 'xl' },
};

/**
 * The Vitalry logo lockup — the high-five {@link Mark} with the {@link Wordmark}.
 * Horizontal is the primary lockup; stacked (optionally with the tagline) suits
 * centered contexts like the splash and sign-in. Both compose the same
 * token-driven pieces, so the brand stays consistent everywhere.
 */
export function Logo({
  orientation = 'horizontal',
  size = 'md',
  tagline = false,
  variant = 'full',
  className = '',
}: LogoProps) {
  const { mark, word } = SIZES[size];
  const cls = ['vt-logo', `vt-logo--${orientation}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} role="img" aria-label="Vitalry — Fit Friends & Fam">
      <Mark variant={variant} size={mark} aria-hidden="true" role="presentation" />
      <Wordmark size={word} tagline={tagline && orientation === 'stacked'} aria-hidden="true" />
    </span>
  );
}
