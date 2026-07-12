import type { CSSProperties, HTMLAttributes } from 'react';
import './Stepper.css';

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  /** Target count (e.g. 8 cups, 5 produce colors). */
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  /** Accent color — use the goal's `--goal-*` token. */
  color?: string;
}

type AccentStyle = CSSProperties & { '--_c'?: string };

/**
 * Big-target −/+ number stepper — the logging control for count goals (water
 * cups, produce colors). 40px round buttons for easy one-handed / older-user
 * tapping; shows "value / max".
 */
export function Stepper({
  value = 0,
  max = 8,
  min = 0,
  onChange = () => {},
  color = 'var(--evergreen)',
  className = '',
  style = {},
  ...rest
}: StepperProps) {
  const mergedStyle: AccentStyle = { '--_c': color, ...style };
  return (
    <div className={['vt-stepper', className].filter(Boolean).join(' ')} style={mergedStyle} {...rest}>
      <button
        type="button"
        className="vt-stepper__btn"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <i className="ph-bold ph-minus" aria-hidden="true" />
      </button>
      <span className="vt-stepper__val" aria-live="polite">{value}<small> / {max}</small></span>
      <button
        type="button"
        className="vt-stepper__btn"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <i className="ph-bold ph-plus" aria-hidden="true" />
      </button>
    </div>
  );
}
