import * as React from 'react';

export interface SegmentedOption {
  value: string;
  label: string;
  /** Optional smaller line under the label, e.g. "days". */
  sublabel?: string;
  /** Optional Phosphor icon class. */
  icon?: string;
}

export interface SegmentedControlProps {
  options: (SegmentedOption | string)[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * Equal-width pill segmented selector — the 7/14/30-day duration picker and
 * other small mutually-exclusive choices. Min 44px tall for easy tapping.
 */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
