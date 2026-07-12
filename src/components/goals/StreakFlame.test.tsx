import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakFlame } from './StreakFlame';

describe('StreakFlame', () => {
  it('shows the count with an accessible label', () => {
    render(<StreakFlame count={11} />);
    expect(screen.getByLabelText('11 day streak')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('is active (pulsing) when the streak is alive', () => {
    const { container } = render(<StreakFlame count={3} />);
    expect(container.querySelector('.vt-streak')).toHaveClass('vt-streak--active');
    expect(container.querySelector('.vt-streak')).not.toHaveClass('vt-streak--muted');
  });

  it('is muted at zero', () => {
    const { container } = render(<StreakFlame count={0} />);
    expect(container.querySelector('.vt-streak')).toHaveClass('vt-streak--muted');
    expect(container.querySelector('.vt-streak')).not.toHaveClass('vt-streak--active');
  });
});
