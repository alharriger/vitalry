import type { HTMLAttributes } from 'react';
import './TabBar.css';

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

export interface TabBarProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: TabItem[];
  active?: string;
  onChange?: (key: string) => void;
}

/**
 * Bottom tab bar — primary navigation. Everything is ≤2 taps from Today.
 * Active icon fills; a dot marks a pending daily check-in.
 */
export function TabBar({ items, active, onChange, className = '', ...rest }: TabBarProps) {
  return (
    <nav className={['vt-tabbar', className].filter(Boolean).join(' ')} {...rest}>
      {items.map((it) => {
        const isActive = it.key === active;
        const icon = isActive ? (it.iconActive ?? it.icon.replace('ph-bold', 'ph-fill')) : it.icon;
        return (
          <button
            key={it.key}
            type="button"
            className="vt-tab"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange?.(it.key)}
          >
            <i className={icon} aria-hidden="true" />
            {it.dot ? <span className="vt-tab__dot" /> : null}
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
