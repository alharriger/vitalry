import { test, expect } from '@playwright/test';

test.describe('Today check-in', () => {
  test('loads and shows the daily check-in', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('of 9 goals')).toBeVisible();
    await expect(page.getByText('Eat the rainbow')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('tapping a pending goal advances the score', async ({ page }) => {
    await page.goto('/');
    const dial = page.getByRole('img', { name: /of 9 goals/ });
    const before = Number((await dial.getAttribute('aria-label'))!.split(' ')[0]);

    await page.getByRole('button', { name: /Fiber/i }).click();

    const after = Number((await dial.getAttribute('aria-label'))!.split(' ')[0]);
    expect(after).toBe(before + 1);
  });

  test('steps back to yesterday and edits it (grace window)', async ({ page }) => {
    await page.goto('/');

    // On today: cannot step into the future, but yesterday is reachable.
    const next = page.getByRole('button', { name: 'Next day' });
    const prev = page.getByRole('button', { name: 'Previous day' });
    await expect(next).toBeDisabled();
    await expect(prev).toBeEnabled();
    await expect(page.getByText(/Day \d+ of \d+ · today/)).toBeVisible();

    // Step to yesterday — the caption drops "· today".
    await prev.click();
    await expect(page.getByText(/Day \d+ of \d+$/)).toBeVisible();

    // Yesterday is editable: tapping a pending goal advances that day's score.
    const dial = page.getByRole('img', { name: /of 9 goals/ });
    const before = Number((await dial.getAttribute('aria-label'))!.split(' ')[0]);
    await page.getByRole('button', { name: /Fiber/i }).click();
    const after = Number((await dial.getAttribute('aria-label'))!.split(' ')[0]);
    expect(after).toBe(before + 1);

    // Stepping forward returns to today.
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByText(/Day \d+ of \d+ · today/)).toBeVisible();
  });

  test('steps back to a past day as a read-only record', async ({ page }) => {
    await page.goto('/');

    const prev = page.getByRole('button', { name: 'Previous day' });
    const next = page.getByRole('button', { name: 'Next day' });

    // Step past yesterday into a locked past day (the E2E comp starts a few days
    // back and has no logs, so it lands on the missed-day view).
    await prev.click(); // yesterday (editable)
    await prev.click(); // two days ago (read-only)

    // Unmistakably non-interactive: lock banner + a single "Back to today" action.
    await expect(page.getByText(/looking back at a past day/i)).toBeVisible();
    await expect(page.getByText('Nothing logged this day')).toBeVisible();
    await expect(page.getByText('What was logged')).toBeVisible();
    const backToToday = page.getByRole('button', { name: /Back to today/i });
    await expect(backToToday).toBeVisible();

    // The goals are records now, not toggles — no goal button to tap.
    await expect(page.getByRole('button', { name: /Fiber/i })).toHaveCount(0);

    // "Back to today" returns to the editable today.
    await backToToday.click();
    await expect(page.getByText(/Day \d+ of \d+ · today/)).toBeVisible();
    await expect(next).toBeDisabled();
  });

  test('navigates between tabs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Standings/i }).click();
    await expect(page.getByRole('heading', { name: 'Standings' })).toBeVisible();
  });
});
