import type { SVGProps } from 'react';

/** Which color treatment of the high-five mark to render. */
export type MarkVariant = 'full' | 'reverse' | 'mono';

export interface MarkProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  /** full = evergreen arms + green spark (on light); reverse = cream + bright
   *  spark (on evergreen/dark); mono = single ink color. */
  variant?: MarkVariant;
  /** Rendered width/height in px (the mark is square). */
  size?: number;
}

// Token colors per variant — never hard-coded hexes (design-system rule). The
// source SVGs in src/assets/brand/ carry the literal hexes for external use;
// in-app we drive them from tokens so they can never drift from the palette.
const COLORS: Record<MarkVariant, { arms: string; spark: string }> = {
  full: { arms: 'var(--evergreen)', spark: 'var(--green-500)' },
  reverse: { arms: 'var(--cream-50)', spark: 'var(--green-400)' },
  mono: { arms: 'var(--ink-900)', spark: 'var(--ink-900)' },
};

/**
 * The Vitalry high-five mark — two raised hands that also read as a **V** and a
 * **sprouting plant**, with a three-stroke "spark" above. Geometry is ported
 * verbatim from `src/assets/brand/vitalry-mark.svg`; only the colors are
 * tokenized. Round caps/joins are part of the brand — don't change them.
 */
export function Mark({ variant = 'full', size = 120, role = 'img', ...rest }: MarkProps) {
  const { arms, spark } = COLORS[variant];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={role}
      aria-label="Vitalry"
      {...rest}
    >
      <g stroke={arms} fill="none" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 46 102 L 42 47" />
        <path d="M 44 80 Q 34 76 31 65" />
        <path d="M 74 102 L 78 47" />
        <path d="M 76 80 Q 86 76 89 65" />
      </g>
      <g stroke={spark} fill="none" strokeWidth={8} strokeLinecap="round">
        <path d="M 53 41 L 49 29" />
        <path d="M 60 39 L 60 26" />
        <path d="M 67 41 L 71 29" />
      </g>
    </svg>
  );
}
