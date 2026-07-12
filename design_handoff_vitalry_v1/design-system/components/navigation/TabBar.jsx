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
.vt-tabbar {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: stretch;
  background: var(--surface-card);
  border-top: var(--border-hair) solid var(--border-subtle);
  padding: 6px max(var(--space-2), env(safe-area-inset-left)) calc(6px + env(safe-area-inset-bottom));
  height: var(--tabbar-h);
}
.vt-tab {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-weight: var(--fw-bold);
  font-size: var(--text-xs);
  border-radius: var(--radius-md);
  position: relative;
  transition: color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring);
}
.vt-tab:active { transform: scale(0.94); }
.vt-tab .ph, .vt-tab [class*="ph-"] { font-size: 25px; line-height: 1; }
.vt-tab[aria-current="page"] { color: var(--evergreen); }
.vt-tab:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: -2px; }
.vt-tab__dot {
  position: absolute;
  top: 6px;
  left: 50%;
  margin-left: 8px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--green-500);
  box-shadow: 0 0 0 2px var(--surface-card);
}
`;

/**
 * Bottom tab bar — the app's primary navigation. Icon switches to Phosphor
 * fill weight when active; a dot flags a pending action (e.g. today's check-in).
 */
export function TabBar({
  items = [],       // [{ key, label, icon, iconActive?, dot? }]
  active,
  onChange = () => {},
  className = '',
  ...rest
}) {
  useStyles('vt-tabbar-styles', CSS);
  return (
    <nav className={['vt-tabbar', className].filter(Boolean).join(' ')} {...rest}>
      {items.map((it) => {
        const isActive = it.key === active;
        const icon = isActive ? (it.iconActive || it.icon.replace('ph-bold', 'ph-fill')) : it.icon;
        return (
          <button
            key={it.key}
            type="button"
            className="vt-tab"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(it.key)}
          >
            <i className={icon} aria-hidden="true" />
            {it.dot ? <span className="vt-tab__dot" /> : null}
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
