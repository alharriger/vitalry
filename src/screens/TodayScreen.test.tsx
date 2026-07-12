import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodayScreen } from './TodayScreen';
import { GOAL_COUNT } from '../lib/goals';

describe('TodayScreen', () => {
  it('renders all nine Daily-9 goals', () => {
    render(<TodayScreen />);
    // Names from the seed list.
    for (const name of ['Eat the rainbow', 'Protein', 'Fiber', 'Move', 'Sweat or strength', 'Fresh air', 'Water', 'Sleep', 'Mind']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('increments the score dial when a pending goal is tapped', async () => {
    render(<TodayScreen />);
    // Seed state has 5 goals done (protein, move, air, sleep + none of the
    // counters complete). Tapping "Fiber" (pending) adds one.
    const before = screen.getByRole('img', { name: new RegExp(`of ${GOAL_COUNT} goals`) });
    const startDone = Number(before.getAttribute('aria-label')!.split(' ')[0]);

    await userEvent.click(screen.getByRole('button', { name: /Fiber/i }));

    const after = screen.getByRole('img', { name: new RegExp(`of ${GOAL_COUNT} goals`) });
    const endDone = Number(after.getAttribute('aria-label')!.split(' ')[0]);
    expect(endDone).toBe(startDone + 1);
  });

  it('shows the grace-window hint', () => {
    render(<TodayScreen />);
    expect(screen.getByText(/still editable until midnight/i)).toBeInTheDocument();
  });
});
