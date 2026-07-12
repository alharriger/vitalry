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
.vt-goal {
  --_c: var(--green-600);
  width: 100%;
  background: var(--surface-card);
  border: var(--border-thin) solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-spring);
  box-sizing: border-box;
}
.vt-goal--tappable { cursor: pointer; appearance: none; font: inherit; color: inherit; text-align: left; display: block; }
.vt-goal--tappable:active { transform: scale(0.99); }
.vt-goal--tappable:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.vt-goal--done {
  background: color-mix(in srgb, var(--_c) 9%, var(--surface-card));
  border-color: color-mix(in srgb, var(--_c) 45%, transparent);
}
.vt-goal__top { display: flex; align-items: center; gap: var(--space-3); min-height: 46px; }
.vt-goal__disc {
  flex: none;
  width: 46px; height: 46px;
  border-radius: var(--radius-md);
  display: grid; place-items: center;
  background: color-mix(in srgb, var(--_c) 15%, transparent);
  color: var(--_c);
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.vt-goal__disc .ph, .vt-goal__disc [class*="ph-"] { font-size: 26px; line-height: 1; }
.vt-goal--done .vt-goal__disc { background: var(--_c); color: #fff; }
.vt-goal__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.vt-goal__name {
  display: block;
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--text-lg);
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vt-goal__target {
  display: block;
  font-family: var(--font-body);
  font-weight: var(--fw-semibold);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vt-goal__check {
  flex: none;
  width: 40px; height: 40px;
  border-radius: 50%;
  display: grid; place-items: center;
  border: 2.5px solid var(--border-strong);
  background: transparent;
  color: transparent;
  transition: all var(--dur-base) var(--ease-spring);
}
.vt-goal__check .ph, .vt-goal__check [class*="ph-"] { font-size: 24px; }
.vt-goal--done .vt-goal__check { border-color: var(--_c); background: var(--_c); color: #fff; }
.vt-goal__control { flex: none; display: flex; align-items: center; }

/* Compact the trailing counter control so counter rows match the height of
   simple check rows and the title never wraps. Applies wherever a Stepper is
   nested inside a GoalRow. */
.vt-goal__control .vt-stepper { gap: 5px; }
.vt-goal__control .vt-stepper__btn { width: 36px; height: 36px; border-width: 2px; }
.vt-goal__control .vt-stepper__btn .ph, .vt-goal__control .vt-stepper__btn [class*="ph-"] { font-size: 18px; }
.vt-goal__control .vt-stepper__val { min-width: 30px; font-size: var(--text-lg); }
.vt-goal__control .vt-stepper__val small { font-size: var(--text-xs); }
`;

/**
 * A single Daily-9 goal row. Simple goals are one big tappable check. Counter
 * goals (rainbow, water) pass their control (a compact Stepper) as children —
 * it sits inline on the right of the row; the description stays under the title.
 */
export function GoalRow({
  name,
  target,
  icon,
  color = 'var(--green-600)',
  done = false,
  onToggle,
  interactive = true,
  children,              // trailing control (a compact Stepper) — renders inline
  className = '',
  style = {},
  ...rest
}) {
  useStyles('vt-goal-styles', CSS);
  const hasControl = !!children;
  const tappable = interactive && !hasControl;
  const Tag = tappable ? 'button' : 'div';
  const cls = [
    'vt-goal',
    tappable ? 'vt-goal--tappable' : '',
    done ? 'vt-goal--done' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      className={cls}
      style={{ '--_c': color, ...style }}
      type={tappable ? 'button' : undefined}
      aria-pressed={tappable ? done : undefined}
      onClick={tappable ? onToggle : undefined}
      {...rest}
    >
      <div className="vt-goal__top">
        <span className="vt-goal__disc">{icon ? <i className={icon} aria-hidden="true" /> : null}</span>
        <span className="vt-goal__body">
          <span className="vt-goal__name">{name}</span>
          {target ? <span className="vt-goal__target">{target}</span> : null}
        </span>
        {hasControl
          ? <span className="vt-goal__control">{children}</span>
          : <span className="vt-goal__check"><i className="ph-bold ph-check" aria-hidden="true" /></span>}
      </div>
    </Tag>
  );
}
