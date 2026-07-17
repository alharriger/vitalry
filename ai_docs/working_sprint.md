# Working Sprint — LIVE phase tracker

> Cross-session handoff doc. Documents the **current phase only**; refresh when a phase
> completes. Read this first every session.

## Current phase: Phase 2 — Today + scoring engine (broken into 5 steps; **2.2 is next**)

**Status:** Phase 1 merged to `main` (PR #2, `6b4ce5e`). Phase 2 is **planned and broken into
five independently-shippable steps (2.1–2.5)**, each run as its own full lifecycle by a separate
Claude instance (Amber's choice, 2026-07-17). The finished date-nav/day-view design has been
absorbed (see shared context). **Step 2.1 (scoring engine) is DONE** — see its section below.
**Start the next session at Step 2.2.**

---

## How to run a Phase 2 step (READ THIS FIRST if you're picking up a step)

1. **Take the next not-done step** in order: 2.1 → 2.2 → 2.3 → 2.4 → 2.5. Do **not** skip ahead or
   bundle steps — each ships on its own.
2. **Read** this doc, `CLAUDE.md`, and the docs it points to (the design handoff for UI steps,
   the scoring contract below for 2.1).
3. **Full software-development lifecycle for THIS step only** (the hard-rule loop):
   plan → **Amber's approval** → new branch `phase-2.<n>-<slug>` → implement →
   **manual-test pause** (Amber tests, usually on her phone) → **three merge gates** (e2e verify,
   code review, security review — proportionate to the diff) → commit/merge to `main`
   (auto-deploys to vitalry.xyz) → **mark the step DONE here + a one-line retro note** + log any
   pitfalls to `pitfalls.md`.
4. Never skip the approval or the manual-test pause. Scoring changes re-run the 2.1 suite and log
   the delta (scoring is a contract).

## Shared context for every Phase 2 step

- **Authoritative UI design:** `design_handoff_vitalry_v1/date-nav-day-view/README.md` (frames
  2a–2f; `AppScreen.dc.html` is the visual prototype). ⚠️ **Naming:** the handoff's *frames*
  (2a–2f) are NOT these *steps* (2.1–2.5). Frame→step map is noted per step below.
- **Scope split (already decided):** the day-browser + month-sheet on the **current** competition
  is Phase 2. The **History tab** (handoff frame 2e, "World A") is **Phase 5** — it reuses the
  Phase 2 day-browser, calendar-cell language, and scoring engine. See `vitalry_product.md`
  roadmap.
- **Decided UX (see `vitalry_product.md` Human-owned decisions, 2026-07-17):** autosave + a
  visible **"All saved ✓"** indicator (no Save button); navigation is **"step and open"** (prev/next
  arrows + a tappable date opening the **month sheet**, the only picker); today + yesterday
  editable, every other day read-only.
- **Data:** `daily_logs.goal_states` jsonb keyed by goal **key**, `UNIQUE (competition_id,
  user_id, local_date)`. RLS already lets a user insert/update their **own** logs in a competition
  they belong to. `competitions.scoring_rules jsonb` exists (currently null) for the snapshot.
- **Reusable day-browser:** introduced in 2.2 (as `viewedDate` + a render mode) and grown one
  state per step (2.3 yesterday-editable, 2.4 read-only/missed, 2.5 picker) — additive, no
  throwaway. Build it parameterized by a competition + date range so Phase 5 History reuses it.

## Scoring contract (for Step 2.1 — from `fit-friends-and-fam-plan.md` §6; product invariants)

> **Revised 2026-07-17 (Amber):** streak simplified — it's now built from **perfect days** with a
> **flat +2** (was: active days with a +1..+5 ramp). Max daily 17 → **14**. Engine + suite reflect this.

- **Base:** 1 pt/goal, max 9/day. Counter goals (rainbow ≥5, water ≥8) count as done via
  `isGoalDone` (`src/lib/goals.ts`).
- **Perfect day:** all 9 → **+3**.
- **Streak** (unit = **perfect day**, all 9): once you reach **3 consecutive perfect days**, each
  perfect day from the 3rd on earns a **flat +2**. Days 1–2 of a run earn no streak bonus; any
  non-perfect day (incl. an unlogged day) resets the run to 0. No ramp, no cap beyond the flat +2.
- **Active day** (**6+/9**): calendar-cell classification only (`dayClass` green) — **not** a scoring
  input in v1.
- **Max daily score:** 9 + 3 + 2 = **14** (on the 3rd+ day of a perfect streak).
- **Day boundary:** player's **local midnight**, stored as `local_date` (a date). No UTC math — the
  engine works on `'YYYY-MM-DD'` strings.
- **Grace:** yesterday editable until end of today (local); older days lock.
- **Tie-breakers** (expose for Phase 3): most perfect days → longest (perfect) streak → shared rank.
- **Snapshot:** rules freeze into `competitions.scoring_rules` at competition start; a
  `DEFAULT_SCORING_RULES` constant is both the seed value and the engine's fallback default. The
  snapshot is self-describing: `{goalCount, activeThreshold, perfectBonus, streakThreshold, streakBonus}`.

---

## The five steps

### Step 2.1 — Scoring engine (pure, fully tested) — ✅ **DONE (2026-07-17)**
- **Shipped:** `src/lib/scoring.ts` + `src/lib/scoring.test.ts` (39 tests, all green). Pure module,
  no React/Supabase. `ScoringRules` / `DayScoreResult` / `StandingResult`, `DEFAULT_SCORING_RULES`,
  `scoreDay`, `scoreCompetition` (walks the full `start_date→asOf` range so gaps reset streaks),
  `dayClass`, and local-date helpers (`localDateToday`, `previousLocalDate`, `nextLocalDate`,
  `localDateRange`, `countDone`).
- **Contract revised mid-build (Amber):** streak is now **perfect-day-based, flat +2 from the 3rd
  consecutive perfect day** (was active-day +1..+5 ramp); max daily **14** (was 17). `active` (6+/9)
  is now calendar-color only. Contract synced in this doc + plan §6 (both dated notes).
- **Retro:** clean run. Gates = code review + security review (e2e N/A — pure module, its suite is
  the verification). Security review surfaced a latent DoS (unbounded/invalid date span) — hardened
  now: `assertLocalDate` rejects non-existent calendar dates, `localDateRange` caps at
  `MAX_DATE_RANGE_DAYS` (3660), years zero-padded on rollover. Matters for 2.2 when dates come from
  the DB. No pitfalls worth a new `pitfalls.md` entry.
- **For 2.2:** import `DEFAULT_SCORING_RULES` as both the seed for `competitions.scoring_rules` and
  the engine fallback; feed `useTodayLog` state into `scoreDay`/`scoreCompetition`.

- **Goal:** one pure TS module encoding the contract above. No React, no Supabase. This is the
  phase's "fully-tested module" deliverable.
- **Files:** `src/lib/scoring.ts` (types `ScoringRules` / `DayScoreResult` / `StandingResult`;
  `DEFAULT_SCORING_RULES`; `scoreDay`, `scoreCompetition`, a `dayClass` helper →
  `perfect | active | some | nothing`; local-date helpers `localDateToday`, `previousLocalDate`).
  `src/lib/scoring.test.ts`. Reuse `isGoalDone` + `DAILY_9` from `src/lib/goals.ts`.
- **Key correctness point:** `scoreCompetition` walks the **full** `start_date → asOf` date range
  (a missing day = 0 done) so streaks reset correctly — do not iterate only the sparse logged days.
- **Test suite must cover:** streak pays flat +2 from the 3rd consecutive **perfect** day, reset on
  any non-perfect day (incl. a 6–8/9 active day and a missed/unlogged day), active threshold exactly
  6/9 (calendar class only), perfect +3, max 14, counter goals, join-in-progress (fewer days), and a
  local-date boundary case (no UTC off-by-one).
- **Checkpoint / exit:** `npm test` green; Amber reviews a short plain-language "how each rule
  scores" readout to confirm the contract before it's baked into UI. No app/deploy impact.
- **Deps:** none.

### Step 2.2 — Today on live `daily_logs` + autosave
- **Goal:** Today reads/writes the real backend for **today only**; the Phase 0 reload-reset fix.
- **Files:** `src/lib/dailyLogs.ts` (find viewer's active competition — status='active' in a group
  they belong to; load their logs for it; **upsert** a day's `goal_states` `onConflict
  competition_id,user_id,local_date`). A `useTodayLog` hook. Rewrite `TodayScreen.tsx` onto live
  data + the 2.1 engine. New `SaveIndicator` component ("Saving… / All saved ✓ / Couldn't save —
  retrying"). **Delete `src/lib/sampleData.ts`** + its usages (Phase 1 carry-over). Empty state
  when there's no active competition.
- **Autosave:** optimistic local update on tap; coalesce writes (one upsert in flight, re-send if
  state changed during it — handles rapid stepper taps).
- **Seed:** `scripts/seed-dev-competition.ts` (idempotent, service_role): "Harriger Family" group +
  Amber as organizer + an **active** competition with `scoring_rules = DEFAULT_SCORING_RULES`.
  Look Amber's user up by email (`alharriger@gmail.com`) via the admin API. Minimal for now
  (history backfill is added in 2.4).
- **Not yet:** no date nav (today only); keep grace copy **passive** (don't promise yesterday —
  that's 2.3).
- **Checkpoint (phone):** tap goals → "All saved ✓" → **reload → state persists**; real day score.
- **Deps:** 2.1.
- **Gotchas:** apply nothing to schema here. The Supabase workbox rule is NetworkOnly — confirm the
  upsert path is never served from the SPA cache.

### Step 2.3 — Yesterday editable + grace lock
- **Goal:** reach & edit yesterday; enforce the grace window for real.
- **Files:** introduce the reusable **day-browser** scaffold in `TodayScreen` (`viewedDate` state +
  prev/next **step arrows** per the handoff "step and open" — but **capped this step**: prev
  reaches yesterday only, next disabled at today). Yesterday renders editable (same check-in as
  today). Client rule: `editable = viewedDate ∈ {today, yesterday}`. Turn the passive grace copy
  into the real affordance. Center date button shows the date as a **label** for now (becomes
  tappable in 2.5).
- **Migration `supabase/migrations/0005_grace_window_guard.sql`:** a `BEFORE INSERT/UPDATE` trigger
  on `daily_logs` rejecting a `local_date` older than yesterday **or** in the future, computed in
  the player's own `profiles.timezone`, **gated on `auth.uid() IS NOT NULL`** so service-role
  seeds/backfills still write. Makes the RLS comment's "grace lock enforced in Phase 2" real +
  satisfies the security gate.
- **Checkpoint (phone):** step to yesterday, edit it, it saves; can't reach/edit older days; after
  local midnight yesterday locks. Add a test asserting the trigger rejects an out-of-window write.
- **Deps:** 2.2.
- **Gotchas:** apply the migration with `supabase db push` and **verify** — never a dashboard paste
  (pitfalls.md). The trigger must not block service_role (auth.uid() is null there).

### Step 2.4 — Browse past days: read-only + missed  *(handoff frames 2c, 2d)*
- **Goal:** step back through the whole competition; view any day as a locked record; kind
  missed-day.
- **Files:** uncap prev stepping to `start_date`. **Read-only day view** (lock banner; `DayScore`
  size 132; "What was logged" record rows — NOT the interactive `GoalRow`, no checkboxes, done disc
  = goal color / not-done = sunken, trailing "Done" / "Not logged"; "Back to today" primary
  button). **Missed-day view** (moon-stars marker, "Nothing logged this day", kind subcopy, every
  goal "Not logged", **never red / never "failed"**). Exact values in the handoff frames 2c/2d.
- **Seed:** extend `seed-dev-competition.ts` to backfill ~3 weeks of Amber's own logs (a mix:
  perfect, active, some-goals, and at least one fully-missed day) so these views — and the 2.5
  heatmap — have real data. Service-role writes bypass the 2.3 grace trigger by design.
- **Checkpoint (phone):** step back across days; each logged day reads as a record; a missed day
  shows kindly; back-to-today works.
- **Deps:** 2.3.
- **Gotchas:** read-only rows must not look tappable (no hover/press/`<button>`); never shame a miss.

### Step 2.5 — Month-sheet picker (heatmap)  *(handoff frame 2b)*
- **Goal:** the designed jump-to-day picker; the date button becomes tappable.
- **Files:** bottom-sheet month calendar (scrim + grabber + weekday header + day grid) opened from
  the center date button. Day-cell state language, **exactly** per frame 2b: perfect (green +
  gold star) / active (green) / some (light green) / nothing (warm gray) / future (dimmed) /
  out-of-comp (muted, non-selectable); **editable** dashed-green ring; **today** solid-evergreen
  ring + "Today" label; **viewing** green base bar; legend. Selecting a day jumps to it + closes.
  Scoped to the **current** competition only. Reuse the 2.1 `dayClass` for cell fills.
- **Checkpoint (phone):** open the sheet, the heatmap reads correctly against your logged history,
  tap a day to jump straight to it.
- **Deps:** 2.4 (needs read-only/missed views to land on) + 2.1 (day-class).
- **Gotchas:** **month-boundary open item** — a 30-day game can straddle two months; default to a
  single continuous `start_date → today` grid unless Amber prefers one month + chevrons (confirm
  during build). Respect `prefers-reduced-motion`; 44px+ targets throughout.

## Phase 2 exit gate (whole — reached cumulatively by 2.5)
Scoring suite green incl. edge cases (streak reset, 3-day threshold, grace lock, local midnight) · real
check-in < 20s on a phone · tap → reload → state persists · yesterday editable within grace,
locked after · can step/pick and read earlier days of the competition.

## Carries forward to Phase 5
The day-browser, calendar-cell language, and scoring engine built here are reused by the Phase 5
**History tab** (replaces Progress; "This competition" heatmap + per-goal rates + streak history,
and "All history" past-competition browsing). See `vitalry_product.md` roadmap + handoff frame 2e.

---

## Infra live (done 2026-07-17)
- **Resend custom SMTP** delivering Supabase Auth mail as `Vitalry <no-reply@vitalry.xyz>`
  (send-only key in `.env`; `vitalry.xyz` verified in Resend). Built-in 2/hr mailer no longer
  applies.
- **`vitalry.xyz` live on Cloudflare Pages** (Git integration: pushes to `main` auto-build; build
  env has the public `VITE_` vars + `NODE_VERSION=22`). HTTPS + SPA fallback; `*.pages.dev`
  previews live. Auth Site URL = `https://vitalry.xyz`. PWA origin locked.

## Phase 1 carry-overs into later phases
- **Phase 4 needs a creator-becomes-organizer trigger/policy.** `group_members` INSERT requires
  organizer, so a client can't bootstrap a usable group yet. Harmless now (seeded via service_role;
  group-creation UX is Phase 4) — Phase 4 must add a trigger making a group's creator its first
  organizer, or an INSERT policy allowing self-add as organizer.
- **Delete `src/lib/sampleData.ts`** — folded into Step **2.2**.
- **Phase 6:** trim Phosphor's unused ttf/woff/svg fallbacks so they aren't emitted to `dist`.

## Verifying magic-link sign-in without email (mailer-free)
`admin.generateLink({ type:'magiclink', email, options:{ redirectTo:'http://localhost:5173/auth/callback' }})`
with the service_role key returns a single-use `action_link` (no email, no rate limit). Click it on
the machine running `npm run dev`. This is how Phase 1's exit gate was demonstrated end-to-end.

## Phase 1 — DONE (for reference)
Shipped: 6-table Postgres schema (`profiles`, `groups`, `group_members`, `competitions`, `goals`,
`daily_logs`) via CLI migrations in `supabase/migrations/`; **RLS on every table** scoped to group
membership using `SECURITY DEFINER` helpers (no policy recursion); Daily 9 seeded; Realtime on
`daily_logs`; passwordless magic-link auth (`SignInScreen` + `AuthCallback` + `AuthGate`,
`src/lib/auth.tsx`, `src/lib/supabase.ts`); Supabase NetworkOnly workbox rule + Cloudflare SPA
fallback; keep-alive GitHub Action (every 3 days). All three merge gates passed + Amber's manual
sign-in test. Detail lives in `architecture.md` + the migration files.

## Standing handoff notes
- Scripts: `npm run dev` (:5173) · `npm run build` · `npm test` · `npm run test:e2e` ·
  `npm run test:rls` (live DB + `.env` service_role; not in CI) · `npm run lint` · `npm run typecheck`.
- **Supabase migrations:** author SQL in `supabase/migrations/`, then apply with
  `supabase db push` (needs `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_DB_PASSWORD` in `.env`).
  Never paste into the dashboard SQL editor — a partial error rolls the whole batch back silently
  (pitfalls.md). After any migration, verify the objects exist before building on them.
- `.env` (gitignored) holds Supabase URL + anon + service_role + access token + DB password +
  `RESEND_API_KEY`; `.env.example` is the committed template. Cloudflare Pages + GitHub Actions
  hold only the public `VITE_` values, never the service_role / DB password / Resend key.
- Design handoff is high-fidelity for built screens; the hard rules (44px targets, WCAG AA, ≥16px
  body) win over the reference (pitfalls.md).
