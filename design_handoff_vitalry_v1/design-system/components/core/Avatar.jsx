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
.vt-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  color: #fff;
  overflow: hidden;
  flex: none;
  background: var(--_bg, var(--green-500));
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.35);
}
.vt-avatar img { width: 100%; height: 100%; object-fit: cover; }
.vt-avatar--xs { width: 28px; height: 28px; font-size: 12px; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.35); }
.vt-avatar--sm { width: 36px; height: 36px; font-size: 15px; }
.vt-avatar--md { width: 44px; height: 44px; font-size: 18px; }
.vt-avatar--lg { width: 56px; height: 56px; font-size: 22px; }
.vt-avatar--xl { width: 76px; height: 76px; font-size: 30px; }
.vt-avatar--ring { outline: 3px solid var(--gold); outline-offset: 2px; }
`;

/* Deterministic color from a name, drawn from the refined avatar palette. */
const PALETTE = [
  'var(--avatar-clay)', 'var(--avatar-pine)', 'var(--avatar-plum)',
  'var(--avatar-ochre)', 'var(--avatar-denim)', 'var(--avatar-mulberry)',
  'var(--avatar-olive)', 'var(--avatar-lagoon)',
];
function colorFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

/**
 * Round avatar — image, or auto-colored initials derived from the name.
 */
export function Avatar({
  name = '',
  src,
  size = 'md',
  color,          // override the auto color
  ring = false,   // gold winner ring
  className = '',
  style = {},
  ...rest
}) {
  useStyles('vt-avatar-styles', CSS);
  const cls = ['vt-avatar', `vt-avatar--${size}`, ring ? 'vt-avatar--ring' : '', className]
    .filter(Boolean).join(' ');
  const bg = color || colorFor(name);
  return (
    <span className={cls} style={{ '--_bg': bg, ...style }} aria-label={name || undefined} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
