import * as React from 'react';

/**
 * @startingPoint section="Core" subtitle="Rounded surface container" viewport="700x220"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `feature`/`raised` lift with shadow; `tint` uses warm cream; `flat` removes shadow. */
  variant?: 'default' | 'flat' | 'raised' | 'feature' | 'tint';
  /** Override the default 20px padding. */
  pad?: 'sm' | 'lg';
  /** Adds a colored left accent bar — pass a goal-category token for context. */
  accentColor?: string;
  /** Adds hover/press affordance for tappable cards. */
  interactive?: boolean;
  children?: React.ReactNode;
}

/**
 * Rounded surface container — the primary way content sits on the warm app
 * background. Compose goal rows, leaderboard rows, and stats inside it.
 */
export function Card(props: CardProps): JSX.Element;
