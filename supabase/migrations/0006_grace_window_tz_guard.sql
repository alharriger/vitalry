-- Phase 2.3 hardening — make enforce_grace_window() robust to a bad timezone.
--
-- 0005 computed `(now() at time zone tz)::date` directly. If profiles.timezone
-- ever holds a non-IANA string, that cast raises inside the trigger and turns
-- EVERY daily_logs write for that user into a hard error — a silent lockout.
-- There's no timezone-picker UI today so it's currently unreachable, but guard
-- it now: an unrecognized zone falls back to the schema default rather than
-- bricking check-ins. Behaviour is otherwise identical to 0005.

create or replace function public.enforce_grace_window()
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

  select coalesce(nullif(p.timezone, ''), 'America/New_York')
    into tz
    from public.profiles p
   where p.id = new.user_id;

  tz := coalesce(tz, 'America/New_York'); -- no profile row → still safe

  -- A malformed zone must not brick check-ins: fall back to the default.
  begin
    today_local := (now() at time zone tz)::date;
  exception
    when others then
      today_local := (now() at time zone 'America/New_York')::date;
  end;

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
