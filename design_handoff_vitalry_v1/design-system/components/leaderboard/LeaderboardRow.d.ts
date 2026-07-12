import * as React from 'react';

/**
 * @startingPoint section="Leaderboard" subtitle="Ranked player row" viewport="440x76"
 */
export interface LeaderboardRowProps extends React.HTMLAttributes<HTMLButtonElement> {
  /** 1-based rank. Top 3 render a medal instead of the number. */
  rank: number;
  name: string;
  /** Total competition points. */
  points?: number;
  /** Goals completed today (keeps the board feeling alive mid-day). */
  doneToday?: number;
  total?: number;
  /** Current streak; flame goes gray at 0. */
  streak?: number;
  /** Highlight this row as the current player. */
  isYou?: boolean;
  /** Avatar background (token/hex) — keep consistent with Avatar per player. */
  avatarColor?: string;
  onClick?: () => void;
}

/**
 * One leaderboard row — rank/medal, avatar, name, today's progress, streak,
 * and total points. Ranking is by goal completion only (never raw stats).
 * Tap opens that player's day-by-day breakdown (transparency requirement).
 */
export function LeaderboardRow(props: LeaderboardRowProps): JSX.Element;
