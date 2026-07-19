/**
 * Idempotent dev seed — an active competition for local/phone testing of Today.
 *
 * Creates (or reuses) the "Harriger Family" group with Amber as organizer, and
 * one ACTIVE competition whose scoring_rules snapshot is DEFAULT_SCORING_RULES.
 * Re-running it is idempotent (everything is find-or-create / upsert).
 *
 * Step 2.4 backfills ~3 weeks of Amber's own `daily_logs` (a mix of perfect,
 * active, some-goals, and a fully-missed day) so the read-only + missed day
 * views — and the 2.5 heatmap — have real data to browse. The competition is
 * dated `today − 21 … +30 days` so today reads as "Day 22 of 30" and there are
 * both past days to read back over and future days for the picker. Backfill
 * covers start … two-days-ago only, leaving today + yesterday editable for
 * manual check-in testing. Service-role writes bypass the 2.3 grace trigger
 * (auth.uid() is null), which is exactly how a past-day backfill is allowed.
 *
 * Uses the service_role key, which BYPASSES RLS — so it can create the group,
 * membership, and competition that a client can't yet bootstrap (group-creation
 * UX is Phase 4). Never ship this key to the client.
 *
 * Run:  npm run seed:dev   (vite-node resolves the src/ imports; env comes from
 *       .env via process.loadEnvFile — the service_role key stays server-side.)
 */
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SCORING_RULES, localDateToday, localDateRange, previousLocalDate } from '../src/lib/scoring';
import { DAILY_9 } from '../src/lib/goals';
import type { GoalStates } from '../src/types';

process.loadEnvFile(); // load ./.env into process.env

const AMBER_EMAIL = 'alharriger@gmail.com';
const GROUP_NAME = 'Harriger Family';
const COMPETITION_NAME = 'Harriger Summer Streak';
const TIMEZONE = 'America/New_York';
/** Days before today the competition starts (so today is "Day 22 of 30"). */
const START_OFFSET_DAYS = 21;
const DURATION_DAYS = 30;

/** Subtract `n` whole local days from a `'YYYY-MM-DD'` date. */
function minusDays(date: string, n: number): string {
  let d = date;
  for (let i = 0; i < n; i += 1) d = previousLocalDate(d);
  return d;
}

/**
 * A deterministic, varied done-count per backfilled day. `-1` = a fully-missed
 * day (no row written → the missed-day view). The mix spans perfect (9), active
 * (6–8), and some-goals (1–5) so every read-only treatment has real data.
 */
function plannedDoneCount(dayIndex: number): number {
  const cycle = [9, 7, 9, 5, -1, 9, 8, 9, 3, 6, 9, 9, 2, 8, 9, 7, 9, 4, 9, 9];
  return cycle[dayIndex % cycle.length];
}

/** Build a `goal_states` marking the first `n` of the Daily 9 as done (counter
 *  goals filled to their max so they count via `isGoalDone`). */
function goalStatesForDoneCount(n: number): GoalStates {
  const states: GoalStates = {};
  DAILY_9.slice(0, n).forEach((g) => {
    states[g.key] = g.logType === 'counter' ? (g.counterMax ?? 1) : true;
  });
  return states;
}

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
    .update({ name: 'Amber', timezone: TIMEZONE })
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
  //    Dated today−21 … +30 days so today reads as "Day 22 of 30" and there are
  //    both past days (read-only/missed views) and future days (picker) to browse.
  const { data: existingComp, error: compSelErr } = await admin
    .from('competitions')
    .select('id, status')
    .eq('group_id', groupId)
    .eq('name', COMPETITION_NAME)
    .maybeSingle();
  if (compSelErr) throw compSelErr;

  const today = localDateToday(TIMEZONE);
  const startDate = minusDays(today, START_OFFSET_DAYS);
  let competitionId: string;
  if (existingComp) {
    // Idempotent repair: keep it active, carry the snapshot, and (re)align the
    // dates so a comp seeded by an earlier step gets the browsable window.
    const { error } = await admin
      .from('competitions')
      .update({
        status: 'active',
        scoring_rules: DEFAULT_SCORING_RULES,
        start_date: startDate,
        duration_days: DURATION_DAYS,
      })
      .eq('id', existingComp.id);
    if (error) throw error;
    competitionId = existingComp.id;
    console.log(`  ✓ Competition exists (active, starts ${startDate}): ${competitionId}`);
  } else {
    const { data: newComp, error } = await admin
      .from('competitions')
      .insert({
        group_id: groupId,
        name: COMPETITION_NAME,
        start_date: startDate,
        duration_days: DURATION_DAYS,
        status: 'active',
        scoring_rules: DEFAULT_SCORING_RULES,
      })
      .select('id')
      .single();
    if (error) throw error;
    competitionId = newComp.id;
    console.log(`  + Competition created (active, starts ${startDate}): ${competitionId}`);
  }

  // 6) Backfill Amber's past days (start … two-days-ago) with a varied mix so
  //    the read-only + missed day views have real data. Leaves yesterday + today
  //    untouched (editable within the grace window for manual testing). A -1 in
  //    the pattern means a fully-missed day: no row → the missed-day view.
  const twoDaysAgo = minusDays(today, 2);
  const backfillDays = startDate <= twoDaysAgo ? localDateRange(startDate, twoDaysAgo) : [];
  const rows = backfillDays
    .map((localDate, i) => ({ localDate, done: plannedDoneCount(i) }))
    .filter((d) => d.done >= 0)
    .map((d) => ({
      competition_id: competitionId,
      user_id: amberId,
      local_date: d.localDate,
      goal_states: goalStatesForDoneCount(d.done),
      updated_at: new Date().toISOString(),
    }));
  if (rows.length) {
    const { error } = await admin
      .from('daily_logs')
      .upsert(rows, { onConflict: 'competition_id,user_id,local_date' });
    if (error) throw error;
  }
  const missedCount = backfillDays.length - rows.length;
  console.log(
    `  ✓ Backfilled ${rows.length} logged day(s) + ${missedCount} missed day(s) ` +
      `(${startDate} … ${twoDaysAgo})`,
  );

  console.log('Done. Open Today and check in.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
