import type { ButtonHTMLAttributes } from 'react';
import { DAILY_9 } from '../../lib/goals';
import './LeaderboardRow.css';

export interface LeaderboardRowProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** 1-based rank. The top 3 render a tinted medal tile. */
  rank: number;
  name: string;
  /** Total competition points. */
  points: number;
  /** Goals completed today — fills the 9-pip "today" tracker. */
  doneToday: number;
  /** Total goals (9 in v1) — the number of pips. */
  total?: number;
  /** Current streak; the flame goes gray at 0. */
  streak: number;
  /** Highlight this row as the current player. */
  isYou?: boolean;
  /** Avatar background (token/hex) — keep consistent with the player's Avatar. */
  avatarColor: string;
  /** Open this player's day-by-day breakdown. */
  onOpen: () => void;
}

/** The nine Daily-9 category colors, in order — the filled-pip palette. */
const GOAL_COLORS = DAILY_9.map((g) => g.color);

/** Two-letter initials from a name (first + last), for the avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/**
 * One row of the leaderboard. Instead of a generic points list, each player
 * shows a 9-pip "today" tracker in the Daily-9 category colors — reinforcing
 * that the score is goal completion, never raw stats (product principle #1).
 * The rank tile is tinted gold/silver/bronze for the top three. Tapping opens
 * that player's day-by-day breakdown (the transparency requirement).
 */
export function LeaderboardRow({
  rank,
  name,
  points,
  doneToday,
  total = 9,
  streak,
  isYou = false,
  avatarColor,
  onOpen,
  className = '',
  ...rest
}: LeaderboardRowProps) {
  const cls = ['vt-lb', isYou ? 'vt-lb--you' : '', className].filter(Boolean).join(' ');
  const filled = Math.max(0, Math.min(doneToday, total));

  return (
    <button
      type="button"
      className={cls}
      onClick={onOpen}
      aria-label={`${name}${isYou ? ' (you)' : ''}, rank ${rank}, ${points} points, ${doneToday} of ${total} goals today, streak ${streak}. See breakdown.`}
      {...rest}
    >
      <span className={`vt-lb__rank vt-lb__rank--${rank <= 3 ? rank : 'n'}`} aria-hidden="true">
        {rank}
      </span>
      <span className="vt-lb__avatar" style={{ background: avatarColor }} aria-hidden="true">
        {initials(name)}
      </span>
      <span className="vt-lb__body">
        <span className="vt-lb__name">
          {name}
          {isYou ? <span className="vt-lb__you-tag">You</span> : null}
        </span>
        <span className="vt-lb__pips" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className="vt-lb__pip"
              style={i < filled ? { background: GOAL_COLORS[i % GOAL_COLORS.length] } : undefined}
            />
          ))}
        </span>
      </span>
      <span className="vt-lb__right">
        <span className="vt-lb__pts-num">{points}</span>
        <span className="vt-lb__pts-label">points</span>
        <span className={`vt-lb__streak${streak > 0 ? '' : ' vt-lb__streak--0'}`}>
          <i className={streak > 0 ? 'ph-fill ph-fire' : 'ph-bold ph-fire'} aria-hidden="true" />
          {streak}
        </span>
      </span>
    </button>
  );
}
