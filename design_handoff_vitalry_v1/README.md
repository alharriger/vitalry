# Project Kickoff Handoff — Fit Friends & Fam (Vitalry v1)

This bundle is the founding context for building **Fit Friends & Fam** (product name **Vitalry**), a warm, playful group-wellness game. It is meant to be dropped into **Claude Code / cowork** and used to *plan the project and scaffold the codebase* — not to be shipped as-is.

Read this file first. It is self-sufficient: a developer (or agent) who was not in the design conversation can plan and start the build from this document alone. Everything here traces back to `product-plan.md` (the definitive brief) and the design system in `design-system/`.

---

## 0. What's in this bundle

```
design_handoff_vitalry_v1/
├── README.md            ← you are here — the kickoff & setup plan
├── product-plan.md      ← the definitive product brief (v1.0, concept → data model)
├── design-system/       ← the Vitalry Design System (the visual + interaction language)
│   ├── README.md         · full design guide (voice, color, type, icons, manifest)
│   ├── SKILL.md          · agent-skill front matter — lets Claude Code load this as a skill
│   ├── styles.css        · single CSS entry point (link this one file)
│   ├── tokens/           · all CSS custom properties (colors, type, spacing, effects, fonts, base)
│   └── components/       · React component sources (.jsx) + prop contracts (.d.ts) + usage notes (.prompt.md)
└── app-reference/       ← interactive HTML recreation of every v1 screen (design reference, NOT prod code)
    ├── index.html        · open this to click through all six screens in a phone frame
    ├── TodayScreen.jsx, StandingsScreen.jsx, ProgressScreen.jsx,
    │   GroupScreen.jsx, ResultsScreen.jsx, SetupScreen.jsx
    └── data.js           · shared sample data (Daily 9, players, heatmap, rates)
```

### How to read the design files
The files in `design-system/` and `app-reference/` are **design references authored in HTML/JSX** — prototypes showing the intended look and behavior. They are **not** the production codebase. The task is to **recreate these designs in a real React + TypeScript + Vite app** (the stack chosen in the plan), wiring them to a real backend. The design-system CSS tokens *can* be used verbatim; the component `.jsx` files are high-fidelity references to port to TypeScript with real data and state.

### Fidelity: **High.** 
The design system and the `app-reference` screens are pixel-level: final colors, typography, spacing, radii, iconography, and interaction feel are all locked. Recreate the UI faithfully, then replace the sample data with live data. Two things are still *proposed* (see plan): the type pairing (Bricolage Grotesque + Hanken Grotesk is applied, two alternatives exist) and the exact palette — confirm with the owner before locking, but build against what's in `tokens/`.

---

## 1. Product in one page

**Concept.** Friends, families, and coworkers join a fixed-length competition (7 / 14 / 30 days) and each day complete the same list of healthy habits. You earn points for *completing goals*, not for how fit you are — so a 68-year-old and a marathoner compete on equal footing. **Fairness by design** is the thesis; **consistency beats intensity**.

**Non-negotiable principles** (from plan §2 — let these settle every decision):
1. **Fair by design** — never surface raw stats (calories, miles, weights) in any comparative context, ever. The leaderboard only knows goal completion.
2. **Logging is a tap, never a chore** — every goal is a tap or a few taps; no forms, no number entry. Full daily check-in in **under 20 seconds**.
3. **Honor system is a feature** — players self-report; social accountability polices honesty. No photo proof.
4. **Forgiving beats strict** — grace windows, achievable streaks, catchable leaderboards.
5. **Designed for a 68-year-old on Android** — 44px+ targets, WCAG AA, ≥16px body, shallow nav (≤2 taps from Today), one-handed.
6. **Simple now, scalable later** — v1 is small, but the data model leaves room for wearables, custom goals, and native wraps with no rewrites.

**Users.** Primary v1 target is **one real family group of ~6–12 people, mixed iPhone/Android** (the owner's own family is the beta). Personas: the Organizer (recruits + retains), the Parents (biggest accessibility bar, most likely to forget to log), the Competitive Sibling (will find scoring loopholes — scoring must be airtight and auditable).

**The core loop.** Organizer creates group → invites via link → group joins → competition starts → **daily: open app, tap goals, see points, peek at leaderboard** → competition ends → results & celebration → "run it back."

---

## 2. The Daily 9 (fixed in v1 — same list for everyone)

| # | Goal | Target | Logging | Color token |
|---|---|---|---|---|
| 1 | **Eat the rainbow** | 5+ produce colors | Tap up to 5 color dots (red, orange/yellow, green, blue/purple, white/other); completes at 5 | `--goal-rainbow` |
| 2 | **Protein** | Hit your protein goal | Single tap ✓ (honor system) | `--goal-protein` |
| 3 | **Fiber** | Hit your fiber goal | Single tap ✓ | `--goal-fiber` |
| 4 | **Move** | 30 min movement (walk/hike/bike/dance) | Single tap ✓ | `--goal-move` |
| 5 | **Sweat or strength** | 20+ min intentional workout | Single tap ✓ | `--goal-sweat` |
| 6 | **Fresh air** | 20 min outside | Single tap ✓ | `--goal-air` |
| 7 | **Water** | 8 cups / 64 oz | Tap glasses (8 icons); completes at 8 | `--goal-water` |
| 8 | **Sleep** | 7+ hours | Single tap ✓ | `--goal-sleep` |
| 9 | **Mind** | Read 10pp / meditate 10min / journal (any one) | Single tap ✓ | `--goal-mind` |

**Double-dipping rule:** one activity can count across *categories* (a 30-min outdoor walk = Move ✓ + Fresh air ✓), but Move and Sweat/strength require **distinct** activities. Build the scoring so these two goals can't be satisfied by the same logged activity if you ever move beyond pure honor-system taps.

---

## 3. Scoring spec (implement exactly — this is the fairness contract)

| Mechanic | Rule |
|---|---|
| **Base points** | 1 pt per goal completed. Max 9/day. |
| **Perfect-day bonus** | All 9 goals in a day → **+3** |
| **Active day** (streak unit) | A day with **6+ of 9** goals |
| **Streak bonus** | +1 pt per consecutive active day, **capped at +5/day** (day 1 = +1, day 5+ = +5). Resets after a non-active day. |
| **Max daily score** | 9 + 3 + 5 = **17** |
| **Day boundary** | Each player's **local midnight** (store `local_date`, not UTC). |
| **Grace window** | Yesterday stays editable until end of today (local). Older days lock. |
| **Tie-breakers** | 1) most perfect days → 2) longest streak → 3) shared rank (co-winners are fine). |

**Transparency requirement:** every player must be able to tap any leaderboard row and see a day-by-day breakdown of exactly how points were earned. Competitive players trust what they can audit.

**Two engineering rules from the plan:** (a) **scores are computed, not stored** — materialize a view/cache if needed, so rules can be tuned during beta without migrations; (b) **scoring rules snapshot at competition start** so tuning never changes a live game.

---

## 4. Architecture & stack (decided — plan §10)

Web-first, native-ready. Same codebase later wraps into store apps.

| Layer | Choice | Notes |
|---|---|---|
| **Frontend** | **React + TypeScript + Vite**, as an installable **PWA** | Capacitor path (v1.5) requires a standard web SPA. |
| **Backend** | **Supabase** (Postgres + Auth + Realtime) preferred over Firebase | Free tier covers a family beta; realtime makes the leaderboard feel alive; **magic-link auth = no passwords** (critical for parents). |
| **Notifications** | Web Push API + **email fallback** (e.g. Resend free tier) | iOS Safari web push needs home-screen install → onboarding must guide it. |
| **Hosting** | Vercel / Netlify free tier | Est. running cost **$0–5/month** at family-beta scale. |
| **Native (v1.5)** | Capacitor wrap → App Store + Play Store | Days of work, not a rewrite. Don't design anything that blocks this. |

### Data model sketch (from plan §10 — seed the schema from this)
```
users          (id, name, avatar, email?, timezone, reminder_time)
groups         (id, name, created_by)
group_members  (group_id, user_id, role: organizer|member)
competitions   (id, group_id, name, start_date, duration_days,
                prize_text?, status: pending|active|complete)
goals          (id, key, name, target_text, log_type: check|counter,
                counter_max?, sort_order, active)   ← static seed in v1
daily_logs     (id, competition_id, user_id, local_date,
                goal_states: jsonb {goal_id: 0..n}, updated_at)
                UNIQUE (competition_id, user_id, local_date)
```
**Scalability baked in now (keep these):** goals live in a **table, not code** (v2 custom goals = rows + picker); `daily_logs.goal_states` is manual today, add a per-state `source: manual|healthkit|googlefit` when wearables arrive (no schema upheaval); store `local_date` (the player's date) so time zones stay simple forever. Group size is **unbounded** in the model even though v1 UI is tuned for 4–12.

---

## 5. Screen inventory & fidelity (plan §8 · reference in `app-reference/`)

Ordered by importance. **The first two are 80% of the product.** Each has a pixel-level reference screen — open `app-reference/index.html` and click through.

1. **Today (daily check-in)** — `TodayScreen.jsx`. The home screen. All 9 goals as large tappable rows; color dots for rainbow, glass stepper for water, single-tap ✓ for the rest. Running day score dial (fills, turns gold at 9/9), streak flame with count, perfect-day celebration. Yesterday reachable within the grace window. **Must pass the 68-year-old test.**
2. **Leaderboard / Standings** — `StandingsScreen.jsx`. Ranked list: name/avatar, total points, streak, today's progress (e.g. 6/9 pips) so it feels alive. Days remaining + prize text on top. **Tap a player → day-by-day breakdown** (transparency).
3. **My progress** — `ProgressScreen.jsx`. Personal calendar/heatmap: perfect/active/missed days, streak history, per-goal completion rates ("Fresh air 92% of days"). No comparisons here — this is self-improvement.
4. **Competition setup** — `SetupScreen.jsx`. Organizer flow: name it, pick 7/14/30, start date, optional free-text prize → generates invite link.
5. **Join / onboarding** — *(not in the reference kit — build from plan §8)*. From invite link: name + avatar (+ optional email), one-screen "how it works", guided add-to-home-screen, enable reminders. Target **under 2 minutes, no app store**.
6. **Group home** — `GroupScreen.jsx`. Members, active competition card, past results, **"Run it back"** button.
7. **Results / celebration** — `ResultsScreen.jsx`. Winner celebration, final standings, superlatives ("Most perfect days," "Hydration champion"). The screenshot-and-share moment.
8. **Settings** — *(build from plan §8)*: profile, reminder time, notification prefs, leave group.

**Notifications (v1):** daily reminder at a user-chosen time (default 8pm), competition events (started / halfway / final day / results). Web push where available, **email fallback** otherwise.

---

## 6. Design system — how to consume it

The full guide is `design-system/README.md`. Load `design-system/SKILL.md` as a skill in Claude Code so the agent designs on-brand automatically. Highlights:

- **Link one stylesheet:** `design-system/styles.css` `@import`s all of `tokens/`. Reference tokens (`var(--…)`), never hard-coded hexes.
- **Tone:** warm family game night — celebrate effort, **never shame a miss** ("3 of 9 — tomorrow's fresh"). Never show calories/miles/weights/body-comp framing anywhere.
- **Color is content.** The eat-the-rainbow palette and the nine goal-category hues are first-class tokens (see §2). Player avatars use a separate, muted palette so a person's color never collides with a goal's. Energy palette: streak flame `#F1682E`, perfect-day gold `#F7B32B`.
- **Type:** **Bricolage Grotesque** (display/scores) + **Hanken Grotesk** (body/UI), base body **17px**. Currently loaded from Google Fonts CDN — self-host the woff2 for offline/PWA before production. Two alternative pairings live in the design system's `guidelines/font-options.html`.
- **Icons:** **Phosphor Icons** (`@phosphor-icons/web`), `ph-bold` default, `ph-fill` for active/celebration. **Always paired with a text label** (color/icon never carry meaning alone). **Icons only — never emoji, no custom SVG icons.** Vendor Phosphor locally for production.
- **Space/shape:** 4px grid, 20px screen gutter, generously rounded (cards 20px, feature cards to 32px, buttons/chips full pills), soft warm low-spread shadows on a warm-ink base (never black/cold).
- **Motion:** springy but instant — tap shrink to 0.96 (~120ms), transitions 220ms ease-out, sheets rise ~340ms; streak flame pulses while alive. Respect `prefers-reduced-motion`. Focus: visible 3px warm-green ring everywhere.
- **No logo mark** was provided — the brand renders as a type **wordmark** ("Vitalry." with a tonal light-green period, or the "Fit Friends & Fam" lockup). Don't invent a mark; drop a real logo into `assets/` if one exists.

### Key color tokens (exact values — full set in `design-system/tokens/colors.css`)
- App background `--cream-50 #FCF9F3` · card `--white #FFFFFF` · primary text `--ink-900 #2A2620` (no cool gray anywhere).
- Brand primary `--evergreen #0F4D2E` (deliberately not bright "go-green"), pressed `--evergreen-dark #0A3A22`.
- Rainbow dots: red `#E4462E`, orange/yellow `#F2932B`, green `#56A93C`, blue/purple `#8B54C6`, white `#FFFFFF` (outlined).
- Goal hues: rainbow `#E4462E`, protein `#E0554C`, fiber `#B9822B`, move `#EC8A2E`, sweat `#DA3F76`, air `#3FA8C4`, water `#2E8BD6`, sleep `#5E5AC8`, mind `#9B59B6`.
- Danger `--danger #D8483B` — used gently, **never to signal a missed goal.**

### Components to port (React `.jsx` + `.d.ts` in `design-system/components/`)
Each folder has an implementation (`.jsx`), a prop contract (`.d.ts`), and a usage note (`.prompt.md`) — port them to TS.
- **Core:** Button, Card, Badge, Avatar, ProgressRing
- **Forms:** SegmentedControl, TextField
- **Navigation:** TabBar (pinned bottom bar: `house` Today, `ranking` Standings, `chart-line-up` Progress, `users-three` Group)
- **Goals (signature):** GoalRow, Stepper, StreakFlame, DayScore — the Daily-9 check-in
- **Leaderboard:** LeaderboardRow

The `app-reference/` screens are thin compositions of exactly these primitives — study them to see how the pieces assemble, then rebuild with real state.

---

## 7. Suggested setup & build plan (for Claude Code)

A concrete, phased order. Ship the first two screens before anything else — they are the product.

**Phase 0 — Scaffold.**
- `npm create vite@latest` → React + TypeScript. Add `vite-plugin-pwa` (installable, offline shell).
- Copy `design-system/styles.css` + `tokens/` into the app and link the stylesheet globally; confirm tokens resolve. Self-host the two fonts (or keep CDN for beta). Add `@phosphor-icons/web`.
- Set up routing (Today / Standings / Progress / Group as the four tabs; Setup, Onboarding, Results, Settings as flows/routes). Establish folder structure (`components/`, `screens/`, `lib/`, `types/`).
- Port the design-system components to `src/components/` as typed React components (start with what Today needs: Button, Card, DayScore, GoalRow, Stepper, StreakFlame, TabBar).

**Phase 1 — Backend & auth.**
- Create the Supabase project; write the schema from §4; **seed the Daily 9** into `goals`. Enable Realtime on `daily_logs`.
- Magic-link (invite-link) auth — no passwords. Row-level security scoped to group membership.

**Phase 2 — Today check-in + scoring engine.** *(highest priority)*
- Build Today against live `daily_logs`. Implement the scoring engine from §3 as a pure, well-tested module (base + perfect-day + active-day + streak, with the +5 cap and grace window). Snapshot rules per competition.
- Optimistic tap logging; sub-20-second check-in; grace-window editing of yesterday.

**Phase 3 — Leaderboard + breakdown.** Realtime ranking by goal completion only; today's-progress pips; tap-through day-by-day breakdown (transparency). Days-remaining + prize header.

**Phase 4 — Setup + onboarding + invite links.** Organizer creates a competition (name, 7/14/30, start date, prize text) → shareable invite link. Join flow under 2 minutes: name + avatar, "how it works", guided add-to-home-screen, enable reminders.

**Phase 5 — Progress, Group, Results.** Personal heatmap + per-goal rates; group home with "run it back"; finale celebration + superlatives + share.

**Phase 6 — Notifications & polish.** Web push (with iOS home-screen guidance) + email fallback; daily reminder at chosen time + competition events. Accessibility audit against §1 principle 5. Measure the success metrics.

---

## 8. Out of scope for v1 (named so nobody builds them by accident — plan §12)

Real money in any form · wearable/health-app sync (architecture-ready, not built) · custom/configurable goals · custom competition durations · **raw-stat comparisons of any kind (permanent, not just v1)** · chat/comments · photo proof/verification · app-store presence (v1.5).

---

## 9. Success metrics (family beta — plan §14)

- **Activation:** ≥80% of invited family completes onboarding and logs day 1.
- **The one that matters:** ≥60% of players still logging on the final day of a 14-day competition.
- **Habit signal:** median check-in ≤20s; ≥50% of player-days are active (6+/9).
- **The real goal:** the group starts a second competition ("run it back") without the organizer begging. That's product-market fit at family scale.

---

*Founding context = this README + `product-plan.md` + `design-system/`. Start with the schema (§4) and the Today screen (§5.1 / Phase 2); everything else builds around the daily check-in.*
