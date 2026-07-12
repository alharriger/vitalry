import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalRow } from './GoalRow';
import { Stepper } from './Stepper';

describe('GoalRow', () => {
  it('renders name and target', () => {
    render(<GoalRow name="Fresh air" target="20 min outside" />);
    expect(screen.getByText('Fresh air')).toBeInTheDocument();
    expect(screen.getByText('20 min outside')).toBeInTheDocument();
  });

  it('check goal is a button that toggles', async () => {
    const onToggle = vi.fn();
    render(<GoalRow name="Sleep" onToggle={onToggle} />);
    const row = screen.getByRole('button');
    await userEvent.click(row);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('reflects done state via aria-pressed', () => {
    const { rerender } = render(<GoalRow name="Sleep" done={false} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(<GoalRow name="Sleep" done onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('counter goal (with control) is not a toggle button', () => {
    render(
      <GoalRow name="Water" target="8 cups" interactive={false}>
        <Stepper value={2} max={8} />
      </GoalRow>,
    );
    // The only buttons present are the stepper's − / +, not a row toggle.
    expect(screen.queryByRole('button', { name: /Water/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Increase')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument();
  });
});
