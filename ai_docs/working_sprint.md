# Working Sprint — LIVE phase tracker

> Cross-session handoff doc. Documents the **current phase only**; refresh when a phase
> completes. Read this first every session.

## Current phase: Phase 1 — Backend & auth (not started)

**Status:** Phase 0 shipped and merged to `main` (PR #1, squashed as `b981416`) on
2026-07-12. Phase 1 is **not planned yet** — next step is to write the Phase 1 plan (schema +
auth + RLS) and get Amber's approval before any code, per the working loop.

### Phase 1 scope (from roadmap)
Supabase project · schema from plan §10 · seed the Daily 9 into `goals` · enable Realtime on
`daily_logs` · magic-link / invite-link auth (no passwords) · **RLS on every table scoped to
group membership**.

### Phase 1 exit gate
A test user signs in via magic link, **and** RLS is verified with a cross-group negative test
(a user in group A cannot read group B's rows).

### Phase 1 setup notes / carry-overs
- **Supabase free tier pauses after 7 days of DB inactivity** → add the free GitHub Actions
  keep-alive ping (every 3 days) as part of this phase. (architecture.md decision log.)
- **Resend as custom SMTP is required from day 1** — Supabase's default mailer is 2/hr and
  team-only, so magic links won't reach the family without it. (architecture.md.)
- **PWA security gate:** the SW already denies `navigateFallback` for `/api/` + `/auth/`; when
  the first backend route lands, add `workbox.runtimeCaching` for dynamic routes.
  (architecture.md → Security gates.)
- Seed `goals` from the existing `src/lib/goals.ts` (Daily 9 + `isGoalDone`) — that module
  carries forward; the `DAILY_9` array maps directly to `goals` rows.
- Env/secrets: Supabase URL + anon key go in `.env` (gitignored; `.env.example` committed).
  Service-role key never ships to the client.

## Phase 0 — DONE (for reference; trim when Phase 1 starts)

Shipped: Vite + React 19 + TS installable PWA; 10 design-system components ported to typed
React with co-located CSS; self-hosted woff2 fonts + Phosphor via npm (no CDNs); Today
check-in live against sample data; other tabs + flows as branded placeholders; 24 Vitest +
3 Playwright e2e; GitHub Actions CI. All three merge gates passed (code review, security
review, e2e) plus Amber's manual test.

**Open Phase 0 follow-ups (documented, non-blocking):**
- Phase 6: trim Phosphor's unused ttf/woff/svg fallbacks so they aren't emitted to `dist`.
- Phase 2: autosave + visible "saved" indicator (Amber's feedback); real yesterday/grace
  access; delete `src/lib/sampleData.ts` when Today reads live data.

## Standing handoff notes

- Scripts: `npm run dev` (:5173) · `npm run build` · `npm test` · `npm run test:e2e` ·
  `npm run lint` · `npm run typecheck`.
- Design handoff is high-fidelity: recreate `app-reference/` screens faithfully in React + TS;
  tokens usable verbatim. Join/onboarding and Settings screens have **no** design reference —
  build from plan §8.
- The design handoff is authoritative on look/feel but NOT on the hard rules (44px targets,
  WCAG AA, ≥16px body) — see pitfalls.md; the rule wins over the reference.
