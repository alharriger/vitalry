import type { HTMLAttributes } from 'react';
import './Wordmark.css';

export interface WordmarkProps extends HTMLAttributes<HTMLSpanElement> {
  /** Type scale of the wordmark. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the "Fit Friends & Fam" tagline beneath (the vertical lockup). */
  tagline?: boolean;
}

/**
 * The Vitalry wordmark — the brand's type mark: "Vitalry." set in the display
 * face with a tonal light-green period, kept entirely within the green family
 * (design_system.md / design-system README "Assets & logo"). This is the brand
 * treatment wherever a mark goes; the high-five logo mark sits beside it in the
 * full lockup.
 *
 * `aria-label` reads the plain name so the decorative period isn't announced.
 */
export function Wordmark({ size = 'md', tagline = false, className = '', ...rest }: WordmarkProps) {
  const cls = ['vt-wordmark', `vt-wordmark--${size}`, className].filter(Boolean).join(' ');
  return (
    <span className={cls} role="img" aria-label="Vitalry" {...rest}>
      <span className="vt-wordmark__type" aria-hidden="true">
        Vitalry<span className="vt-wordmark__dot">.</span>
      </span>
      {tagline ? (
        <span className="vt-wordmark__tagline" aria-hidden="true">Fit Friends &amp; Fam</span>
      ) : null}
    </span>
  );
}
