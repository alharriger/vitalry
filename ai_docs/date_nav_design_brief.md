# Design brief — Date navigation & day view (Phase 2)

**Status: RESOLVED 2026-07-17 — finished design received.** The authoritative build spec is now
`design_handoff_vitalry_v1/date-nav-day-view/README.md` (+ the `AppScreen.dc.html` prototype).
Build to that; this file is kept only as the original brief and the record of how the decisions
converged.

**Converged decisions (see the handoff for full values):**
- **Navigation = "step and open"** — prev/next-day arrows + a tappable date that opens the
  **month-sheet picker** (the only picker), a per-day heatmap of the competition.
- **Editable = today + yesterday; every other day read-only** — with a lock banner + "what was
  logged" record rows, and a no-shame "nothing logged this day" state for misses.
- **Reusable day-browser** parameterized by competition + date range — used by Today now and by
  the **Phase 5 History tab** later.
- **"World A":** the third tab becomes **History** (replaces Progress), holding "This competition"
  (heatmap + per-goal rates + streak history) and "All history" (past competitions). **Phase 5.**

The scope split (Phase 2 = day-browser + picker on the current competition; Phase 5 = the History
tab that reuses them) is recorded in the `ai_docs/vitalry_product.md` roadmap.

---

*Original brief (pre-design) follows for the record:*

---

## Why this exists

In the Phase 0 test, Today said *"yesterday is still editable until midnight"* but there was no
way to reach yesterday — a dead-end (logged in `pitfalls.md`). Phase 2 makes the grace window
real. We need a genuine, discoverable way to move between days.

Amber's direction: a **calendar icon** that opens a date selector; you pick a day and view it
inside the Today screen. **Today and yesterday can be edited; every other day is read-only.**

## The functional contract (non-negotiable — design around these, don't redesign them)

These come from the scoring rules (plan §6) and are fixed:

- **Editable days = today + yesterday only.** "Yesterday stays editable until *your local*
  midnight." At local midnight, yesterday becomes read-only and today's new day opens.
- **Every other day is read-only** — view what was logged, no taps do anything.
- **Selectable range** = the competition's own days: from `start_date` through today (or the
  final day if the competition has ended). Days before the competition started or after today
  don't exist — they should not be selectable.
- **Day boundary is the player's local midnight** — never a UTC/server clock.

## What to design

1. **Entry point.** Where the calendar icon lives on Today (likely the header) and what it
   communicates. Phosphor `ph-calendar-*` glyph, paired with a text label per our icon rule.
2. **Date selection.** How you pick a day — a mini month grid? a horizontal day strip? Something
   simpler? Whatever passes the 68-year-old test: obvious, ≥44px targets, one-handed.
3. **The day-view states** (this is the heart of it — design each):
   - **Today, editable** — the normal check-in (the current Today screen).
   - **Yesterday, editable** — same, plus a gentle "editable until midnight" affordance so it's
     clear this is the grace day, not today.
   - **An older day, read-only** — goals shown exactly as they were logged; visually
     *unmistakably* non-interactive (the parent must know at a glance that tapping does nothing).
   - **A day with nothing logged (a miss)** — shown without shame. "Nothing logged" / "a rest
     day," never "you failed," no danger red. (Hard rule: never shame a miss.)
   - **Return to today** — always one obvious tap back to today from any other day.
4. **Editable vs. read-only, made obvious.** The single most important visual job here: a
   68-year-old must instantly tell whether a tap will register. Don't rely on subtlety.

## Hard rules (these win over any design idea)

- Design **tokens only** (`var(--…)`), never hard-coded hex. Warm cream backgrounds, warm ink,
  no cool grays / cold shadows.
- **Phosphor icons only**, always with a text label. No emoji, no custom SVG icons.
- **44px+ touch targets**, WCAG AA contrast, body ≥16px, everything ≤2 taps from Today,
  one-handed. Visible 3px warm-green focus ring.
- **Never shame a miss.** Danger red never marks a missed goal.
- Voice: family game night, second person, sentence case, gentle words.

(Full rules: `ai_docs/design_system.md`. The design handoff is authoritative on look/feel, NOT on
the accessibility floors above — those always win.)

## Scope boundary — don't absorb Phase 5

This brief is the **in-competition day browser + single-day view**. The richer *"My progress"*
surface — the calendar heatmap, streak history, per-goal completion rates ("you hit Fresh air
92% of days") — is a separate **Phase 5** screen, away from comparison. Design this to be
visually *compatible* with that, but don't build it here. If read-only browsing should reach the
whole competition history vs. just recent days, that's a scope call — flag it, don't assume.

## Open questions for Amber

- Calendar style: full month grid, a compact day strip, or a simple date list? (Fewer days in a
  7/14/30-day competition — a month grid may be overkill.)
- Does read-only browsing extend to *every* past competition day, or just the last few? (More
  than a few starts to become the Phase 5 progress view.)
- Exact copy for the grace/read-only/missed-day affordances.

## Deliverable

Sketches, a token-based mockup, or component notes — whatever's easiest for you to react to.
It feeds back into `TodayScreen.tsx`. The functional default I build in the meantime will be
plain but correct (calendar icon → date picker → editable today/yesterday, read-only otherwise),
so nothing is blocked while this design lands.
