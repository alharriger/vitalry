# Vitalry — Pitfalls Log

Every mistake gets an entry with a prevention rule, reviewed at each retrospective.
A pitfall without a prevention rule is just a diary entry — don't add those.

**Required format:**

```
## <short title>
- **What happened:**
- **Root cause:**
- **Prevention rule:**
- **Status:** Active | Retired
```

---

## Faithfully ported a design-handoff value that broke a hard rule (44px floor)
- **What happened:** The Stepper's −/+ buttons were ported at 40px (and shrunk to 36px when
  nested in a GoalRow) — below the project's hard 44px touch-target floor — because the
  design handoff's Stepper CSS itself used 40px. Caught by the code-review merge gate.
- **Root cause:** Treated the design reference as authoritative on a dimension governed by a
  non-negotiable accessibility rule, and the handoff was internally inconsistent (its CSS said
  40px; its own usage doc said 48px).
- **Prevention rule:** The design handoff is authoritative on look/feel, NOT on the hard
  rules in CLAUDE.md (44px targets, WCAG AA, ≥16px body). When porting, check every
  interactive element against the accessibility floor and let the rule win over the reference.
- **Status:** Active

## Affordance copy shown for a non-existent feature (grace-window hint)
- **What happened:** The Phase 0 Today screen shows "Yesterday is still editable until
  midnight," but there is no way to reach yesterday — it's a static hint with no backing
  feature. Amber (testing the installed app) tried to access it and couldn't.
- **Root cause:** Ported the design reference's copy verbatim into the scaffold without
  gating text that promises an interaction the scaffold doesn't yet implement.
- **Prevention rule:** In a scaffold/placeholder, don't render copy that promises an action
  the screen can't perform. Either wire the interaction or soften the text to describe the
  rule ("Yesterday stays editable until midnight" as passive info) until the feature exists.
  Grace-window navigation is a Phase 2 build item (see product roadmap).
- **Status:** Active
