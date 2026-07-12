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
.vt-lb {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 12px 14px;
  background: var(--surface-card);
  border: var(--border-hair) solid var(--border-subtle);
  border-radius: var(--radius-lg);
  text-align: left;
  appearance: none; font: inherit; color: inherit;
  cursor: pointer;
  box-sizing: border-box;
  transition: transform var(--dur-fast) var(--ease-spring), box-shadow var(--dur-base) var(--ease-out);
}
.vt-lb:active { transform: scale(0.99); }
.vt-lb:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.vt-lb--you { background: var(--mint-200); border-color: color-mix(in srgb, var(--evergreen) 35%, transparent); }

/* rank tile — rounded square, tinted by standing (original, not a medal list) */
.vt-lb__rank {
  flex: none; width: 34px; height: 34px;
  border-radius: var(--radius-sm);
  display: grid; place-items: center;
  font-family: var(--font-display); font-weight: var(--fw-extra);
  font-size: var(--text-lg);
  background: color-mix(in srgb, var(--evergreen) 12%, transparent);
  color: var(--evergreen);
}
.vt-lb__rank--1 { background: color-mix(in srgb, var(--sun-400) 26%, transparent); color: #8A6410; }
.vt-lb__rank--2 { background: #E4E6EA; color: #7C818B; }
.vt-lb__rank--3 { background: #F0E0CF; color: #A9702F; }

.vt-lb__avatar {
  flex: none; width: 42px; height: 42px; border-radius: 50%;
  display: grid; place-items: center;
  font-family: var(--font-display); font-weight: var(--fw-bold);
  font-size: 17px; color: #fff;
  background: var(--_ac, var(--avatar-pine));
  box-shadow: inset 0 0 0 3px rgba(255,255,255,0.35);
}
.vt-lb__body { flex: 1; min-width: 0; }
.vt-lb__name {
  font-family: var(--font-display); font-weight: var(--fw-bold);
  font-size: var(--text-base); color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.15;
}
.vt-lb__you-tag {
  margin-left: 6px; font-family: var(--font-body); font-weight: var(--fw-extra);
  font-size: 10px; color: var(--evergreen);
  text-transform: uppercase; letter-spacing: var(--ls-caps);
}
/* 9-pip today tracker — filled pips use the Daily-9 category colors */
.vt-lb__pips { display: flex; gap: 3px; margin-top: 6px; }
.vt-lb__pip { width: 100%; max-width: 15px; height: 7px; border-radius: 3px; background: var(--surface-sunken); }

.vt-lb__right { flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.vt-lb__pts-num {
  font-family: var(--font-display); font-weight: var(--fw-extra);
  font-size: var(--text-2xl); color: var(--text-primary); line-height: 1;
}
.vt-lb__pts-label {
  font-family: var(--font-body); font-weight: var(--fw-bold);
  font-size: 10px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: var(--ls-caps);
}
.vt-lb__streak {
  display: inline-flex; align-items: center; gap: 3px; margin-top: 3px;
  font-family: var(--font-display); font-weight: var(--fw-extra);
  font-size: var(--text-sm); color: var(--flame-600);
}
.vt-lb__streak--0 { color: var(--text-muted); }
.vt-lb__streak .ph, .vt-lb__streak [class*="ph-"] { font-size: 16px; }
`;

const GOAL_COLORS = [
  'var(--goal-rainbow)', 'var(--goal-protein)', 'var(--goal-fiber)',
  'var(--goal-move)', 'var(--goal-sweat)', 'var(--goal-air)',
  'var(--goal-water)', 'var(--goal-sleep)', 'var(--goal-mind)',
];

/**
 * One row of the leaderboard. Instead of a generic XP list, each player shows a
 * 9-pip "today" tracker in the Daily-9 colors — reinforcing that the score is
 * goal completion, never raw stats. Tap opens the day-by-day breakdown.
 */
export function LeaderboardRow({
  rank,
  name,
  points = 0,
  doneToday,
  total = 9,
  streak = 0,
  isYou = false,
  avatarColor = 'var(--avatar-pine)',
  onClick,
  className = '',
  ...rest
}) {
  useStyles('vt-lb-styles', CSS);
  const cls = ['vt-lb', isYou ? 'vt-lb--you' : '', className].filter(Boolean).join(' ');
  const filled = doneToday == null ? 0 : doneToday;

  function initials(n = '') {
    const p = n.trim().split(/\s+/);
    return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?';
  }

  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      <span className={`vt-lb__rank vt-lb__rank--${rank}`}>{rank}</span>
      <span className="vt-lb__avatar" style={{ '--_ac': avatarColor }}>{initials(name)}</span>
      <span className="vt-lb__body">
        <span className="vt-lb__name">{name}{isYou ? <span className="vt-lb__you-tag">You</span> : null}</span>
        {doneToday != null ? (
          <span className="vt-lb__pips" aria-label={`${doneToday} of ${total} goals today`}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className="vt-lb__pip" style={i < filled ? { background: GOAL_COLORS[i % GOAL_COLORS.length] } : undefined} />
            ))}
          </span>
        ) : null}
      </span>
      <span className="vt-lb__right">
        <span className="vt-lb__pts-num">{points}</span>
        <span className="vt-lb__pts-label">points</span>
        <span className={`vt-lb__streak ${streak > 0 ? '' : 'vt-lb__streak--0'}`}>
          <i className={streak > 0 ? 'ph-fill ph-fire' : 'ph-bold ph-fire'} aria-hidden="true" />{streak}
        </span>
      </span>
    </button>
  );
}
