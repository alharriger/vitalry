import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DayScore } from './DayScore';

describe('DayScore', () => {
  it('exposes an accessible "N of M goals" label', () => {
    render(<DayScore done={6} total={9} />);
    expect(screen.getByRole('img', { name: '6 of 9 goals' })).toBeInTheDocument();
  });

  it('shows the completed count and total', () => {
    render(<DayScore done={6} total={9} />);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('of 9 goals')).toBeInTheDocument();
  });

  it('marks a perfect day (done >= total) with the perfect modifier', () => {
    const { container, rerender } = render(<DayScore done={8} total={9} />);
    expect(container.querySelector('.vt-dayscore')).not.toHaveClass('vt-dayscore--perfect');
    rerender(<DayScore done={9} total={9} />);
    expect(container.querySelector('.vt-dayscore')).toHaveClass('vt-dayscore--perfect');
  });

  it('renders points only when provided', () => {
    const { rerender } = render(<DayScore done={9} total={9} points={12} />);
    expect(screen.getByText('12 pts today')).toBeInTheDocument();
    rerender(<DayScore done={9} total={9} />);
    expect(screen.queryByText(/pts today/)).not.toBeInTheDocument();
  });
});
