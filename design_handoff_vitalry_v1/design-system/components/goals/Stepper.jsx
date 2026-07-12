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
.vt-stepper { --_c: var(--evergreen); display: inline-flex; align-items: center; gap: 8px; }
.vt-stepper__btn {
  appearance: none;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 2.5px solid var(--_c);
  background: transparent;
  color: var(--_c);
  display: grid; place-items: center;
  cursor: pointer;
  transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast) var(--ease-out);
}
.vt-stepper__btn:hover { background: color-mix(in srgb, var(--_c) 12%, transparent); }
.vt-stepper__btn:active { transform: scale(0.88); }
.vt-stepper__btn:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.vt-stepper__btn .ph, .vt-stepper__btn [class*="ph-"] { font-size: 21px; }
.vt-stepper__btn:disabled { opacity: 0.32; cursor: not-allowed; }
.vt-stepper__val {
  min-width: 46px;
  text-align: center;
  font-family: var(--font-display);
  font-weight: var(--fw-extra);
  font-size: var(--text-xl);
  color: var(--text-primary);
  line-height: 1;
}
.vt-stepper__val small {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: var(--fw-bold);
}
`;

/**
 * Big-target −/+ number stepper. The logging control for count goals (water
 * cups, produce colors): one tap per unit, huge touch targets, no clutter.
 */
export function Stepper({
  value = 0,
  max = 8,
  min = 0,
  onChange = () => {},
  color = 'var(--evergreen)',
  className = '',
  style = {},
  ...rest
}) {
  useStyles('vt-stepper-styles', CSS);
  return (
    <div className={['vt-stepper', className].filter(Boolean).join(' ')} style={{ '--_c': color, ...style }} {...rest}>
      <button type="button" className="vt-stepper__btn" aria-label="Decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <i className="ph-bold ph-minus" aria-hidden="true" />
      </button>
      <span className="vt-stepper__val" aria-live="polite">{value}<small> / {max}</small></span>
      <button type="button" className="vt-stepper__btn" aria-label="Increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <i className="ph-bold ph-plus" aria-hidden="true" />
      </button>
    </div>
  );
}
