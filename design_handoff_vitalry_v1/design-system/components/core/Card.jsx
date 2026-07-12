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
.vt-card {
  background: var(--surface-card);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  border: var(--border-hair) solid var(--border-subtle);
}
.vt-card--flat    { box-shadow: none; }
.vt-card--raised  { box-shadow: var(--shadow-md); border-color: transparent; border-radius: var(--radius-xl); }
.vt-card--feature { box-shadow: var(--shadow-lg); border-color: transparent; border-radius: var(--radius-2xl); padding: var(--space-6); }
.vt-card--tint    { background: var(--surface-tint); box-shadow: none; border-color: transparent; }
.vt-card--accent  { border-left: 5px solid var(--_accent, var(--green-500)); }
.vt-card--pad-sm  { padding: var(--space-4); }
.vt-card--pad-lg  { padding: var(--space-6); }
.vt-card--interactive { cursor: pointer; transition: transform var(--dur-fast) var(--ease-spring), box-shadow var(--dur-base) var(--ease-out); }
.vt-card--interactive:hover  { box-shadow: var(--shadow-md); }
.vt-card--interactive:active { transform: scale(0.99); }
`;

/**
 * Vitalry surface container. White by default, generously rounded.
 */
export function Card({
  children,
  variant = 'default',
  pad,                 // 'sm' | 'lg' — override default padding
  accentColor,         // any CSS color / var — adds left accent bar
  interactive = false,
  className = '',
  style = {},
  ...rest
}) {
  useStyles('vt-card-styles', CSS);
  const cls = [
    'vt-card',
    variant !== 'default' ? `vt-card--${variant}` : '',
    pad ? `vt-card--pad-${pad}` : '',
    accentColor ? 'vt-card--accent' : '',
    interactive ? 'vt-card--interactive' : '',
    className,
  ].filter(Boolean).join(' ');
  const mergedStyle = accentColor ? { '--_accent': accentColor, ...style } : style;
  return (
    <div className={cls} style={mergedStyle} {...rest}>
      {children}
    </div>
  );
}
