import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Display name — used for initials and the auto color. */
  name?: string;
  /** Optional photo URL; falls back to initials. */
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Override the auto-derived background color. */
  color?: string;
  /** Gold ring — used to mark the competition winner. */
  ring?: boolean;
}

/**
 * Round player avatar. With no image, renders initials on a color deterministically
 * derived from the name (drawn from the refined avatar palette — clay, pine, plum,
 * ochre, denim, mulberry, olive, lagoon — kept distinct from the goal-category hues).
 */
export function Avatar(props: AvatarProps): JSX.Element;
