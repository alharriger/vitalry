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
.vt-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-body);
  font-weight: var(--fw-extra);
  font-size: var(--text-sm);
  line-height: 1;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  --_bg: var(--surface-sunken);
  --_fg: var(--text-secondary);
  background: var(--_bg);
  color: var(--_fg);
}
.vt-badge--solid  { background: var(--_solid, var(--green-600)); color: #fff; }
.vt-badge--tint   { background: color-mix(in srgb, var(--_solid, var(--green-500)) 16%, transparent); color: var(--_solid, var(--green-700)); }
.vt-badge--outline{ background: transparent; color: var(--_solid, var(--green-700)); box-shadow: inset 0 0 0 1.5px var(--_solid, var(--green-500)); }
.vt-badge--sm { font-size: var(--text-xs); padding: 4px 9px; }
.vt-badge--lg { font-size: var(--text-base); padding: 8px 15px; }
.vt-badge .ph, .vt-badge [class*="ph-"] { font-size: 1.15em; }
.vt-badge__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--_solid, currentColor); }
`;

/**
 * Compact status / count pill. Use `color` (a token or hex) to tint.
 */
export function Badge({
  children,
  variant = 'tint',      // 'solid' | 'tint' | 'outline' | 'neutral'
  color,                 // e.g. "var(--goal-water)" — drives solid/tint/outline
  size = 'md',
  icon,                  // phosphor class
  dot = false,           // leading status dot
  className = '',
  style = {},
  ...rest
}) {
  useStyles('vt-badge-styles', CSS);
  const cls = [
    'vt-badge',
    variant !== 'neutral' ? `vt-badge--${variant}` : '',
    size !== 'md' ? `vt-badge--${size}` : '',
    className,
  ].filter(Boolean).join(' ');
  const mergedStyle = color ? { '--_solid': color, ...style } : style;
  return (
    <span className={cls} style={mergedStyle} {...rest}>
      {dot ? <span className="vt-badge__dot" /> : null}
      {icon ? <i className={icon} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
