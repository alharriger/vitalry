import React from 'react';

/* Inject component styles once (enables real hover / focus / active states). */
function useStyles(id, css) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.vt-btn {
  --_bg: var(--accent);
  --_fg: var(--text-inverse);
  --_bd: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-weight: var(--fw-extra);
  letter-spacing: var(--ls-normal);
  border: var(--border-thick) solid var(--_bd);
  background: var(--_bg);
  color: var(--_fg);
  border-radius: var(--radius-pill);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  transition: transform var(--dur-fast) var(--ease-spring),
              background var(--dur-fast) var(--ease-out),
              filter var(--dur-fast) var(--ease-out);
}
.vt-btn:hover { filter: brightness(0.96); }
.vt-btn:active { transform: scale(var(--press-scale)); }
.vt-btn:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }

/* sizes */
.vt-btn--md { height: var(--tap-md); padding: 0 22px; font-size: var(--text-base); }
.vt-btn--lg { height: var(--tap-lg); padding: 0 28px; font-size: var(--text-lg); }
.vt-btn--sm { height: var(--control-sm); padding: 0 16px; font-size: var(--text-sm); }
.vt-btn--block { display: flex; width: 100%; }

/* variants */
.vt-btn--primary   { --_bg: var(--accent); --_fg: var(--text-inverse); }
.vt-btn--primary:hover { --_bg: var(--accent-hover); filter: none; }
.vt-btn--secondary { --_bg: transparent; --_fg: var(--evergreen); --_bd: var(--evergreen); }
.vt-btn--secondary:hover { --_bg: var(--mint-200); filter: none; }
.vt-btn--ghost     { --_bg: transparent; --_fg: var(--text-secondary); --_bd: transparent; }
.vt-btn--ghost:hover { --_bg: var(--surface-sunken); filter: none; }
.vt-btn--gold      { --_bg: var(--sun-400); --_fg: var(--ink-900); }

.vt-btn[disabled], .vt-btn[aria-disabled="true"] {
  --_bg: var(--surface-sunken); --_fg: var(--text-muted); --_bd: transparent;
  cursor: not-allowed; filter: none; transform: none; pointer-events: none;
}
.vt-btn .ph, .vt-btn [class*="ph-"] { font-size: 1.25em; line-height: 1; }
`;

/**
 * Vitalry primary action button. Pill-shaped, chunky, springy press.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  icon,            // phosphor class, e.g. "ph-bold ph-plus" (leading)
  iconTrailing,    // phosphor class (trailing)
  disabled = false,
  as = 'button',
  className = '',
  ...rest
}) {
  useStyles('vt-btn-styles', CSS);
  const Tag = as;
  const cls = [
    'vt-btn',
    `vt-btn--${variant}`,
    `vt-btn--${size}`,
    block ? 'vt-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      className={cls}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {icon ? <i className={icon} aria-hidden="true" /> : null}
      {children ? <span>{children}</span> : null}
      {iconTrailing ? <i className={iconTrailing} aria-hidden="true" /> : null}
    </Tag>
  );
}
