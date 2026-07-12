import React from 'react';

function useStyles(id, css) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.vt-dayscore { position: relative; display: inline-flex; }
.vt-dayscore__center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; line-height: 1;
}
.vt-dayscore__num {
  font-family: var(--font-display);
  font-weight: var(--fw-extra);
  font-size: var(--text-score);
  color: var(--text-primary);
}
.vt-dayscore--perfect .vt-dayscore__num { color: var(--green-700); }
.vt-dayscore__of {
  font-family: var(--font-body);
  font-weight: var(--fw-bold);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 2px;
}
.vt-dayscore__pts {
  margin-top: 6px;
  font-family: var(--font-body);
  font-weight: var(--fw-extra);
  font-size: var(--text-xs);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--evergreen);
}
`;

/**
 * Branded daily-score dial for the Today screen. A ring of goals-completed of 9
 * with the count in the center; turns gold and celebratory at a perfect 9/9.
 */
export function DayScore({
  done = 0,
  total = 9,
  points,               // optional daily points to show under the ring
  size = 160,
  thickness = 14,
  className = '',
  style = {},
  ...rest
}) {
  useStyles('vt-dayscore-styles', CSS);
  const perfect = done >= total;
  const color = perfect ? 'var(--green-600)' : 'var(--green-400)';
  const pct = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const cls = ['vt-dayscore', perfect ? 'vt-dayscore--perfect' : '', className].filter(Boolean).join(' ');

  return (
    <div className={cls} style={{ width: size, height: size, ...style }} role="img" aria-label={`${done} of ${total} goals`} {...rest}>
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
