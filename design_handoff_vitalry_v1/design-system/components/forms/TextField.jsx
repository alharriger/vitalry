import React from 'react';

function useStyles(id, css) {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}

const CSS = `
.vt-field { display: flex; flex-direction: column; gap: 6px; }
.vt-field__label {
  font-family: var(--font-body);
  font-weight: var(--fw-bold);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.vt-field__box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--surface-card);
  border: var(--border-thin) solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 var(--space-4);
  height: var(--control-lg);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.vt-field__box:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--focus-ring);
}
.vt-field__box .ph, .vt-field__box [class*="ph-"] { color: var(--text-muted); font-size: 1.3em; }
.vt-field__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-body);
  font-weight: var(--fw-semibold);
  font-size: var(--text-base);
  color: var(--text-primary);
  min-width: 0;
}
.vt-field__input::placeholder { color: var(--text-muted); font-weight: var(--fw-regular); }
.vt-field--error .vt-field__box { border-color: var(--danger); }
.vt-field--error .vt-field__box:focus-within { box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 30%, transparent); }
.vt-field__help { font-size: var(--text-sm); color: var(--text-muted); }
.vt-field__help--error { color: var(--danger); font-weight: var(--fw-bold); }
`;

/**
 * Labeled text input. No number entry anywhere in the product — this is for
 * names, group names, and free-text prizes ("loser hosts Thanksgiving").
 */
export function TextField({
  label,
  value,
  onChange = () => {},
  placeholder,
  icon,             // phosphor class
  helper,
  error,
  id,
  className = '',
  ...rest
}) {
  useStyles('vt-field-styles', CSS);
  const inputId = id || (label ? `vt-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const cls = ['vt-field', error ? 'vt-field--error' : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {label ? <label className="vt-field__label" htmlFor={inputId}>{label}</label> : null}
      <div className="vt-field__box">
        {icon ? <i className={icon} aria-hidden="true" /> : null}
        <input
          id={inputId}
          className="vt-field__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value, e)}
          {...rest}
        />
      </div>
      {error ? (
        <span className="vt-field__help vt-field__help--error">{error}</span>
      ) : helper ? (
        <span className="vt-field__help">{helper}</span>
      ) : null}
    </div>
  );
}
