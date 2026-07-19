import type { CSSProperties, HTMLAttributes } from 'react';
import './DayScore.css';

export interface DayScoreProps extends HTMLAttributes<HTMLDivElement> {
  /** Goals completed today. */
  done?: number;
  /** Total goals (9 in v1). */
  total?: number;
  /** Optional daily points earned, shown under the ring. */
  points?: number;
  /** Reference diameter in px — sets the ring's geometry ratios (stroke, radius)
   *  and the default rendered size. */
  size?: number;
  thickness?: number;
  /**
   * CSS length for the rendered box — pass a `clamp()` to make the ring fluid
   * (e.g. `"clamp(150px, 44vw, 200px)"`). Geometry ratios still come from
   * `size`/`thickness`, and the central numerals scale with the box via
   * container units, so the whole dial grows/shrinks in proportion. When
   * omitted the dial renders at exactly `size` px (unchanged).
   */
  renderSize?: string;
}

/** Reference font sizes (px) of the central labels at diameter `size`; used to
 *  derive container-relative sizes when the dial is fluid. Mirror the tokens
 *  `--text-score` / `--text-sm` / `--text-xs`. */
const NUM_PX = 56;
const OF_PX = 15;
const PTS_PX = 13;

type FluidVars = CSSProperties & {
  '--ds-num'?: string;
  '--ds-of'?: string;
  '--ds-pts'?: string;
};

/**
 * The Today screen's hero dial — goals-completed of 9, with a big central
 * numeral. Fills a lighter green in progress, deepening to the full brand
 * green at a perfect 9/9. Fluid when given `renderSize`; fixed at `size` px
 * otherwise.
 */
export function DayScore({
  done = 0,
  total = 9,
  points,
  size = 160,
  thickness = 14,
  renderSize,
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
  const fluid = renderSize != null;
  const box = renderSize ?? `${size}px`;
  const cls = ['vt-dayscore', perfect ? 'vt-dayscore--perfect' : '', fluid ? 'vt-dayscore--fluid' : '', className]
    .filter(Boolean)
    .join(' ');
  // cqmin resolves to the box's side (the dial is square), so px/size*100 keeps
  // each label at the same proportion of the ring at any rendered diameter.
  const wrapStyle: FluidVars = {
    width: box,
    height: box,
    ...(fluid
      ? {
          '--ds-num': `${((NUM_PX / size) * 100).toFixed(3)}cqmin`,
          '--ds-of': `${((OF_PX / size) * 100).toFixed(3)}cqmin`,
          '--ds-pts': `${((PTS_PX / size) * 100).toFixed(3)}cqmin`,
        }
      : {}),
    ...style,
  };

  return (
    <div className={cls} style={wrapStyle} role="img" aria-label={`${done} of ${total} goals`} {...rest}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
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
