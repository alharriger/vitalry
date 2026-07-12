import { defineConfig } from 'vitest/config';

/**
 * Vitest config, kept separate from vite.config.ts on purpose: Vitest bundles
 * its own Vite whose plugin types conflict with the app's Vite 8 (rolldown).
 * Tests don't need the React Fast-Refresh plugin — esbuild transforms JSX via
 * the automatic runtime (tsconfig `jsx: react-jsx`).
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    // Unit/component tests only; Playwright owns e2e under /e2e.
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
});
