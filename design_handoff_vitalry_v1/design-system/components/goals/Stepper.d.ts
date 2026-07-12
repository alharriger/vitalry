import * as React from 'react';

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  /** Target count (e.g. 8 cups, 5 produce colors). */
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  /** Accent color — use the goal's `--goal-*` token. */
  color?: string;
}

/**
 * Big-target −/+ number stepper — the logging control for count goals (water
 * cups, produce colors). 48px round buttons for easy one-handed / older-user
 * tapping; shows "value / max". Replaces per-unit dot/glass grids so nothing
 * overflows and the interaction stays dead simple.
 */
export function Stepper(props: StepperProps): JSX.Element;
