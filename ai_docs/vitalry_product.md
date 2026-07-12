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
| **2 — Today + scoring engine** | Today screen on live `daily_logs`; scoring as a pure, fully-tested module (base/perfect/active/streak/cap/grace); rules snapshot per competition; optimistic taps | Scoring suite green incl. edge cases (streak reset, cap, grace lock, local midnight); real check-in < 20s on a phone |
| **3 — Leaderboard + breakdown** | Realtime ranking, today-progress pips, tap-through day breakdown, days-remaining + prize header | Two devices see each other's taps live; breakdown math matches engine exactly |
| **4 — Setup + onboarding + invites** | Organizer creates competition → invite link; join flow: name/avatar/how-it-works/add-to-home-screen/reminders | A brand-new person joins from a text-message link in < 2 min, no help |
| **5 — Progress, Group, Results** | Personal heatmap + per-goal rates; group home + "run it back"; finale celebration + superlatives | Full competition lifecycle works end-to-end incl. finished-competition results |
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
- As a **parent**, I can still fix yesterday if I forgot to log (grace window).
- As a **player**, I see the leaderboard update live and can tap anyone to audit exactly how
  every point was earned.
- As a **competitive sibling**, I earn streak and perfect-day bonuses and can verify the math.
- As a **player**, I see my personal heatmap and per-goal completion rates, away from
  comparison.
- As a **player**, I get a reminder at my chosen time (push, or email fallback).
- As a **group**, we see a finale celebration with superlatives and can "run it back."

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

**Still open:**
- [ ] **Leaderboard detail of others:** counts + tap-through breakdown (recommended) vs
      broadcasting individual goals. Decide during Phase 3 design.
