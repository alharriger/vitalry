import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { localDateToday, previousLocalDate, nextLocalDate } from './scoring';

/**
 * Phase 2.3 EXIT GATE — the grace-window write trigger (`enforce_grace_window`,
 * migration 0005), verified against the LIVE Supabase project.
 *
 * Proves the invariant "a player may only write today or yesterday, in their own
 * timezone" end-to-end: as an authenticated user (anon key → auth.uid() set, so
 * the trigger fires), writing today/yesterday succeeds and writing two-days-ago
 * or tomorrow is rejected. Also proves the service-role bypass — a backfill
 * (auth.uid() null) can still write an out-of-window day, which Phase 2.4 relies
 * on. Runs via `npm run test:rls`; excluded from the default suite / CI.
 */
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const configured = Boolean(url && anonKey && serviceKey);

const tag = `${Date.now()}-${Math.floor(process.hrtime()[1] % 1e6)}`;
const email = `grace-${tag}@vitalry.test`;
const password = `Pw-${tag}-xY`;

// The trigger reads profiles.timezone; pin a known zone so the day math is
// deterministic and matches what we compute here.
const TZ = 'America/New_York';

describe.skipIf(!configured)('Grace-window trigger on daily_logs', () => {
  let admin: SupabaseClient;
  let client: SupabaseClient;
  let userId: string;
  let compId: string;
  const createdUserIds: string[] = [];
  const createdGroupIds: string[] = [];

  const today = localDateToday(TZ);
  const yesterday = previousLocalDate(today);
  const twoDaysAgo = previousLocalDate(yesterday);
  const tomorrow = nextLocalDate(today);

  beforeAll(async () => {
    admin = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const u = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (u.error) throw u.error;
    userId = u.data.user!.id;
    createdUserIds.push(userId);

    // Pin the timezone (the handle_new_user default is already NY, but be explicit).
    const tzUpd = await admin.from('profiles').update({ timezone: TZ }).eq('id', userId);
    if (tzUpd.error) throw tzUpd.error;

    // A group the user belongs to + an active competition (so daily_logs RLS
    // lets them write; the competition window is irrelevant to the trigger,
    // which gates purely on the grace dates). Start it well back so nothing but
    // the trigger can reject an old-day write.
    const g = await admin.from('groups').insert({ name: `Grace ${tag}`, created_by: userId }).select('id').single();
    if (g.error) throw g.error;
    createdGroupIds.push(g.data.id as string);
    const m = await admin.from('group_members').insert({ group_id: g.data.id, user_id: userId, role: 'organizer' });
    if (m.error) throw m.error;
    const c = await admin
      .from('competitions')
      .insert({ group_id: g.data.id, name: 'Grace cup', start_date: '2026-01-01', duration_days: 365, status: 'active' })
      .select('id')
      .single();
    if (c.error) throw c.error;
    compId = c.data.id as string;

    client = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signIn = await client.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (!admin) return;
    if (createdGroupIds.length) await admin.from('groups').delete().in('id', createdGroupIds);
    for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
  });

  it('ALLOWS writing today', async () => {
    const w = await client.from('daily_logs').insert({
      competition_id: compId,
      user_id: userId,
      local_date: today,
      goal_states: { water: 8 },
    });
    expect(w.error).toBeNull();
  });

  it('ALLOWS writing yesterday (the grace day)', async () => {
    const w = await client.from('daily_logs').insert({
      competition_id: compId,
      user_id: userId,
      local_date: yesterday,
      goal_states: { water: 5 },
    });
    expect(w.error).toBeNull();
  });

  it('REJECTS writing two days ago (grace window closed)', async () => {
    const w = await client.from('daily_logs').insert({
      competition_id: compId,
      user_id: userId,
      local_date: twoDaysAgo,
      goal_states: { water: 1 },
    });
    expect(w.error).not.toBeNull();
    expect(w.error?.message).toMatch(/grace window/i);
  });

  it('REJECTS writing a future day', async () => {
    const w = await client.from('daily_logs').insert({
      competition_id: compId,
      user_id: userId,
      local_date: tomorrow,
      goal_states: { water: 1 },
    });
    expect(w.error).not.toBeNull();
    expect(w.error?.message).toMatch(/future/i);
  });

  it('REJECTS an UPDATE that moves an existing row out of the window', async () => {
    // today's row exists from the first test; the trigger fires on UPDATE too.
    const w = await client
      .from('daily_logs')
      .update({ local_date: twoDaysAgo })
      .eq('competition_id', compId)
      .eq('user_id', userId)
      .eq('local_date', today);
    expect(w.error).not.toBeNull();
  });

  it('service_role BYPASSES the trigger (backfill can write old days)', async () => {
    // auth.uid() is null for service_role → the trigger lets it through. This is
    // what the Phase 2.4 history backfill depends on.
    const w = await admin.from('daily_logs').insert({
      competition_id: compId,
      user_id: userId,
      local_date: twoDaysAgo,
      goal_states: { water: 3 },
    });
    expect(w.error).toBeNull();
  });
});
