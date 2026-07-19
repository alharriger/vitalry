# Vitalry (working title: Fit Friends & Fam)

Group wellness game: fixed-length competitions where everyone completes the same
daily habit list. Points for goal completion, never raw fitness stats.

**CLAUDE.md holds pointers only. Source of truth lives in `ai_docs/`.**

## Where things live

- Product strategy, roadmap, user stories → [ai_docs/vitalry_product.md](ai_docs/vitalry_product.md)
- Architecture decisions + decision log → [ai_docs/architecture.md](ai_docs/architecture.md)
- Design system rules + voice/tone → [ai_docs/design_system.md](ai_docs/design_system.md) (tokens/components: `design_handoff_vitalry_v1/design-system/`)
- Current phase status + handoff notes → [ai_docs/working_sprint.md](ai_docs/working_sprint.md) ← **read this first each session**
- How to test a change (phone/preview/gates) → [ai_docs/testing_runbook.md](ai_docs/testing_runbook.md)
- Mistakes log + prevention rules → [ai_docs/pitfalls.md](ai_docs/pitfalls.md)
- Original founding docs → `fit-friends-and-fam-plan.md` + `design_handoff_vitalry_v1/README.md`

## Hard rules (details in the docs above)

- Plan → user approval → implement → manual-test pause → commit. Never skip approval.
- New work on a new branch; three gates before merge (e2e verify, code review, security review).
- Scoring rules are a contract: changes require re-running the scoring test suite and logging the delta.
- Never surface raw stats (calories, miles, weights) in any comparative context — permanent product invariant.
- UI must pass the 68-year-old test: 44px+ targets, WCAG AA, ≥16px body type, ≤2 taps from Today.
- Design tokens only (`var(--…)`), never hard-coded hexes; Phosphor icons only, no emoji in UI.
