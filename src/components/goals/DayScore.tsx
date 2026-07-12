import type { CSSProperties, HTMLAttributes } from 'react';
import './DayScore.css';

export interface DayScoreProps extends HTMLAttributes<HTMLDivElement> {
  /** Goals completed today. */
  done?: number;
  /** Total goals (9 in v1). */
  total?: number;
  /** Optional daily points earned, shown under the ring. */
  points?: number;
  /** Diameter in px. */
  size?: number;
  thickness?: number;
}

/**
 * The Today screen's hero dial — goals-completed of 9, with a big central
 * numeral. Fills a lighter green in progress, deepening to the full brand
 * green at a perfect 9/9.
 */
export function DayScore({
  done = 0,
  total = 9,
  points,
  size = 160,
  thickness = 14,
  className = '',
  style = {},
  ...rest
}: DayScoreProps) {
  const perfect = done >= total;
  const color = perfect ? 'var(--green-600)' : 'var(--green-400)';
  const pct = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const cls = ['vt-dayscore', perfect ? 'vt-dayscore--perfect' : '', className].filter(Boolean).join(' ');
  const wrapStyle: CSSProperties = { width: size, height: size, ...style };

  return (
    <div className={cls} style={wrapStyle} role="img" aria-label={`${done} of ${total} goals`} {...rest}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray var(--dur-slow) var(--ease-spring), stroke var(--dur-base) var(--ease-out)' }}
        />
      </svg>
      <div className="vt-dayscore__center">
        <span className="vt-dayscore__num">{done}</span>
        <span className="vt-dayscore__of">of {total} goals</span>
        {points != null ? <span className="vt-dayscore__pts">{points} pts today</span> : null}
      </div>
    </div>
  );
}
