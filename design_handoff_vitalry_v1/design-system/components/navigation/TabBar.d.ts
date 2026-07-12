import * as React from 'react';

export interface TabItem {
  key: string;
  label: string;
  /** Phosphor icon class for the inactive state, e.g. "ph-bold ph-house". */
  icon: string;
  /** Optional explicit active icon; defaults to swapping ph-bold → ph-fill. */
  iconActive?: string;
  /** Show a pending-action dot (e.g. check-in not done). */
  dot?: boolean;
}

/**
 * @startingPoint section="Navigation" subtitle="Bottom tab navigation bar" viewport="440x120"
 */
export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  items: TabItem[];
  active?: string;
  onChange?: (key: string) => void;
}

/**
 * Bottom tab bar — primary navigation. Everything is ≤2 taps from Today.
 * Active icon fills; a flame dot marks a pending daily check-in.
 */
export function TabBar(props: TabBarProps): JSX.Element;
