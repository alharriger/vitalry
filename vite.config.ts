import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/  (test config lives in vitest.config.ts)
export default defineConfig({
  // Build stamp — surfaced in the in-app diagnostics panel so we can tell exactly
  // which deploy a device is running (Cloudflare sets CF_PAGES_COMMIT_SHA).
  define: {
    __BUILD_SHA__: JSON.stringify((process.env.CF_PAGES_COMMIT_SHA || 'local').slice(0, 7)),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString().replace('T', ' ').slice(0, 16) + 'Z'),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache the app shell + self-hosted fonts/icons so an installed
      // Vitalry works offline (a core reason we self-host rather than use CDNs).
      // Only woff2 is precached: Phosphor ships ttf/woff/svg fallbacks too, but
      // every modern browser uses woff2, and the svg fonts are ~3MB each.
      // TODO(phase-6): trim Phosphor @font-face to woff2-only so the legacy
      // formats aren't emitted to dist at all.
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,ico}'],
        // The SW falls back to the cached SPA shell for navigations. Deny that
        // for backend/auth routes so it never shadows the server once Phase 1
        // lands.
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
        // Security gate (review 2026-07-12, LOW-2): never serve an
        // authenticated/dynamic response from cache. All backend traffic goes
        // cross-origin to Supabase — force it straight to the network so no
        // auth token or user row is ever read from (or written to) the cache.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vitalry',
        short_name: 'Vitalry',
        description: 'A group wellness game — win by consistency, not intensity.',
        // Match the app's cream surface (the in-app top strip), not the brand
        // green — a mismatched manifest theme_color tints the installed PWA's top
        // chrome differently from the page.
        theme_color: '#FCF9F3',
        background_color: '#FCF9F3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Full-bleed (no rounded corners) so the OS mask never clips a corner.
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
