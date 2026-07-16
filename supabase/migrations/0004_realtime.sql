-- Phase 1 — enable Realtime on daily_logs so Phase 3's live leaderboard can
-- subscribe to tap-by-tap updates. Enabling the publication is Phase 1 scope;
-- the subscription UI is built in Phase 3. RLS still governs what each client
-- receives — realtime respects row-level security.
alter publication supabase_realtime add table public.daily_logs;
