import type { CSSProperties, HTMLAttributes } from 'react';
import { colorForName } from '../../lib/avatarColor';
import './Avatar.css';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
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

function initials(name = ''): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

type BgStyle = CSSProperties & { '--_bg'?: string };

/**
 * Round player avatar. With no image, renders initials on a color
 * deterministically derived from the name (from the refined avatar palette).
 */
export function Avatar({
  name = '',
  src,
  size = 'md',
  color,
  ring = false,
  className = '',
  style = {},
  ...rest
}: AvatarProps) {
  const cls = ['vt-avatar', `vt-avatar--${size}`, ring ? 'vt-avatar--ring' : '', className]
    .filter(Boolean).join(' ');
  const bg = color ?? colorForName(name);
  const mergedStyle: BgStyle = { '--_bg': bg, ...style };
  return (
    <span className={cls} style={mergedStyle} aria-label={name || undefined} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
