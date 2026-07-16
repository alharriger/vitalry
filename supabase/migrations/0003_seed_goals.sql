-- Phase 1 — seed the Daily 9 into goals. Source of truth for names/targets is
-- src/lib/goals.ts (DAILY_9); this must stay in sync with it. Idempotent upsert
-- keyed on `key`, so re-running a migration or re-seeding is safe. Icon/color
-- are intentionally NOT stored — they are design tokens owned by the client.
insert into public.goals (key, name, target_text, log_type, counter_max, sort_order) values
  ('rainbow', 'Eat the rainbow',   '5 produce colors',             'counter', 5,    0),
  ('protein', 'Protein',           'Hit your protein goal',        'check',   null, 1),
  ('fiber',   'Fiber',             'Hit your fiber goal',          'check',   null, 2),
  ('move',    'Move',              '30 min moving — any kind',     'check',   null, 3),
  ('sweat',   'Sweat or strength', '20+ min workout',              'check',   null, 4),
  ('air',     'Fresh air',         '20 min outside',               'check',   null, 5),
  ('water',   'Water',             '8 cups',                       'counter', 8,    6),
  ('sleep',   'Sleep',             '7+ hours',                     'check',   null, 7),
  ('mind',    'Mind',              'Read, meditate, or journal',   'check',   null, 8)
on conflict (key) do update set
  name        = excluded.name,
  target_text = excluded.target_text,
  log_type    = excluded.log_type,
  counter_max = excluded.counter_max,
  sort_order  = excluded.sort_order,
  active      = true;
