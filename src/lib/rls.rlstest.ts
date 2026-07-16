import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Phase 1 EXIT GATE — cross-group RLS negative test.
 *
 * Proves the invariant "a user in group A cannot read group B's rows" against a
 * LIVE Supabase project. Runs via `npm run test:rls` (needs .env with the
 * service_role key); it is excluded from the default suite / CI.
 *
 * Shape: service_role seeds two isolated groups (A owned by user A, B owned by
 * user B), each with a competition and a daily_log. We then sign in as user A
 * with the ANON key (so RLS applies) and assert A can see its own group's rows
 * but zero of group B's — across every group-scoped table.
 */
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const configured = Boolean(url && anonKey && serviceKey);

// A unique run tag keeps repeat runs from colliding on emails.
const tag = `${Date.now()}-${Math.floor(process.hrtime()[1] % 1e6)}`;
const emailA = `rls-a-${tag}@vitalry.test`;
const emailB = `rls-b-${tag}@vitalry.test`;
const password = `Pw-${tag}-xY`;

interface Fixture {
  userAId: string;
  userBId: string;
  groupAId: string;
  groupBId: string;
  compAId: string;
  compBId: string;
}

describe.skipIf(!configured)('RLS: cross-group isolation', () => {
  let admin: SupabaseClient;
  let clientA: SupabaseClient;
  let fx: Fixture;
  // Track everything we create so teardown works even if setup throws midway.
  const createdUserIds: string[] = [];
  const createdGroupIds: string[] = [];

  beforeAll(async () => {
    admin = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create two users. email_confirm so they can sign in immediately; the
    // handle_new_user trigger creates their profiles rows automatically.
    const a = await admin.auth.admin.createUser({ email: emailA, password, email_confirm: true });
    if (a.error) throw a.error;
    createdUserIds.push(a.data.user!.id);
    const b = await admin.auth.admin.createUser({ email: emailB, password, email_confirm: true });
    if (b.error) throw b.error;
    createdUserIds.push(b.data.user!.id);
    const userAId = a.data.user!.id;
    const userBId = b.data.user!.id;

    // Seed two isolated groups with service_role (bypasses RLS).
    const seedGroup = async (name: string, owner: string) => {
      const g = await admin.from('groups').insert({ name, created_by: owner }).select('id').single();
      if (g.error) throw g.error;
      const groupId = g.data.id as string;
      createdGroupIds.push(groupId);
      const m = await admin
        .from('group_members')
        .insert({ group_id: groupId, user_id: owner, role: 'organizer' });
      if (m.error) throw m.error;
      const c = await admin
        .from('competitions')
        .insert({ group_id: groupId, name: `${name} cup`, start_date: '2026-07-13', duration_days: 7 })
        .select('id')
        .single();
      if (c.error) throw c.error;
      const compId = c.data.id as string;
      const l = await admin.from('daily_logs').insert({
        competition_id: compId,
        user_id: owner,
        local_date: '2026-07-13',
        goal_states: { water: 4 },
      });
      if (l.error) throw l.error;
      return { groupId, compId };
    };

    const groupA = await seedGroup('Group A', userAId);
    const groupB = await seedGroup('Group B', userBId);

    fx = {
      userAId,
      userBId,
      groupAId: groupA.groupId,
      groupBId: groupB.groupId,
      compAId: groupA.compId,
      compBId: groupB.compId,
    };

    // Sign in as user A through the ANON key so RLS is enforced.
    clientA = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signIn = await clientA.auth.signInWithPassword({ email: emailA, password });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (!admin) return;
    // Delete groups first (cascades members/competitions/daily_logs); the
    // groups.created_by → profiles FK is RESTRICT, so profiles can't drop while
    // a group references them. Then delete the auth users (cascades profiles).
    // Driven off the tracked ids so a mid-setup failure still cleans up.
    if (createdGroupIds.length) await admin.from('groups').delete().in('id', createdGroupIds);
    for (const id of createdUserIds) await admin.auth.admin.deleteUser(id);
  });

  it('sees its OWN group across every table', async () => {
    const groups = await clientA.from('groups').select('id').eq('id', fx.groupAId);
    expect(groups.error).toBeNull();
    expect(groups.data).toHaveLength(1);

    const comps = await clientA.from('competitions').select('id').eq('id', fx.compAId);
    expect(comps.data).toHaveLength(1);

    const logs = await clientA.from('daily_logs').select('id').eq('competition_id', fx.compAId);
    expect(logs.data?.length).toBeGreaterThanOrEqual(1);
  });

  it('CANNOT read group B rows in any group-scoped table', async () => {
    const groups = await clientA.from('groups').select('id').eq('id', fx.groupBId);
    expect(groups.data).toHaveLength(0);

    const members = await clientA
      .from('group_members')
      .select('user_id')
      .eq('group_id', fx.groupBId);
    expect(members.data).toHaveLength(0);

    const comps = await clientA.from('competitions').select('id').eq('id', fx.compBId);
    expect(comps.data).toHaveLength(0);

    const logs = await clientA.from('daily_logs').select('id').eq('competition_id', fx.compBId);
    expect(logs.data).toHaveLength(0);

    // profiles: no shared group with B, so B's profile is invisible.
    const profile = await clientA.from('profiles').select('id').eq('id', fx.userBId);
    expect(profile.data).toHaveLength(0);
  });

  it('CANNOT write a daily_log into group B', async () => {
    const write = await clientA.from('daily_logs').insert({
      competition_id: fx.compBId,
      user_id: fx.userAId,
      local_date: '2026-07-14',
      goal_states: { water: 1 },
    });
    // RLS rejects the insert (the WITH CHECK fails: A can't access comp B).
    expect(write.error).not.toBeNull();
  });
});
