/**
 * Idempotent dev seed — an active competition for local/phone testing of Today.
 *
 * Creates (or reuses) the "Harriger Family" group with Amber as organizer, and
 * one ACTIVE competition whose scoring_rules snapshot is DEFAULT_SCORING_RULES.
 * Re-running it changes nothing (everything is find-or-create). This is the
 * minimal seed for Step 2.2 — history backfill for browsing past days is added
 * in Step 2.4.
 *
 * Uses the service_role key, which BYPASSES RLS — so it can create the group,
 * membership, and competition that a client can't yet bootstrap (group-creation
 * UX is Phase 4). Never ship this key to the client.
 *
 * Run:  npm run seed:dev   (vite-node resolves the src/ imports; env comes from
 *       .env via process.loadEnvFile — the service_role key stays server-side.)
 */
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SCORING_RULES, localDateToday } from '../src/lib/scoring';

process.loadEnvFile(); // load ./.env into process.env

const AMBER_EMAIL = 'alharriger@gmail.com';
const GROUP_NAME = 'Harriger Family';
const COMPETITION_NAME = 'Harriger Summer Streak';
const DURATION_DAYS = 14;

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env. ' +
      'This script needs the service_role key (never the anon key).',
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Find an auth user by email, paging through the admin list. */
async function findAuthUserId(email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 200) break; // last page
  }
  return null;
}

async function main() {
  console.log('Seeding dev competition…');

  // 1) Amber's auth user (created on her first magic-link sign-in).
  const amberId = await findAuthUserId(AMBER_EMAIL);
  if (!amberId) {
    console.error(
      `No auth user for ${AMBER_EMAIL}. Sign in once at the app (magic link) to ` +
        'create the account, then re-run this seed.',
    );
    process.exit(1);
  }
  console.log(`  ✓ Amber: ${amberId}`);

  // 2) Ensure her profile has a name + timezone (the handle_new_user trigger
  //    creates the row; make sure it reads nicely for the greeting).
  await admin
    .from('profiles')
    .update({ name: 'Amber', timezone: 'America/New_York' })
    .eq('id', amberId)
    .is('name', null); // only fill when unset — don't clobber a name she chose

  // 3) Find-or-create the group (owned by Amber).
  let groupId: string;
  const { data: existingGroup, error: groupSelErr } = await admin
    .from('groups')
    .select('id')
    .eq('name', GROUP_NAME)
    .eq('created_by', amberId)
    .maybeSingle();
  if (groupSelErr) throw groupSelErr;

  if (existingGroup) {
    groupId = existingGroup.id;
    console.log(`  ✓ Group exists: ${groupId}`);
  } else {
    const { data: newGroup, error } = await admin
      .from('groups')
      .insert({ name: GROUP_NAME, created_by: amberId })
      .select('id')
      .single();
    if (error) throw error;
    groupId = newGroup.id;
    console.log(`  + Group created: ${groupId}`);
  }

  // 4) Ensure Amber is an organizer member (PK = group_id,user_id → upsert).
  const { error: memberErr } = await admin
    .from('group_members')
    .upsert(
      { group_id: groupId, user_id: amberId, role: 'organizer' },
      { onConflict: 'group_id,user_id' },
    );
  if (memberErr) throw memberErr;
  console.log('  ✓ Amber is organizer');

  // 5) Find-or-create ONE active competition with the frozen scoring snapshot.
  const { data: existingComp, error: compSelErr } = await admin
    .from('competitions')
    .select('id, status')
    .eq('group_id', groupId)
    .eq('name', COMPETITION_NAME)
    .maybeSingle();
  if (compSelErr) throw compSelErr;

  const today = localDateToday('America/New_York');
  if (existingComp) {
    // Make sure it's active + carries the scoring snapshot (idempotent repair).
    const { error } = await admin
      .from('competitions')
      .update({ status: 'active', scoring_rules: DEFAULT_SCORING_RULES })
      .eq('id', existingComp.id);
    if (error) throw error;
    console.log(`  ✓ Competition exists (active): ${existingComp.id}`);
  } else {
    const { data: newComp, error } = await admin
      .from('competitions')
      .insert({
        group_id: groupId,
        name: COMPETITION_NAME,
        start_date: today,
        duration_days: DURATION_DAYS,
        status: 'active',
        scoring_rules: DEFAULT_SCORING_RULES,
      })
      .select('id')
      .single();
    if (error) throw error;
    console.log(`  + Competition created (active, starts ${today}): ${newComp.id}`);
  }

  console.log('Done. Open Today and check in.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
