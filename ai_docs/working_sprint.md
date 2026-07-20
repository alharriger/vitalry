# Working Sprint — LIVE phase tracker

> Cross-session handoff doc. Documents the **current phase only**; refresh when a phase
> completes. Read this first every session.

## Current phase: Phase 3 — Leaderboard + breakdown — 🚧 **IN PROGRESS** (kicked off 2026-07-20)

**Status:** Phases 0, 1, 2 all merged to `main` (Phase 2 = five steps 2.1–2.5, complete 2026-07-19).
Phase 3 planned + approved by Amber 2026-07-20; building on branch `phase-3-leaderboard` as a
**single deliverable** (not sub-stepped like Phase 2 — Amber's call at kickoff). See the plan below.

### Phase 3 scope (from `vitalry_product.md` roadmap)
Realtime ranking · today-progress pips · tap-through day breakdown · days-remaining + prize header.
**Exit gate:** two devices see each other's taps live; breakdown math matches the engine exactly.

### Why this phase is unusually clean (groundwork already laid)
- **No backend migration needed.** RLS already permits the leaderboard: `daily_logs_select` reads
  *any* log in a competition you belong to; `profiles_select` reads co-members ("so leaderboards can
  show names/avatars"). Both in `0002_rls.sql`.
- **Realtime already enabled** on `daily_logs` (`0004_realtime.sql`) — subscription is pure frontend;
  RLS governs what each client receives.
- **The scoring engine already produces everything.** `scoreCompetition` returns `totalScore`,
  `perfectDays`, `longestStreak`, and a full per-day `DayScoreResult[]` per player — so the exit
  gate's "breakdown math matches the engine exactly" is met by **reusing** the engine, not
  recomputing.
- Design handed off: `app-reference/StandingsScreen.jsx` + `design-system/components/leaderboard/`
  (`LeaderboardRow` + a `BreakdownSheet` reference). The `standings` route is currently a Placeholder.

### Human-owned decisions resolved at kickoff (2026-07-20, Amber)
- ✅ **Breakdown detail of others = scores per day only.** Tap-through shows a day-by-day bar chart
  (perfect / active / below) + points, perfect-day count, streak — **how many** goals, never
  **which** ones. Resolves the doc's open "counts + tap-through vs broadcast individual goals"
  decision, in favour of the honor system + fair-by-design. (Was flagged "decide during Phase 3".)
- ✅ **Test data = seed dev family members.** ~4–5 clearly-fake dev members (`*@seed.vitalry.dev`,
  idempotent, bulk-deletable) with varied histories so the board has a real ranking on the phone.

### Build plan (approved)
- **Data layer** (`dailyLogs.ts` + new pure `standings.ts`): add `groupId` + `prizeText` to
  `ActiveCompetition`; `loadCompetitionMembers(groupId)` + `loadCompetitionLogs(competitionId)`
  (RLS-scoped, `VITE_E2E` stubs). Pure `computeStandings(...)` runs each player through
  `scoreCompetition`, derives `doneToday` + current streak, sorts by **totalScore → perfectDays →
  longestStreak** with **shared rank on full ties** (the contract's tie-breakers). Plus a pure
  realtime-payload→state merge reducer. Fully unit-tested.
- **Realtime** (`useStandings.tsx`): hook used only by Standings; reads `competition`/`today` from
  the existing `useTodayLog` context (no re-fetch of the competition). Subscribes to `daily_logs`
  changes filtered by `competition_id`, merges each payload via the pure reducer, recomputes.
  Listeners cleaned up on unmount; no-op under E2E.
- **UI:** shared **`BottomSheet`** primitive extracted from MonthSheet's proven sheet shell
  (scrim/handle/swipe-to-dismiss/Escape/focus — reused, so the 2.5 swipe pitfall isn't re-hit);
  MonthSheet refactored onto it (its e2e tests are the safety net). **`LeaderboardRow`** ported to
  `.tsx`+`.css` (9-pip today tracker in Daily-9 colors; medal tiles tokenized). **`BreakdownSheet`**
  = day-by-day bars from real `DayScoreResult[]`, no per-goal detail. **`StandingsScreen`** replaces
  the Placeholder (header w/ days-left + prize badges, ranked rows, loading/empty/error).
- **Seed:** add dev members + set `prize_text`.
- **Contract note:** if the "current streak" helper is extracted into `scoring.ts`, **re-run the full
  scoring suite + log the delta** (expected: none). If kept in `standings.ts`, no contract touch.

### Gates for Phase 3
Unit (`standings.test.ts` — ranking/tie-breaks/shared-rank/doneToday/streak + payload-merge reducer)
· e2e (board renders ranked → tap opens breakdown → scrim/Escape/swipe dismiss; realtime stubbed) ·
**Testability gate** (push → `npm run preview:url`) · **manual phone test** (two accounts/devices:
taps appear live; tap a player → correct breakdown) · three merge gates (e2e verify, code review,
security review — lighter: reads + realtime + server-only seed, no new RLS/secret). Then mark DONE +
retro here + log pitfalls.

---

## Standing handoff notes (carry across phases)
- Scripts: `npm run dev` (:5173) · `npm run dev:host` (LAN, phone on same Wi-Fi) · `npm run build` ·
  `npm test` (run `TZ=UTC npm test` before pushing tz-sensitive changes — CI is UTC, `pitfalls.md`) ·
  `npm run test:e2e` · `npm run test:rls` (live DB + `.env` service_role; not in CI) · `npm run lint` ·
  `npm run typecheck` · `npm run seed:dev` · `npm run devlink` (mailer-free sign-in link) ·
  `npm run preview:url` (Cloudflare branch-preview URL for phone testing).
- **Supabase migrations:** author SQL in `supabase/migrations/`, then apply with
  `supabase db push` (needs `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_DB_PASSWORD` in `.env`).
  Never paste into the dashboard SQL editor — a partial error rolls the whole batch back silently
  (pitfalls.md). After any migration, verify the objects exist before building on them.
- `.env` (gitignored) holds Supabase URL + anon + service_role + access token + DB password +
  `RESEND_API_KEY`; `.env.example` is the committed template. Cloudflare Pages + GitHub Actions
  hold only the public `VITE_` values, never the service_role / DB password / Resend key.
- Design handoff is high-fidelity for built screens; the hard rules (44px targets, WCAG AA, ≥16px
  body) win over the reference (pitfalls.md).

## Testing sign-in without email (fast paths)
> **Canonical procedure lives in `ai_docs/testing_runbook.md`.** The notes below are the sign-in
> specifics it builds on.
- **Preview/phone testing → use the dev password sign-in.** On any `localhost` / `*.pages.dev`
  origin the SignInScreen shows a **"Developer sign-in (preview only)"** section (never on
  `vitalry.xyz`). Amber's account has a dev password (`vitalry-dev`); sign in once and the session
  **persists** for weeks. Reliable path — magic links get consumed by link previews (`pitfalls.md`).
- **`npm run devlink`** mints a mailer-free `admin.generateLink` magic link (no email, no rate limit)
  pointing at the branch preview by default; `-- <email> <origin>` targets localhost/another account.
  Single-use: **paste it straight into Safari's address bar**, never via Messages.
- **Realtime two-device testing (Phase 3 exit gate):** needs two *real* signed-in sessions (seed
  members can't tap). Use Amber's account on two devices, or a second dev account — the seed members
  populate the board's look, real accounts prove live updates.

## Carries forward to Phase 5
The day-browser, calendar-cell language, and scoring engine are reused by the Phase 5 **History tab**
(replaces Progress; "This competition" heatmap + per-goal rates + streak history, and "All history"
past-competition browsing). Phase 3's `LeaderboardRow`/`BreakdownSheet`/`BottomSheet` and the
`computeStandings` path are also reusable there. See `vitalry_product.md` roadmap + handoff frame 2e.

## Design handoff docs — keep until consumed, THEN remove (tracked cleanup)
The date-nav/day-view handoff is still **active scaffolding** for the Phase 5 History tab.
**Keep for now.** Removal gate: **2.5 merged AND Phase 5 History merged** (both consume these).
2.5 is merged; Phase 5 is not — so the list stays:
- `ai_docs/date_nav_design_brief.md`
- `design_handoff_vitalry_v1/date-nav-day-view/` (README + frames)
When Phase 5 lands, add a dated "safe to remove" line and clear the docs in that step's cleanup.
The `app-reference/` (StandingsScreen/BreakdownSheet reference) is consumed by Phase 3 — same
disposition once Phase 3 ships and no later phase references it.

## Next piece after Phase 3 (Amber's call, 2026-07-20)
- **Small Settings screen with a display-name editor.** Every user needs to set their own display
  name (right now names are seed-set; a leaderboard is names-first). Build a minimal Settings/Profile
  screen — **name now**, with room to grow (avatar, reminder time → Phase 6). Needs a new entry point
  (gear, or tapping your avatar). Its own branch/lifecycle **after Phase 3 merges** (not bundled into
  the leaderboard). Writes `profiles.name` (RLS `profiles_update` already allows self-update).

## Phase 1 carry-overs into later phases
- **Phase 4 needs a creator-becomes-organizer trigger/policy.** `group_members` INSERT requires
  organizer, so a client can't bootstrap a usable group yet. Harmless now (seeded via service_role;
  group-creation UX is Phase 4) — Phase 4 must add a trigger making a group's creator its first
  organizer, or an INSERT policy allowing self-add as organizer.
- **Phase 4 — cap `prize_text` length** (Amber, 2026-07-20). The Standings prize badge wraps
  gracefully now, but prizes should be short enough to sit on ONE line on most phones. The
  competition-setup form must enforce a max length (**≈40 chars** — finalize against the badge at
  ~360px width), ideally backed by a DB `check (char_length(prize_text) <= N)`. Keep the copy tight.
- **Phase 6:** trim Phosphor's unused ttf/woff/svg fallbacks so they aren't emitted to `dist`.

## Infra live (done 2026-07-17)
- **Resend custom SMTP** delivering Supabase Auth mail as `Vitalry <no-reply@vitalry.xyz>`
  (send-only key in `.env`; `vitalry.xyz` verified in Resend). Built-in 2/hr mailer no longer applies.
- **`vitalry.xyz` live on Cloudflare Pages** (Git integration: pushes to `main` auto-build; build
  env has the public `VITE_` vars + `NODE_VERSION=22`). HTTPS + SPA fallback; `*.pages.dev` previews
  live. Auth Site URL = `https://vitalry.xyz`. Redirect allow-list includes
  `https://*.vitalry.pages.dev/**`. PWA origin locked.

---

## Phases 0–2 — DONE (for reference)

**Phase 0 — Scaffold:** Vite + React + TS + PWA; design tokens/fonts/Phosphor; 4-tab routing shell;
core Today components. **Phase 1 — Backend & auth:** 6-table Postgres schema via CLI migrations
(`supabase/migrations/`); **RLS on every table** scoped to group membership via `SECURITY DEFINER`
helpers (no recursion) — incl. the leaderboard-ready `daily_logs`/`profiles` SELECT policies Phase 3
relies on; Daily 9 seeded; Realtime on `daily_logs`; passwordless magic-link auth; Supabase
NetworkOnly workbox rule + Cloudflare SPA fallback; keep-alive Action.

**Phase 2 — Today + scoring engine (five steps, all merged):**
- **2.1 Scoring engine** — `src/lib/scoring.ts` (+ 39-test suite). Pure: `ScoringRules` /
  `DayScoreResult` / `StandingResult`, `DEFAULT_SCORING_RULES`, `scoreDay`, `scoreCompetition`
  (walks full `start→asOf` so gaps reset streaks), `dayClass`, local-date helpers. Contract:
  1 pt/goal (max 9) · perfect +3 · streak = flat **+2** from the 3rd consecutive **perfect** day ·
  active = 6+/9 (calendar color only) · **max 14/day** · local-midnight boundary · yesterday
  editable within grace · tie-breakers perfect days → longest streak → shared rank · rules snapshot
  frozen into `competitions.scoring_rules`.
- **2.2 Today on live `daily_logs` + autosave** — `dailyLogs.ts`, `useTodayLog.tsx` (context
  provider: one shared fetch, coalesced autosave, engine scores), `SaveIndicator`; `sampleData.ts`
  deleted; `seed-dev-competition.ts` + `npm run seed:dev`.
- **2.3 Yesterday editable + grace lock** — reusable `DateNav`; `useTodayLog` grew `viewedDate` +
  per-day coalesced autosave; `dayNav.ts`; **grace-window DB trigger** (migrations 0005/0006,
  tz-aware, gated on `auth.uid()` so service-role seeds bypass); context-aware clock (committed
  `profiles.timezone`, re-derives "today" on focus). Dev password sign-in + `npm run devlink`.
- **2.4 Browse past days: read-only + missed** — `stepBounds` floor → `start_date`; non-interactive
  `DayRecordRow`; read-only + kind missed-day views; seed backfills a 3-week varied history
  (today−21 … +30, "Day 22 of 30"). Testability gate + `testing_runbook.md` added this step.
- **2.5 Month-sheet picker (heatmap)** — presentational `MonthSheet` bottom-sheet opened from the
  `DateNav` centre button; single continuous `start→final` weekday-aligned heatmap via `dayClass`;
  today = green base bar, viewing = solid ring, editable = dashed ring; swipe-to-dismiss +
  scrim/grabber/Escape; `weekdayOffset` helper; `--shadow-sheet` token.

Detail for all lives in `architecture.md` + the migration/source files + git history (PRs #2–#5).
