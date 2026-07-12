# Working Sprint — LIVE phase tracker

> Cross-session handoff doc. Documents the **current phase only**; refresh when a phase
> completes. Read this first every session.

## Current phase: Phase 0 — Scaffold (planning)

**Status:** Kickoff approved 2026-07-12 (fonts, palette, name = Vitalry all locked). Budget
architecture reassessment done and recorded in architecture.md. **Phase 0 plan presented to
Amber — waiting on approval before any code.**

## Tasks

- [x] Kickoff: docs + memory scaffolded; agreements approved
- [x] Budget architecture reassessment ($0/mo stack; Cloudflare Pages; Resend SMTP;
      keep-alive cron) → architecture.md
- [ ] Amber approves Phase 0 plan
- [ ] Branch `phase-0-scaffold`; build scaffold per plan
- [ ] Manual-test pause: Amber verifies tab shell + look on her phone
- [ ] Retro → refresh this doc for Phase 1

## Decisions this phase

- Doc system: CLAUDE.md = pointers; ai_docs/ = source of truth. No `llm_contracts.md` — the
  product uses no LLM.
- Founding docs (`fit-friends-and-fam-plan.md`, `design_handoff_vitalry_v1/`) are immutable
  reference; living state goes in ai_docs.
- 2026-07-12: $0/mo architecture locked (see architecture.md decision log).

## Blockers

- Phase 0 plan awaiting Amber's approval (hard rule: no code before approval).

## Handoff notes

- Design handoff is high-fidelity: recreate `app-reference/` screens faithfully in
  React + TS; tokens usable verbatim. Join/onboarding and Settings screens have **no**
  design reference — build from plan §8.
- Untracked files in repo: docs just created, plus founding docs — commit as the kickoff
  commit once agreements are approved.
