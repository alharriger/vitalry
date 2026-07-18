/**
 * Regenerate the raster app icons from the SVG source of truth
 * (`public/favicon.svg` — the evergreen tile + high-five mark).
 *
 * PNGs can't be hand-authored, so we rasterize the SVG with the Playwright
 * Chromium that's already installed for e2e. Run after changing the mark:
 *   node scripts/render-icons.mjs
 *
 * - "any"-purpose PWA icons keep the rounded tile (transparent corners).
 * - apple-touch-icon + the maskable PWA icon are full-bleed (rx=0) so the OS
 *   mask never clips a rounded corner.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const rounded = readFileSync('public/favicon.svg', 'utf8');
const fullBleed = rounded.replace('rx="116" ry="116"', 'rx="0" ry="0"');

const targets = [
  { file: 'public/apple-touch-icon.png', size: 180, svg: fullBleed },
  { file: 'public/pwa-192.png', size: 192, svg: rounded },
  { file: 'public/pwa-512.png', size: 512, svg: rounded },
  { file: 'public/pwa-maskable-512.png', size: 512, svg: fullBleed },
];

const browser = await chromium.launch();
try {
  for (const t of targets) {
    const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
    const svg = t.svg.replace('width="512" height="512"', `width="${t.size}" height="${t.size}"`);
    await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
    const el = await page.$('svg');
    const buf = await el.screenshot({ omitBackground: true });
    writeFileSync(t.file, buf);
    await page.close();
    console.log('wrote', t.file, `${t.size}x${t.size}`);
  }
} finally {
  await browser.close();
}
