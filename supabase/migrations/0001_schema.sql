-- Phase 1 — core schema (architecture.md "Data model", source: plan §10).
-- Scores are computed, never stored (no scores table). Day boundary is the
-- player's local_date (a date, not a UTC timestamp). Goals are rows, not code.

-- ---------------------------------------------------------------------------
-- profiles — the schema's `users` entity. Named `profiles` (not `users`) to
-- avoid shadowing auth.users, a standard Supabase footgun. One row per auth
-- user, id-linked, created automatically by the handle_new_user() trigger.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text,
  avatar        text,
  email         text,
  timezone      text not null default 'America/New_York',
  reminder_time time,
  created_at    timestamptz not null default now()
);

-- Create a profile row whenever a new auth user is created (magic-link signup).
-- SECURITY DEFINER so it can write public.profiles regardless of the caller;
-- empty search_path is the Supabase-recommended hardening for definer funcs.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
create table public.groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- group_members — membership + role. PK is (group_id, user_id): one row per
-- person per group. Group size is unbounded in the model (UI tuned for 4-12).
-- ---------------------------------------------------------------------------
create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id  uuid not null references public.profiles (id) on delete cascade,
  role     text not null default 'member' check (role in ('organizer', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_idx on public.group_members (user_id);

-- ---------------------------------------------------------------------------
-- competitions — a fixed-length game inside a group. scoring_rules is a
-- forward-looking snapshot column: Phase 2 freezes the rules here at start so
-- tuning never changes a live game (architecture invariant). Null until then.
-- ---------------------------------------------------------------------------
create table public.competitions (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid not null references public.groups (id) on delete cascade,
  name          text not null,
  start_date    date not null,
  duration_days int  not null check (duration_days > 0),
  prize_text    text,
  status        text not null default 'pending' check (status in ('pending', 'active', 'complete')),
  scoring_rules jsonb,
  created_at    timestamptz not null default now()
);

create index competitions_group_idx on public.competitions (group_id);

-- ---------------------------------------------------------------------------
-- goals — the Daily 9 (static seed in v1; rows so v2 can add custom goals).
-- Icon/color live client-side as design tokens; only data-shape lives here.
-- ---------------------------------------------------------------------------
create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  name        text not null,
  target_text text not null,
  log_type    text not null check (log_type in ('check', 'counter')),
  counter_max int,
  sort_order  int  not null,
  active      boolean not null default true
);

-- ---------------------------------------------------------------------------
-- daily_logs — one row per player per competition per local day. goal_states
-- mirrors the client GoalStates jsonb: { goal_key: boolean | number }.
-- UNIQUE (competition_id, user_id, local_date) enforces one log per day.
-- ---------------------------------------------------------------------------
create table public.daily_logs (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  local_date     date not null,
  goal_states    jsonb not null default '{}'::jsonb,
  updated_at     timestamptz not null default now(),
  unique (competition_id, user_id, local_date)
);

-- Leaderboard reads scan a competition's rows for a day/date-range.
create index daily_logs_competition_date_idx on public.daily_logs (competition_id, local_date);
