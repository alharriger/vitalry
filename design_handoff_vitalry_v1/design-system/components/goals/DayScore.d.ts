import * as React from 'react';

/**
 * @startingPoint section="Goals" subtitle="Daily score dial (goals of 9)" viewport="360x260"
 */
export interface DayScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Goals completed today. */
  done?: number;
  /** Total goals (9 in v1). */
  total?: number;
  /** Optional daily points earned, shown under the ring. */
  points?: number;
  /** Diameter in px. */
  size?: number;
  thickness?: number;
}

/**
 * The Today screen's hero dial — goals-completed of 9, with a big central
 * numeral. Fills a lighter green in progress, deepening to the full brand green
 * at a perfect 9/9.
 */
export function DayScore(props: DayScoreProps): JSX.Element;
