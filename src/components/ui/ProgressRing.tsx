import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  /** Diameter in px. */
  size?: number;
  /** Stroke width in px. */
  thickness?: number;
  /** Progress stroke color (token or hex). */
  color?: string;
  /** Track (unfilled) color. */
  track?: string;
  /** Rounded stroke caps (default true). */
  rounded?: boolean;
  /** Center content — a numeral, label, or icon. */
  children?: ReactNode;
}

/**
 * Circular progress dial (SVG). Generic ring used for per-goal completion
 * rates and any "N of M" progress. Animates on value change with a spring.
 */
export function ProgressRing({
  value = 0,
  max = 100,
  size = 96,
  thickness = 10,
  color = 'var(--green-500)',
  track = 'var(--surface-sunken)',
  rounded = true,
  children,
  className = '',
  style = {},
  ...rest
}: ProgressRingProps) {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;

  const wrapStyle: CSSProperties = {
    position: 'relative', width: size, height: size, display: 'inline-flex', ...style,
  };

  return (
    <div className={className} style={wrapStyle} role="img" aria-label={`${value} of ${max}`} {...rest}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray var(--dur-slow, 340ms) var(--ease-spring, ease)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1,
      }}>
        {children}
      </div>
    </div>
  );
}
