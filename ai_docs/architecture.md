# Vitalry — Architecture

Web-first, native-ready. One codebase that later wraps into store apps via Capacitor.

**Standing budget constraint (Amber, 2026-07-12):** "balling on a budget" — no paid tooling
or paid tiers unless a free option genuinely can't deliver quality. Target running cost
**$0/mo** (only optional cost: a custom domain, ~$10–12/yr — deferrable; `*.pages.dev` works).

## Stack (reassessed for budget, 2026-07-12)

| Layer | Choice | Cost | Notes |
|---|---|---|---|
| Frontend | React + TypeScript + Vite, installable PWA | $0 | Standard SPA keeps the Capacitor path open |
| Backend | Supabase free tier (Postgres + Auth + Realtime) | $0 | 500MB DB / 50k MAU / realtime 200 concurrent — orders of magnitude above family-beta needs. **Pauses after 7 days of DB inactivity** → free GitHub Actions keep-alive ping every 3 days |
| Auth email | **Resend free tier as Supabase custom SMTP** (3k/mo, 100/day) | $0 | **Required, not optional:** Supabase's default mailer is 2 emails/hr, team-only addresses, and free-tier projects can't customize auth templates without custom SMTP |
| Push | Web Push API (VAPID) | $0 | No vendor; iOS requires home-screen install |
| Reminder emails | Resend (same account) | $0 | 100/day covers 12 players many times over |
| Hosting | **Cloudflare Pages** | $0 | Unlimited bandwidth on free tier; commercial use allowed (Vercel Hobby prohibits it — matters if v3 stakes ever happen); free per-branch preview deploys for phone testing |
| CI | GitHub Actions free tier | $0 | Lint + typecheck + tests on PR; also runs the Supabase keep-alive cron |
| Fonts/icons | Self-hosted woff2 + npm-vendored Phosphor | $0 | Needed for PWA offline anyway; removes CDN supply-chain risk |
| Testing | Vitest + React Testing Library + Playwright | $0 | No paid testing tools needed |

**Alternatives considered and rejected (2026-07-12):** Firebase Spark (no pause, but NoSQL is
a poor fit for the scoring SQL + RLS model); Pocketbase on a VPS (~$5/mo + self-ops burden);
Cloudflare D1 + Workers ($0 but hand-rolling auth + realtime). Supabase's only free-tier
weakness (the pause) is solved for free.

## Data model (schema source: plan §10)

```
users          (id, name, avatar, email?, timezone, reminder_time)
groups         (id, name, created_by)
group_members  (group_id, user_id, role: organizer|member)
competitions   (id, group_id, name, start_date, duration_days,
                prize_text?, status: pending|active|complete)
goals          (id, key, name, target_text, log_type: check|counter,
                counter_max?, sort_order, active)          ← static seed in v1
daily_logs     (id, competition_id, user_id, local_date,
                goal_states: jsonb {goal_id: 0..n}, updated_at)
                UNIQUE (competition_id, user_id, local_date)
```

## Standing architectural invariants

- **Scores are computed, never stored.** Materialize a view/cache only if measured need.
  Scoring lives in one pure, fully-tested TypeScript module.
- **Scoring rules snapshot at competition start** — tuning between betas never changes a
  live game.
- **Day boundary is the player's local midnight**, stored as `local_date` (a date, not a UTC
  timestamp). Time zones stay simple forever.
- **Goals are rows, not code** — v2 custom goals become rows + a picker.
- **Wearable-ready:** when sync arrives, add per-goal-state `source: manual|healthkit|googlefit`;
  no schema upheaval.
- **Group size unbounded in the model**, UI tuned for 4–12.
- **RLS everywhere:** every table row-level-secured, scoped to group membership.

## Decision log

| Date | Decision | Why | Revisit when |
|---|---|---|---|
| 2026-07 | Supabase over Firebase | SQL, cheap tier, magic-link auth, realtime | Free-tier limits bite or realtime underperforms |
| 2026-07 | PWA first, Capacitor at v1.5 | No store friction for family beta; days-not-weeks wrap later | Reminder delivery underperforms on iOS → accelerate wrap |
| 2026-07 | Scores computed, not stored | Tune scoring during beta without migrations | Leaderboard query cost at real scale |
| 2026-07 | `local_date` day boundary | Simple mental model, no TZ math fights | Never (product-level decision) |
| 2026-07-12 | $0/mo budget architecture locked | Amber: "balling on a budget" — free tiers wherever quality allows | A free tier degrades quality in beta measurement |
| 2026-07-12 | Cloudflare Pages over Vercel/Netlify | Unlimited free bandwidth; commercial use allowed on free tier; free branch previews | CF build limits (500/mo) ever bite, or framework needs Vercel-specific features |
| 2026-07-12 | Resend as Supabase custom SMTP from day 1 | Default Supabase mailer is 2/hr + team-only → magic links would break for family | Resend's 100/day cap approached (≈ never at family scale) |
| 2026-07-12 | GitHub Actions keep-alive ping (every 3 days) | Free fix for Supabase 7-day inactivity pause between competitions | Upgrade to Supabase Pro ever justified |
