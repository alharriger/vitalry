import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodayScreen } from './TodayScreen';
import { TodayLogProvider } from '../lib/useTodayLog';
import { GOAL_COUNT } from '../lib/goals';

// A start date safely in the past so today falls inside the scoring window
// regardless of when the suite runs (kept small — a week — so the engine walks
// a tiny range).
function weekAgo(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

const upsertDayLog = vi.fn(async (..._args: unknown[]) => {});

vi.mock('../lib/auth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, session: {}, loading: false, signInWithOtp: vi.fn(), signOut: vi.fn() }),
}));

vi.mock('../lib/dailyLogs', () => ({
  loadViewerProfile: vi.fn(async () => ({ name: 'Amber', timezone: 'America/New_York' })),
  findActiveCompetition: vi.fn(async () => ({
    id: 'c1',
    name: 'Test Competition',
    startDate: weekAgo(),
    durationDays: 14,
    scoringRules: null,
  })),
  loadUserLogs: vi.fn(async () => ({})),
  updateProfileTimezone: vi.fn(async () => {}),
  upsertDayLog: (...args: unknown[]) => upsertDayLog(...args),
}));

function renderToday() {
  return render(
    <TodayLogProvider>
      <TodayScreen />
    </TodayLogProvider>,
  );
}

describe('TodayScreen', () => {
  beforeEach(() => upsertDayLog.mockClear());

  it('renders all nine Daily-9 goals once live data loads', async () => {
    renderToday();
    for (const name of ['Eat the rainbow', 'Protein', 'Fiber', 'Move', 'Sweat or strength', 'Fresh air', 'Water', 'Sleep', 'Mind']) {
      expect(await screen.findByText(name)).toBeInTheDocument();
    }
  });

  it('increments the score dial and autosaves when a pending goal is tapped', async () => {
    renderToday();
    await screen.findByText('Fiber'); // wait for load

    const before = screen.getByRole('img', { name: new RegExp(`of ${GOAL_COUNT} goals`) });
    const startDone = Number(before.getAttribute('aria-label')!.split(' ')[0]);

    await userEvent.click(screen.getByRole('button', { name: /Fiber/i }));

    const after = screen.getByRole('img', { name: new RegExp(`of ${GOAL_COUNT} goals`) });
    const endDone = Number(after.getAttribute('aria-label')!.split(' ')[0]);
    expect(endDone).toBe(startDone + 1);

    // The tap is persisted via an upsert (autosave, no Save button).
    await waitFor(() => expect(upsertDayLog).toHaveBeenCalled());
  });

  it('shows the grace-window rule', async () => {
    renderToday();
    expect(await screen.findByText(/editable until midnight/i)).toBeInTheDocument();
  });
});
