import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('shows value / max', () => {
    render(<Stepper value={3} max={5} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('/ 5')).toBeInTheDocument();
  });

  it('increments and decrements by one', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Stepper value={3} max={5} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(4);

    rerender(<Stepper value={3} max={5} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables + at max and − at min', () => {
    const { rerender } = render(<Stepper value={5} max={5} min={0} />);
    expect(screen.getByLabelText('Increase')).toBeDisabled();
    expect(screen.getByLabelText('Decrease')).toBeEnabled();

    rerender(<Stepper value={0} max={5} min={0} />);
    expect(screen.getByLabelText('Decrease')).toBeDisabled();
    expect(screen.getByLabelText('Increase')).toBeEnabled();
  });

  it('never fires onChange past the bounds', async () => {
    const onChange = vi.fn();
    render(<Stepper value={5} max={5} min={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
