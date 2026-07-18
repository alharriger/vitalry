import type { HTMLAttributes } from 'react';
import type { SaveStatus } from '../../lib/useTodayLog';
import './SaveIndicator.css';

export interface SaveIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  status: SaveStatus;
}

/**
 * The autosave status line for Today. There is no Save button (decided UX) — a
 * tap saves immediately and this quietly reports how it's going: mid-write,
 * settled, or retrying. Warm and reassuring, never alarming; a hiccup says
 * "retrying", not "failed".
 *
 * `idle` (a freshly-loaded, untouched day) renders nothing — there's nothing to
 * report until the viewer actually changes something.
 */
const COPY: Record<Exclude<SaveStatus, 'idle'>, { icon: string; text: string }> = {
  saving: { icon: 'ph-bold ph-cloud-arrow-up', text: 'Saving…' },
  saved: { icon: 'ph-fill ph-check-circle', text: 'All saved' },
  error: { icon: 'ph-bold ph-cloud-slash', text: "Couldn't save — retrying" },
};

export function SaveIndicator({ status, className = '', ...rest }: SaveIndicatorProps) {
  if (status === 'idle') return <div className={`vt-save vt-save--idle ${className}`} {...rest} />;

  const { icon, text } = COPY[status];
  const cls = ['vt-save', `vt-save--${status}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="status" aria-live="polite" {...rest}>
      <i className={icon} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
