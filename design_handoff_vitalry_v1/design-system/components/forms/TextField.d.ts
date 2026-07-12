import * as React from 'react';

export interface TextFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Leading Phosphor icon class. */
  icon?: string;
  /** Helper text below the field. */
  helper?: string;
  /** Error message — turns the field red and replaces the helper. */
  error?: string;
  id?: string;
  className?: string;
  type?: string;
  maxLength?: number;
}

/**
 * Labeled text input for names, group names, and free-text prizes. By product
 * principle the app never asks for numeric entry — do not use this for logging.
 */
export function TextField(props: TextFieldProps): JSX.Element;
