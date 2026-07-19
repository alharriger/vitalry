import { test, expect } from '@playwright/test';

test.describe('Month-sheet date picker (2.5)', () => {
  test('opens from the centre date button, picks a past day, and closes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('of 9 goals')).toBeVisible();

    // The centre date button is now a picker trigger (opens a dialog).
    const trigger = page.locator('button[aria-haspopup="dialog"]');
    await expect(trigger).toBeVisible();
    await trigger.click();

    // The month sheet opens as a modal dialog with the competition heatmap.
    const sheet = page.getByRole('dialog', { name: 'Jump to a day' });
    await expect(sheet).toBeVisible();

    // Today is marked in the grid (green base bar + aria-current).
    const todayCell = sheet.locator('[aria-current="date"]');
    await expect(todayCell).toHaveCount(1);

    // Tap the first day of the competition (start date, a locked past day).
    await sheet.locator('.vt-sheet__grid button').first().click();

    // Selecting jumps to that day and closes the sheet.
    await expect(sheet).toBeHidden();
    await expect(page.getByText('Looking back')).toBeVisible();
    await expect(page.getByText(/logging is locked/i)).toBeVisible();
  });

  test('closes on scrim tap and on Escape without navigating', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('button[aria-haspopup="dialog"]');

    // Scrim tap closes.
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Jump to a day' })).toBeVisible();
    await page.locator('.vt-sheet__scrim').click({ position: { x: 10, y: 10 } });
    await expect(page.getByRole('dialog', { name: 'Jump to a day' })).toBeHidden();

    // Escape closes. Still on today (we never selected a day).
    await trigger.click();
    await expect(page.getByRole('dialog', { name: 'Jump to a day' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Jump to a day' })).toBeHidden();
    await expect(page.getByText(/Day \d+ of \d+ · today/)).toBeVisible();
  });

  test('swiping the handle down dismisses the sheet', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-haspopup="dialog"]').click();
    const sheet = page.getByRole('dialog', { name: 'Jump to a day' });
    await expect(sheet).toBeVisible();

    // Wait for the rise animation to settle before measuring — boundingBox()
    // returns the mid-animation position, and page.mouse (unlike .click()) does
    // not auto-wait for stability, so an early read would miss the handle.
    const handle = page.locator('.vt-sheet__handle');
    let box = (await handle.boundingBox())!;
    for (;;) {
      await page.waitForTimeout(100);
      const next = (await handle.boundingBox())!;
      if (Math.abs(next.y - box.y) < 0.5) { box = next; break; }
      box = next;
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 220, { steps: 12 });
    await page.mouse.up();

    await expect(sheet).toBeHidden();
    // Never selected a day — still on today.
    await expect(page.getByText(/Day \d+ of \d+ · today/)).toBeVisible();
  });
});
