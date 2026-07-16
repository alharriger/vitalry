import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/  (test config lives in vitest.config.ts)
export default defineConfig({
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
        theme_color: '#0F4D2E',
        background_color: '#FCF9F3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
