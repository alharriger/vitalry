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

  test('navigates between tabs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Standings/i }).click();
    await expect(page.getByRole('heading', { name: 'Standings' })).toBeVisible();
  });
});
