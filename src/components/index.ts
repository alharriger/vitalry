/** Vitalry design-system components, ported to typed React from the design
 *  handoff (design_handoff_vitalry_v1/design-system/components). */

// Core UI
export { Button, type ButtonProps } from './ui/Button';
export { Card, type CardProps } from './ui/Card';
export { Badge, type BadgeProps } from './ui/Badge';
export { Avatar, type AvatarProps } from './ui/Avatar';
export { colorForName } from '../lib/avatarColor';
export { ProgressRing, type ProgressRingProps } from './ui/ProgressRing';
export { TabBar, type TabBarProps, type TabItem } from './ui/TabBar';
export { SaveIndicator, type SaveIndicatorProps } from './ui/SaveIndicator';
export { Wordmark, type WordmarkProps } from './ui/Wordmark';
export { Mark, type MarkProps, type MarkVariant } from './ui/Mark';
export { Logo, type LogoProps } from './ui/Logo';

// Day browser
export { DateNav, type DateNavProps } from './day/DateNav';

// Goals (signature)
export { GoalRow, type GoalRowProps } from './goals/GoalRow';
export { Stepper, type StepperProps } from './goals/Stepper';
export { StreakFlame, type StreakFlameProps } from './goals/StreakFlame';
export { DayScore, type DayScoreProps } from './goals/DayScore';
