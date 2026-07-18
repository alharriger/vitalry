-- Phase 2.3 — grace-window write guard on daily_logs.
--
-- Makes the RLS comment's "grace-window write lock ... enforced in Phase 2"
-- real: a player may only write TODAY or YESTERDAY, computed in THEIR OWN
-- timezone (day boundary = their local midnight — never a UTC/server clock).
-- Older days and future days are rejected.
--
-- Gated on `auth.uid() IS NOT NULL`: service-role connections (seeds, and the
-- 2.4 history backfill) carry no JWT `sub`, so auth.uid() is null and they pass
-- through untouched. This is deliberate — backfills must be able to write past
-- days that a real client never could.
--
-- SECURITY DEFINER + empty search_path mirrors the Phase 1 helper functions
-- (0002_rls.sql): it reads public.profiles for the player's timezone regardless
-- of the caller, and the empty search_path is the Supabase hardening default.

create function public.enforce_grace_window()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  tz          text;
  today_local date;
begin
  -- Service-role / seed writes have no auth.uid() — let backfills through.
  if (select auth.uid()) is null then
    return new;
  end if;

  -- The writer's own timezone drives the day boundary. Fall back to the schema
  -- default (matching profiles.timezone's default) if it is somehow blank.
  select coalesce(nullif(p.timezone, ''), 'America/New_York')
    into tz
    from public.profiles p
   where p.id = new.user_id;

  tz := coalesce(tz, 'America/New_York'); -- no profile row → still safe

  -- now() is timestamptz; "at time zone tz" yields the wall-clock timestamp in
  -- the player's zone, and ::date is their local calendar day.
  today_local := (now() at time zone tz)::date;

  if new.local_date > today_local then
    raise exception
      'Cannot log a future day (% is after today, %).', new.local_date, today_local
      using errcode = 'check_violation';
  end if;

  if new.local_date < today_local - 1 then
    raise exception
      'The grace window has closed for % — only today (%) and yesterday are editable.',
      new.local_date, today_local
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger daily_logs_grace_window
  before insert or update on public.daily_logs
  for each row execute function public.enforce_grace_window();
