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
.vt-seg {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
  padding: 4px;
  background: var(--surface-sunken);
  border-radius: var(--radius-pill);
}
.vt-seg__opt {
  appearance: none;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-weight: var(--fw-bold);
  font-size: var(--text-base);
  color: var(--text-secondary);
  height: var(--tap-min);
  border-radius: var(--radius-pill);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring);
}
.vt-seg__opt:active { transform: scale(var(--press-scale)); }
.vt-seg__opt[aria-pressed="true"] {
  background: var(--surface-card);
  color: var(--evergreen);
  box-shadow: var(--shadow-sm);
}
.vt-seg__opt:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.vt-seg__sub { font-size: var(--text-xs); font-weight: var(--fw-semibold); opacity: 0.7; }
`;

/**
 * Equal-width segmented selector — the 7/14/30-day duration picker and any
 * mutually-exclusive small choice set.
 */
export function SegmentedControl({
  options = [],          // [{ value, label, sublabel?, icon? }] or ["a","b"]
  value,
  onChange = () => {},
  className = '',
  ...rest
}) {
  useStyles('vt-seg-styles', CSS);
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div className={['vt-seg', className].filter(Boolean).join(' ')} role="group" {...rest}>
      {norm.map((o) => (
        <button
          key={o.value}
          type="button"
          className="vt-seg__opt"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.icon ? <i className={o.icon} aria-hidden="true" /> : null}
          <span>{o.label}</span>
          {o.sublabel ? <span className="vt-seg__sub">{o.sublabel}</span> : null}
        </button>
      ))}
    </div>
  );
}
