/**
 * Mint a ready-to-click magic link WITHOUT sending an email — the mailer-free
 * sign-in used to test on a phone / preview without the inbox round-trip or the
 * rate limit. Uses the service_role admin API (`generateLink`), so no mail is
 * sent and there is no 2/hr cap.
 *
 * The link's redirect lands on `<origin>/auth/callback`; that origin must be in
 * the Supabase Auth redirect allow-list (localhost, vitalry.xyz, and
 * *.vitalry.pages.dev previews all are). Open the printed link on the device you
 * want signed in.
 *
 * Run:
 *   npm run devlink                       # Amber @ the branch preview
 *   npm run devlink -- you@email.com      # a different account, branch preview
 *   npm run devlink -- you@email.com http://localhost:5173
 *
 * The account must already exist (sign in once, or it is created here with a
 * confirmed email). Only an account that belongs to a seeded competition will
 * show the check-in — otherwise you land on the empty state.
 */
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile();

const DEFAULT_EMAIL = 'alharriger@gmail.com';
// Stable branch-preview alias for this feature branch (Cloudflare Pages).
const DEFAULT_ORIGIN = 'https://phase-2-3-yesterday-grace.vitalry.pages.dev';

const email = (process.argv[2] || DEFAULT_EMAIL).trim();
const origin = (process.argv[3] || DEFAULT_ORIGIN).replace(/\/+$/, '');
const redirectTo = `${origin}/auth/callback`;

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureUser(target: string): Promise<void> {
  const t = target.toLowerCase();
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    if (data.users.some((u) => u.email?.toLowerCase() === t)) return;
    if (data.users.length < 200) break;
  }
  // Not found — create a confirmed account so the link works immediately.
  const { error } = await admin.auth.admin.createUser({ email: target, email_confirm: true });
  if (error) throw error;
  console.log(`  (created a new confirmed account for ${target})`);
}

async function main() {
  await ensureUser(email);
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  });
  if (error) throw error;
  const link = data.properties?.action_link;
  if (!link) throw new Error('No action_link returned.');
  console.log(`\nSign-in link for ${email}`);
  console.log(`→ redirects to ${redirectTo}\n`);
  console.log(link);
  console.log('\nOpen it on the device you want signed in. Single-use; re-run for a fresh one.');
}

main().catch((err) => {
  console.error('devlink failed:', err);
  process.exit(1);
});
