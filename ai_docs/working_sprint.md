# Working Sprint — LIVE phase tracker

> Cross-session handoff doc. Documents the **current phase only**; refresh when a phase
> completes. Read this first every session.

## Current phase: Phase 2 — Today + scoring engine (not started)

**Status:** Phase 1 shipped on branch `phase-1-backend-auth` (PR open, 2026-07-16). Backend +
passwordless magic-link auth are live against the Supabase cloud project `cjsthmulslswrnbovrko`.
**Both exit-gate halves verified:** magic-link sign-in (UI landed on Today + programmatic token
exchange) and cross-group RLS isolation (`npm run test:rls`). Phase 2 is **not planned yet** —
next step is to write the Phase 2 plan and get Amber's approval before any code, per the loop.

### Phase 2 scope (from roadmap)
Today on live `daily_logs` · scoring as a pure, fully-tested module (base/perfect/active/streak/
cap/grace) · rules snapshot per competition (populate `competitions.scoring_rules`) · optimistic
taps auto-saved to Supabase with a visible "saved" indicator (no manual Save button) · yesterday
reachable + editable within the grace window (make the "still editable until midnight" affordance
real).

### Phase 2 exit gate
Scoring suite green incl. edge cases (streak reset, cap, grace lock, local midnight) · real
check-in < 20s on a phone · tap → reload → state persists · yesterday editable within grace,
locked after.

### Phase 1 carry-overs into later phases
- **Resend SMTP is REQUIRED before the family can sign in.** The built-in Supabase mailer is
  ~2/hr and only reaches the project-owner address — confirmed the hard way on 2026-07-15
  ("email rate limit exceeded"). Amber owns the Resend account + `vitalry.xyz` DNS verification;
  then wire SMTP in Supabase → Auth. Until then, dev/test signs in via an admin-generated link
  (see below) or the owner address. (pitfalls.md)
- **Point `vitalry.xyz` at Cloudflare Pages before Phase 4.** Magic-link redirects fall back to
  the Auth **Site URL** (`https://vitalry.xyz`), which isn't live yet, so a link opened anywhere
  but an allow-listed reachable origin dead-ends. Dev/test uses `localhost:5173` or a `*.pages.dev`
  preview (both allow-listed). (architecture.md decision log)
- **Phase 4 needs a creator-becomes-organizer trigger/policy.** `group_members` INSERT requires
  organizer, so a client cannot bootstrap a usable group yet. Harmless now (Phase 1 seeds via
  service_role; group-creation UX is Phase 4) — but Phase 4 must add a trigger that makes a
  group's creator its first organizer, or an INSERT policy allowing self-add as organizer.
- **Phase 2: delete `src/lib/sampleData.ts`** when Today reads live `daily_logs`; wire the "saved"
  indicator + real yesterday/grace access (the two open Phase 0 follow-ups).
- **Phase 6:** trim Phosphor's unused ttf/woff/svg fallbacks so they aren't emitted to `dist`.

### Verifying magic-link sign-in without email (mailer-free)
`admin.generateLink({ type:'magiclink', email, options:{ redirectTo:'http://localhost:5173/auth/callback' }})`
with the service_role key returns a single-use `action_link` (no email, no rate limit). Click it on
the machine running `npm run dev`. This is how Phase 1's exit gate was demonstrated end-to-end.

## Phase 1 — DONE (for reference; trim when Phase 2 starts)

Shipped: 6-table Postgres schema (`profiles`, `groups`, `group_members`, `competitions`, `goals`,
`daily_logs`) via Supabase CLI migrations in `supabase/migrations/`; **RLS on every table** scoped
to group membership using `SECURITY DEFINER` helpers (no policy recursion); Daily 9 seeded from
`src/lib/goals.ts`; Realtime enabled on `daily_logs`; passwordless magic-link auth (`SignInScreen`
+ `AuthCallback` + `AuthGate` in `App.tsx`, `src/lib/auth.tsx`, `src/lib/supabase.ts`); Supabase
NetworkOnly workbox rule + Cloudflare `public/_redirects` SPA fallback; keep-alive GitHub Action
(every 3 days). Auth config set via Management API: `site_url = https://vitalry.xyz`, redirect
allow-list = `localhost:5173` + `vitalry.xyz` + `*.pages.dev`. All three merge gates passed
(security review clean; code review — 3 functional fixes applied; e2e green) plus Amber's manual
sign-in test.

## Standing handoff notes

- Scripts: `npm run dev` (:5173) · `npm run build` · `npm test` · `npm run test:e2e` ·
  `npm run test:rls` (live DB + `.env` service_role; not in CI) · `npm run lint` · `npm run typecheck`.
- **Supabase migrations:** author SQL in `supabase/migrations/`, then apply with
  `supabase db push` (needs `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_DB_PASSWORD` in `.env`).
  Do NOT rely on pasting into the dashboard SQL editor — a partial error rolls the whole batch
  back silently (learned 2026-07-15; pitfalls.md).
- `.env` (gitignored) holds Supabase URL + anon + service_role + access token + DB password;
  `.env.example` is the committed template. `supabase/.temp/` is gitignored.
- Design handoff is high-fidelity for built screens; Join/onboarding, Settings, and **auth**
  screens have no design reference — build from plan §8 + tokens. The hard rules (44px targets,
  WCAG AA, ≥16px body) win over the reference (pitfalls.md).
