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
@keyframes vt-flame-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
.vt-streak {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-weight: var(--fw-extra);
  color: var(--flame-600);
  line-height: 1;
}
.vt-streak--muted { color: var(--text-muted); }
.vt-streak__icon { display: inline-grid; place-items: center; }
.vt-streak--active .vt-streak__icon {
  color: var(--flame-500);
  animation: vt-flame-pulse 1.6s var(--ease-in-out) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .vt-streak--active .vt-streak__icon { animation: none; }
}
.vt-streak--sm { font-size: var(--text-base); }
.vt-streak--sm .ph, .vt-streak--sm [class*="ph-"] { font-size: 20px; }
.vt-streak--md { font-size: var(--text-xl); }
.vt-streak--md .ph, .vt-streak--md [class*="ph-"] { font-size: 26px; }
.vt-streak--lg { font-size: var(--text-3xl); }
.vt-streak--lg .ph, .vt-streak--lg [class*="ph-"] { font-size: 40px; }
`;

/**
 * Streak indicator — a flame plus the active-day count. Pulses gently when the
 * streak is alive; goes muted (gray, static) at zero.
 */
export function StreakFlame({
  count = 0,
  size = 'md',
  showLabel = false,
  className = '',
  ...rest
}) {
  useStyles('vt-streak-styles', CSS);
  const active = count > 0;
  const cls = [
    'vt-streak',
    `vt-streak--${size}`,
    active ? 'vt-streak--active' : 'vt-streak--muted',
    className,
  ].filter(Boolean).join(' ');
  return (
    <span className={cls} aria-label={`${count} day streak`} {...rest}>
      <span className="vt-streak__icon">
        <i className={active ? 'ph-fill ph-fire' : 'ph-bold ph-fire'} aria-hidden="true" />
      </span>
      <span>{count}</span>
      {showLabel ? <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.6em', color: 'var(--text-secondary)' }}>day streak</span> : null}
    </span>
  );
}
