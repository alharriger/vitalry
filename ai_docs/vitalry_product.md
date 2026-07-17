# Vitalry — Product Doc

**Source founding docs:** `fit-friends-and-fam-plan.md` (definitive brief, v1.0 Jul 2026) and
`design_handoff_vitalry_v1/README.md` (design handoff). This doc is the *living* summary +
roadmap; the founding docs are immutable history.

## Strategy — the what and why

A group wellness game. Friends/family join a fixed-length competition (7/14/30 days) and each
day complete the same list of 9 healthy habits ("the Daily 9"). Points come from **goal
completion only** — fairness by design. A 68-year-old and a marathoner compete on equal
footing; consistency beats intensity.

**Mission:** get the people you love — especially aging parents — building small daily
wellness habits via light social competition.

**v1 beta:** Amber's own family, ~6–12 people, mixed iPhone/Android, as a mobile-first PWA
shared by invite link.

## Product principles (settle every decision here)

1. **Fair by design** — never surface raw stats comparatively. Permanent, not just v1.
2. **Logging is a tap, never a chore** — full daily check-in under 20 seconds.
3. **Honor system is a feature** — self-report; social accountability polices it.
4. **Forgiving beats strict** — grace windows, catchable leaderboards.
5. **Designed for a 68-year-old on Android** — 44px targets, AA contrast, shallow nav.
6. **Simple now, scalable later** — data model ready for wearables/custom goals; no rewrites.

## Core specs (implement exactly — see plan §5–§7 for full detail)

- **Daily 9:** rainbow (5 color dots), protein ✓, fiber ✓, move ✓, sweat/strength ✓,
  fresh air ✓, water (8 cups), sleep ✓, mind ✓. Fixed list, no configuration in v1.
- **Scoring:** 1 pt/goal (max 9) · perfect day +3 · active day = 6+/9 · streak +1/day capped
  at +5 · max 17/day · local-midnight day boundary · yesterday editable until end of today ·
  tie-breakers: perfect days → longest streak → shared rank.
- **Transparency:** any leaderboard row → day-by-day breakdown of every point.
- **Competitions:** presets 7/14/30 only; optional free-text prize; one active competition per
  group; join-in-progress allowed; groups persist across competitions ("run it back").

## Roadmap (v1 build phases)

Each phase has an **exit gate** — do not start the next phase until the gate passes and the
user has approved. Ordering follows the handoff §7.

| Phase | Scope | Exit gate |
|---|---|---|
| **0 — Scaffold** | Vite + React + TS + PWA plugin; design tokens + fonts + Phosphor wired; routing shell (4 tabs + flow routes); port core components Today needs | App runs on a phone-width viewport with styled tab shell; tokens resolve; user approves look |
| **1 — Backend & auth** | Supabase project; schema from plan §10; seed Daily 9; RLS scoped to group membership; magic-link/invite auth | A test user can sign in via magic link; RLS verified (user A cannot read group B) |
| **2 — Today + scoring engine** | Today on live `daily_logs`; scoring as a pure, fully-tested module (base/perfect/active/streak/cap/grace); rules snapshot per competition; optimistic taps auto-saved with a visible "All saved ✓" indicator (no Save button); **date navigation — "step and open" (prev/next day + a month-sheet picker with a per-day heatmap), scoped to the current competition; a reusable day-browser with editable (today/yesterday), read-only, and missed-day states**; grace lock enforced (client + DB trigger in the player's local tz). Design handoff: `design_handoff_vitalry_v1/date-nav-day-view/` (frames 2a–2d, 2b). | Scoring suite green incl. edge cases (streak reset, cap, grace lock, local midnight); real check-in < 20s on a phone; tap → reload → persists; yesterday editable within grace, locked after; can browse/read earlier days of the competition |
| **3 — Leaderboard + breakdown** | Realtime ranking, today-progress pips, tap-through day breakdown, days-remaining + prize header | Two devices see each other's taps live; breakdown math matches engine exactly |
| **4 — Setup + onboarding + invites** | Organizer creates competition → invite link; join flow: name/avatar/how-it-works/add-to-home-screen/reminders | A brand-new person joins from a text-message link in < 2 min, no help |
| **5 — History, Group, Results** | **History tab replaces Progress ("World A"):** "This competition" = month heatmap + per-goal completion rates + streak history; "All history" = list of every past competition with mini-heatmaps, each tapping through to that competition's read-only day browser (reuses the **Phase 2 day-browser + calendar-cell language**). Group home + "run it back"; finale celebration + superlatives. Design handoff: `design_handoff_vitalry_v1/date-nav-day-view/` (frame 2e). | Full competition lifecycle end-to-end incl. finished-competition results; History browses every past competition's days |
| **6 — Notifications & polish** | Web push + email fallback; daily reminder + competition events; accessibility audit | Reminder arrives on Android Chrome and iOS (installed); audit against principle 5 passes |
| **Beta** | Family competition, measure metrics (plan §14) | ≥60% still logging on final day; "run it back" happens unprompted |

**Later:** v1.5 Capacitor wrap + HealthKit/Google Fit read-sync · v2 custom goals/durations ·
v3 real stakes (validate first; legal review required).

## User stories

### Functional (built)
*(none yet — pre-code)*

### Next up (v1)
- As an **organizer**, I create a group and competition (name, 7/14/30, start date, prize
  text) and get an invite link I can drop in a family text thread.
- As a **parent**, I open one obvious screen and tap the goals I did today in under 20 s.
- As a **parent**, I can **trust my taps are saved** — I see clear "saved" feedback and my
  check-ins are still there when I reopen the app, without hunting for a Save button.
  *(From Amber's Phase 0 test: reload reset progress and there was no reassurance it saved.)*
- As a **parent**, I can still fix yesterday if I forgot to log — and I can **actually get to
  yesterday** from Today while the grace window is open. *(Phase 0 showed the "still editable
  until midnight" hint with no way to reach yesterday.)*
- As a **player**, I see the leaderboard update live and can tap anyone to audit exactly how
  every point was earned.
- As a **competitive sibling**, I earn streak and perfect-day bonuses and can verify the math.
- As a **player**, I see my personal heatmap and per-goal completion rates, away from
  comparison.
- As a **player**, I get a reminder at my chosen time (push, or email fallback).
- As a **group**, we see a finale celebration with superlatives and can "run it back."

## UX note — "saved" reassurance vs. a manual Save button (Phase 2)

Amber's Phase 0 test surfaced a real need: a parent taps their goals and wants to *feel* their
progress is safe. A literal **Save button** is the intuitive fix but works against two core
commitments: Principle 2 ("logging is a tap, never a chore — no forms, no extra steps") and the
plan's "optimistic tap logging." Worse, a manual save adds a new failure mode — tap everything,
forget to save, lose it — which hits the forgetful-parent persona hardest, the exact person the
grace window exists to protect.

**Recommendation (needs Amber's ok on the exact mechanism):** every tap auto-saves optimistically
to Supabase, paired with a small, always-visible **saved indicator** (e.g. an "All saved ✓" /
syncing affordance near the day score, plus a gentle per-tap confirmation). This delivers the
*feeling* of saving — the actual goal — with zero chore and no forgot-to-save risk, the modern
autosave pattern. If Amber still wants an explicit button after seeing it, that's her call
(logged under Human-owned decisions).

The Phase 0 reload-reset that prompted this is **not** a design flaw — it's simply the scaffold
having no backend yet. Persistence lands with Phase 2.

**Decided 2026-07-17:** autosave + an always-visible **"All saved ✓"** indicator — no Save
button. (Logged under Human-owned decisions.)

## Out of scope for v1 (do not design for by accident)

Real money · wearable sync (architecture-ready only) · custom/configurable goals · custom
durations · raw-stat comparisons (**permanent**) · chat/comments · photo proof · app stores.

## Success metrics (family beta)

- Activation ≥80% of invitees log day 1.
- **The one that matters:** ≥60% still logging on the final day of a 14-day competition.
- Median check-in ≤20 s; ≥50% of player-days are active (6+/9).
- The group runs it back without Amber begging.

## Human-owned decisions

**Decided by Amber 2026-07-12:**
- ✅ **Type pairing:** Bricolage Grotesque + Hanken Grotesk — locked.
- ✅ **Palette:** evergreen-led palette — confirmed and locked.
- ✅ **Product name:** **Vitalry** (not "Fit Friends & Fam").
- ✅ **Budget constraint:** "balling on a budget" — build something great without paid
  tooling; free tiers wherever quality allows. Architecture must honor this.

**Decided by Amber 2026-07-17:**
- ✅ **Save affordance (Phase 2):** autosave + an always-visible **"All saved ✓"** indicator.
      No manual Save button. Resolves the Phase 0 open question.
- ✅ **Date navigation = "step and open":** prev/next-day arrows + a tappable date that opens a
      **month-sheet picker** (a per-day heatmap of the competition). The month sheet is the only
      picker. Today + yesterday editable; every other day read-only. Finished design handed off
      (`design_handoff_vitalry_v1/date-nav-day-view/`). Supersedes the earlier Today/Yesterday
      toggle idea.
- ✅ **"World A" — the third tab becomes History (replaces Progress).** History holds "This
      competition" (heatmap + per-goal rates + streak history) and "All history" (every past
      competition, tap-through to its day browser). Lands in **Phase 5**; reuses the Phase 2
      day-browser.

**Still open:**
- [ ] **Leaderboard detail of others:** counts + tap-through breakdown (recommended) vs
      broadcasting individual goals. Decide during Phase 3 design.
- [ ] **Month-sheet boundary (design open item):** one month with prev/next chevrons vs. a single
      `start_date → today` grid, since a 30-day game can straddle two months. Decide during Phase 2 build.
