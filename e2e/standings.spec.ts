import { test, expect } from '@playwright/test';

test.describe('Standings — leaderboard + breakdown (Phase 3)', () => {
  test('renders a ranked board with the viewer marked, and days-left + prize header', async ({ page }) => {
    await page.goto('/standings');

    await expect(page.getByRole('heading', { name: 'Standings' })).toBeVisible();
    // Header badges: days remaining + the prize.
    await expect(page.getByText(/days left|Final day/)).toBeVisible();
    await expect(page.getByText('Bragging rights')).toBeVisible();

    // All three stub players are on the board (Amber leads on 3 perfect days).
    const rows = page.locator('.vt-lb');
    await expect(rows).toHaveCount(3);
    // The viewer's own row carries the "You" tag.
    await expect(page.locator('.vt-lb--you')).toContainText('Amber');
    await expect(page.locator('.vt-lb--you .vt-lb__you-tag')).toHaveText('You');
    // Rank 1 is the viewer (best total). First row's rank tile shows "1".
    await expect(rows.first().locator('.vt-lb__rank')).toHaveText('1');
    await expect(rows.first()).toContainText('Amber');
  });

  test('tapping a player opens their day-by-day breakdown, and it closes', async ({ page }) => {
    await page.goto('/standings');

    // Tap Dad's row.
    const dadRow = page.locator('.vt-lb', { hasText: 'Dad' });
    await dadRow.click();

    // The breakdown sheet opens as a modal dialog with day bars, no per-goal detail.
    const sheet = page.getByRole('dialog', { name: "Dad's breakdown" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText(/points ·/)).toBeVisible();
    await expect(sheet.locator('.vt-bd__bar').first()).toBeVisible();
    // Legend confirms it's scores-per-day (day classes), not which goals.
    await expect(sheet.locator('.vt-bd__legend')).toContainText('Active (6+)');

    // The footer Close button dismisses (the grabber also closes, hence .vt-btn).
    await sheet.locator('.vt-btn', { hasText: 'Close' }).click();
    await expect(page.getByRole('dialog', { name: "Dad's breakdown" })).toBeHidden();
  });

  test('breakdown closes on scrim tap and on Escape', async ({ page }) => {
    await page.goto('/standings');
    const momRow = page.locator('.vt-lb', { hasText: 'Mom' });

    // Scrim tap closes.
    await momRow.click();
    await expect(page.getByRole('dialog', { name: "Mom's breakdown" })).toBeVisible();
    await page.locator('.vt-sheet__scrim').click({ position: { x: 10, y: 10 } });
    await expect(page.getByRole('dialog', { name: "Mom's breakdown" })).toBeHidden();

    // Escape closes.
    await momRow.click();
    await expect(page.getByRole('dialog', { name: "Mom's breakdown" })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: "Mom's breakdown" })).toBeHidden();
  });
});
