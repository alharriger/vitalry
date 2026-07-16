-- Phase 1 — Row-Level Security on EVERY table, scoped to group membership.
-- Exit gate: a user in group A cannot read group B's rows (verified by the
-- cross-group negative test). Deny-by-default: RLS on + only listed policies.

-- ---------------------------------------------------------------------------
-- Membership helpers. SECURITY DEFINER so they read group_members WITHOUT
-- re-triggering RLS — this is what prevents the classic "policy on
-- group_members references group_members" infinite recursion. STABLE + empty
-- search_path per Supabase hardening guidance.
-- ---------------------------------------------------------------------------
create function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = gid
      and user_id = (select auth.uid())
  );
$$;

-- Is auth.uid() the organizer of this group?
create function public.is_group_organizer(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = gid
      and user_id = (select auth.uid())
      and role = 'organizer'
  );
$$;

-- Does auth.uid() share at least one group with target_user?
create function public.shares_group_with(target_user uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs using (group_id)
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user
  );
$$;

-- Is auth.uid() a member of the group that owns this competition?
create function public.can_access_competition(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.competitions c
    join public.group_members gm on gm.group_id = c.group_id
    where c.id = cid
      and gm.user_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles — see your own row and the rows of anyone you share a group with
-- (so leaderboards can show names/avatars). Edit only your own row.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select using (
    id = (select auth.uid()) or public.shares_group_with(id)
  );

create policy profiles_update on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- groups — members read; anyone can create a group they own; organizer edits.
-- ---------------------------------------------------------------------------
alter table public.groups enable row level security;

create policy groups_select on public.groups
  for select using (public.is_group_member(id));

create policy groups_insert on public.groups
  for insert with check (created_by = (select auth.uid()));

create policy groups_update on public.groups
  for update using (public.is_group_organizer(id)) with check (public.is_group_organizer(id));

create policy groups_delete on public.groups
  for delete using (public.is_group_organizer(id));

-- ---------------------------------------------------------------------------
-- group_members — members see co-members (via helper, no recursion). Only the
-- organizer manages membership. Self-join by invite link lands in Phase 4.
-- ---------------------------------------------------------------------------
alter table public.group_members enable row level security;

create policy group_members_select on public.group_members
  for select using (public.is_group_member(group_id));

create policy group_members_insert on public.group_members
  for insert with check (public.is_group_organizer(group_id));

create policy group_members_update on public.group_members
  for update using (public.is_group_organizer(group_id)) with check (public.is_group_organizer(group_id));

create policy group_members_delete on public.group_members
  for delete using (public.is_group_organizer(group_id));

-- ---------------------------------------------------------------------------
-- competitions — group members read; organizer writes.
-- ---------------------------------------------------------------------------
alter table public.competitions enable row level security;

create policy competitions_select on public.competitions
  for select using (public.is_group_member(group_id));

create policy competitions_insert on public.competitions
  for insert with check (public.is_group_organizer(group_id));

create policy competitions_update on public.competitions
  for update using (public.is_group_organizer(group_id)) with check (public.is_group_organizer(group_id));

create policy competitions_delete on public.competitions
  for delete using (public.is_group_organizer(group_id));

-- ---------------------------------------------------------------------------
-- goals — shared static catalog: world-readable (using(true) covers the anon
-- role too, which the keep-alive ping relies on). The only data exposed is the
-- non-sensitive Daily 9. No write policies exist, so inserts/updates are denied
-- to all clients; the Daily 9 is seeded via migration (service_role bypass).
-- ---------------------------------------------------------------------------
alter table public.goals enable row level security;

create policy goals_select on public.goals
  for select using (true);

-- ---------------------------------------------------------------------------
-- daily_logs — read any log in a competition you belong to (leaderboards);
-- write only your OWN logs, and only in a competition you belong to. The
-- grace-window write lock (yesterday-only) is enforced in Phase 2.
-- ---------------------------------------------------------------------------
alter table public.daily_logs enable row level security;

create policy daily_logs_select on public.daily_logs
  for select using (public.can_access_competition(competition_id));

create policy daily_logs_insert on public.daily_logs
  for insert with check (
    user_id = (select auth.uid()) and public.can_access_competition(competition_id)
  );

create policy daily_logs_update on public.daily_logs
  for update using (
    user_id = (select auth.uid()) and public.can_access_competition(competition_id)
  ) with check (
    user_id = (select auth.uid()) and public.can_access_competition(competition_id)
  );

create policy daily_logs_delete on public.daily_logs
  for delete using (user_id = (select auth.uid()));
