# Working Sprint — LIVE phase tracker

> Cross-session handoff doc. Documents the **current phase only**; refresh when a phase
> completes. Read this first every session.

## Current phase: Phase 0 — Scaffold (built, awaiting Amber's manual test)

**Status:** Phase 0 plan approved and **built** on branch `phase-0-scaffold`. All automated
gates green (lint, typecheck, 24 unit tests, build, 3 Playwright e2e). Verified visually via
mobile screenshots. **Waiting on Amber's manual test on her phone before commit/merge.**

## Tasks

- [x] Kickoff: docs + memory scaffolded; agreements approved
- [x] Budget architecture reassessment ($0/mo stack) → architecture.md
- [x] Amber approved Phase 0 plan + three decisions (fonts/palette/name)
- [x] Branch `phase-0-scaffold`; scaffold built:
  - [x] Vite + React 19 + TS + vite-plugin-pwa (manifest + service worker generated)
  - [x] Self-hosted woff2 fonts + tokens wired via `src/styles/styles.css`; Phosphor via npm
  - [x] 10 design-system components ported to typed React (`src/components/`)
  - [x] Routing: 4 tabs (Today built) + flow routes (Setup/Join/Results/Settings placeholders)
  - [x] TodayScreen live against sample data; other tabs branded placeholders
  - [x] Vitest + RTL (24 tests) + Playwright (3 e2e); GitHub Actions CI
- [ ] **Amber manual-tests on her phone** (see script handed off in chat)
- [ ] Fix anything she finds → commit → open PR → three merge gates → merge to main
- [ ] Retro → refresh this doc for Phase 1 (Supabase + auth)

## Decisions this phase

- Doc system: CLAUDE.md = pointers; ai_docs/ = source of truth. No `llm_contracts.md`.
- Founding docs are immutable reference; living state goes in ai_docs.
- 2026-07-12: $0/mo architecture locked (see architecture.md decision log).
- Ported the design system's runtime CSS-injection pattern to idiomatic Vite co-located CSS
  imports. Fonts self-hosted (latin + latin-ext woff2); no CDNs anywhere.
- Kept the huge unused Phosphor ttf/woff/svg fallbacks out of the PWA precache; trimming them
  from the build is a Phase 6 TODO.

## Blockers

- Amber's manual test is the gate before this branch is committed and merged.

## Handoff notes for next session

- Branch `phase-0-scaffold` holds all the app code; `main` has only the kickoff docs commit.
- Scripts: `npm run dev` (localhost:5173), `npm run build`, `npm test`, `npm run test:e2e`,
  `npm run lint`, `npm run typecheck`.
- Sample data (`src/lib/sampleData.ts`) is scaffold-only — delete when Today reads live data
  in Phase 2. `src/lib/goals.ts` (Daily 9 + `isGoalDone`) carries forward and gets seeded to
  the `goals` table in Phase 1.

## Handoff notes

- Design handoff is high-fidelity: recreate `app-reference/` screens faithfully in
  React + TS; tokens usable verbatim. Join/onboarding and Settings screens have **no**
  design reference — build from plan §8.
- Untracked files in repo: docs just created, plus founding docs — commit as the kickoff
  commit once agreements are approved.
