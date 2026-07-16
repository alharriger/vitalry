import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

/**
 * Dedicated config for the RLS integration test (`npm run test:rls`). It runs
 * against a LIVE Supabase project and needs the service_role key, so it is kept
 * out of the default `npm test` / CI run (which has no secrets). loadEnv('',
 * …, '') pulls every key from .env (including the non-VITE service_role) into
 * process.env for the test.
 */
const env = loadEnv('', process.cwd(), '');

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.rlstest.ts'],
    env,
    // Fixtures share a live DB; run serially and give network room.
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
