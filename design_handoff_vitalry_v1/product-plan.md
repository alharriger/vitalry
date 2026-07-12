# Fit Friends & Fam — Product Plan & Design Kickoff

**Version:** 1.0 · July 2026
**Owner:** Amber Harriger
**Status:** Ready for design system kickoff
**Next step after design:** Feed this doc + design system into Claude Code project kickoff

---

## 1. Concept

Fit Friends & Fam is a group wellness game. Friends, families, and coworkers join a competition that lasts a set number of days, and each day everyone tries to complete the same list of healthy habits — eating colorful vegetables, moving, sleeping, getting outside. You earn points for each habit you complete, not for how fit you are.

**The thesis: fairness by design.** Apple Fitness competitions compare raw output (calories, exercise minutes), so the fittest person always wins and everyone else disengages by day three. Here, a 68-year-old and a marathoner compete on equal footing because the only score is *"how many of your daily goals did you hit?"* Consistency beats intensity, every single time.

**The mission behind it:** encourage the people you love — especially aging parents — to build small daily wellness habits, using light social competition as the motivator.

## 2. Product principles

These should guide every design and engineering decision. When in doubt, come back here.

1. **Fair by design.** Never surface raw stats (calories, miles, weights) in any comparative context. The leaderboard only knows about goal completion. No body-composition, weight, or diet-culture framing anywhere.
2. **Logging is a tap, never a chore.** Every goal is satisfied by a tap or a few taps. No food databases, no number entry, no forms. If a design requires typing to log, it's wrong. Target: full daily check-in in under 20 seconds.
3. **Honor system is a feature.** Players self-report. Social accountability within a group of people who know each other polices honesty. This only holds while stakes stay light — which is why real money is out of scope for v1.
4. **Forgiving beats strict.** Grace windows, achievable streak thresholds, catchable leaderboards. A player who falls behind and can never catch up stops logging; a mechanic that punishes one busy Tuesday loses a mom.
5. **Designed for a 68-year-old on Android.** Large touch targets, high contrast, generous type, shallow navigation, zero jargon. If a parent needs their kid to explain a screen, the screen failed.
6. **Simple now, scalable later.** v1 is deliberately small, but the data model and stack are chosen so wearables, custom goals, and native apps slot in without rewrites.

## 3. Target users

| Persona | Description | Design implications |
|---|---|---|
| **The Organizer** ("Amber") | Product-minded, fitness-engaged, starts the group, sets up the competition, recruits the family. iPhone. | Needs friction-free group creation and an invite link she can drop in a family text thread. She is the retention engine — give her visibility into who's flagging so she can nudge them personally. |
| **The Parents** ("Mom & Dad") | 60s, Android phones, moderate tech comfort. Motivated by connection with their kids more than by fitness. Most likely to forget to log. | Biggest accessibility bar. Daily check-in must be one obvious screen. Reminders matter most for them. The 1-day grace window exists for them. |
| **The Competitive Sibling / Friend** | 20s–40s, mixed iPhone/Android, plays to win. Will find and exploit any scoring loophole. | Scoring must be airtight and transparent — show exactly how every point was earned. Streaks and perfect-day bonuses are for this person. |
| **The Coworker Group** (v1.5+ audience) | Office wellness challenge, larger groups, weaker social ties. | Not the v1 design target, but don't paint into a corner: group size should be unbounded in the data model even if v1 UI is tuned for 4–12 people. |

Primary v1 target: **one real family group of ~6–12 people, mixed iPhone/Android** — Amber's own family is the beta.

## 4. The core loop

```
  Organizer creates group → invites via link → group joins
        → competition starts (7 / 14 / 30 days)
              ↓
  ┌─────────────────────────────────────────────┐
  │  DAILY: open app → tap goals as you do them │
  │  (or in one evening batch) → see points     │
  │  → peek at leaderboard → light trash talk   │
  └─────────────────────────────────────────────┘
              ↓ (× competition length)
  Competition ends → results & celebration screen
        → "run it back" → new competition, same group
```

The habit-forming moment is the evening check-in. The retention moment is the leaderboard peek. The growth moment is "run it back."

## 5. The Daily 9 — v1 goal list (fixed)

Same list for everyone in v1. No configuration. Several goals are *flexible in how you satisfy them* — that's the intentional middle ground between prescriptive and chaotic.

| # | Goal | Daily target | Logging interaction |
|---|---|---|---|
| 1 | **Eat the rainbow** | 5+ colors of fruits & vegetables | Tap up to 5 color dots as you go (red, orange/yellow, green, blue/purple, white/other). Goal completes at 5. |
| 2 | **Protein** | Hit your protein goal | Single tap ✓ (honor system — player knows their own target) |
| 3 | **Fiber** | Hit your fiber goal | Single tap ✓ (honor system) |
| 4 | **Move** | 30 min of movement — walk, hike, bike, dance, anything | Single tap ✓ |
| 5 | **Sweat or strength** | 20+ min intentional workout — weights, class, sport, hard yoga | Single tap ✓ |
| 6 | **Fresh air** | 20 min outside | Single tap ✓ |
| 7 | **Water** | 8 cups / 64 oz | Tap glasses (8 glass icons). Goal completes at 8. |
| 8 | **Sleep** | 7+ hours | Single tap ✓ |
| 9 | **Mind** | Read 10 pages, meditate 10 min, OR journal — any one counts | Single tap ✓ (optionally show which flavor was picked — nice-to-have) |

**Double-dipping rule:** one activity may count across *categories* (a 30-min outdoor walk = Move ✓ + Fresh air ✓ — this synergy deliberately nudges outdoor walks), but a walk cannot also count as Sweat or strength. Move and Sweat/strength require distinct activities.

**Rationale notes for design:**
- Walking gets its own goal (separate from workout) because it's the highest-leverage habit for aging parents and shouldn't be crowded out.
- "Mind" makes this a wellness app, not a fitness app — and gives non-gym-people a goal they can own.
- Sleep is 7+ (not 8+) to match adult guidelines and stay winnable; a goal you always miss stops motivating.
- Protein/fiber are honor-system taps precisely to avoid food logging (see Principle 2).

## 6. Scoring spec

All scoring is per-player, per-day, summed across the competition.

| Mechanic | Rule |
|---|---|
| **Base points** | 1 point per goal completed. Max 9/day. |
| **Perfect day bonus** | All 9 goals in one day → **+3** |
| **Active day** (streak unit) | A day with **6+ of 9** goals completed |
| **Streak bonus** | +1 point per consecutive active day, **capped at +5/day**. (Day 1 of a streak = +1, day 5+ = +5.) Streak resets after a non-active day. |
| **Max daily score** | 9 + 3 + 5 = **17** |
| **Day boundary** | Each player's **local midnight**. Simple mental model; time zones never fight the clock. |
| **Grace window** | Yesterday stays editable until the end of today (local). Older days lock. Forgiving for forgetful loggers, hard to abuse. |
| **Tie-breakers** | 1) Most perfect days → 2) Longest streak → 3) Shared rank (co-winners are fine; this is family). |

**Design requirement — transparency:** every player must be able to see exactly how any score was earned (tap a leaderboard row → day-by-day breakdown). Competitive players trust what they can audit; parents learn the rules by seeing them.

**Catchability check:** streak cap +5 and active-day threshold of 6/9 keep the leaderboard catchable deep into a 30-day competition. If playtesting shows runaway leaders, tune the cap down — never remove the grace window instead.

## 7. Competition mechanics

- **Durations:** presets only — **7, 14, or 30 days**. (Custom dates = v2.)
- **Start:** organizer picks a preset + start date (default: next Monday). Competition starts at each player's local midnight.
- **Joining:** invite link (no app store, no account friction — see §9). Players may join a competition already in progress; they simply have fewer scoring days (their per-day scores are honest; the summary screen can also show "avg points/day" for context, but rank is by total).
- **Prize (v1 = text field):** the organizer sets an optional free-text prize — "loser hosts Thanksgiving," "winner picks the restaurant." 90% of the motivational value of real stakes, 0% of the legal and trust surface. Displayed prominently on the competition screen. Real money/fees/marketplace explicitly deferred (see §12).
- **Groups vs. competitions:** a Group is persistent (the people); a Competition is an instance (the game). One group runs many competitions over time — "run it back" reuses the group with one tap. v1 constraint: one *active* competition per group.
- **Group size:** UI tuned for 4–12; no hard cap in the data model.

## 8. Screen inventory (v1)

Ordered by importance. The first two screens are 80% of the product.

| # | Screen | Purpose & key elements |
|---|---|---|
| 1 | **Today (daily check-in)** | The home screen. All 9 goals as large tappable cards/rows; color dots for rainbow, glass icons for water, single-tap ✓ for the rest. Running day score, streak flame with count, perfect-day state (celebrate at 9/9). Yesterday accessible via one swipe/tab while in grace window. This screen must pass the 68-year-old test. |
| 2 | **Leaderboard** | Ranked list: name/avatar, total points, streak indicator, today's progress (e.g., 6/9 dots) so it feels alive during the day. Days remaining + prize text at top. Tap a player → their day-by-day breakdown (transparency requirement). |
| 3 | **My progress** | Personal calendar/heatmap of the competition: perfect days, active days, missed days; streak history; per-goal completion rates ("you hit Fresh air 92% of days"). This is where self-improvement lives, away from comparison. |
| 4 | **Competition setup** | Organizer flow: name it, pick 7/14/30, start date, optional prize text. Generates invite link. |
| 5 | **Join / onboarding** | From invite link: name + avatar (+ optional email for account recovery), one-screen "how it works" (the 9 goals + scoring in plain language), prompt to add to home screen (guided, per platform), enable reminders. Target: under 2 minutes, no app store. |
| 6 | **Group home** | Group members, active competition card, past competition results, "run it back" button. |
| 7 | **Results / celebration** | End-of-competition: winner celebration, final standings, fun superlatives ("Most perfect days," "Longest streak," "Hydration champion"). The screenshot-and-share moment. |
| 8 | **Settings** | Profile, reminder time, notification preferences, leave group. |

**Notifications (v1):**
- Daily reminder at a user-chosen time (default 8pm): "3 goals to go for a perfect day" — content-aware if cheap to build, generic if not.
- Competition events: started, halfway, final day, results are in.
- Web push where available; on iOS Safari web push requires home-screen install → onboarding must guide that step. **Fallback: email reminders** for anyone without push. (This limitation is the strongest driver for the v1.5 Capacitor wrap.)

## 9. Design direction (for the design system kickoff)

- **Tone:** warm, playful, encouraging — a family game night, not a fitness bootcamp. Celebrates effort, never shames a miss ("3 of 9 — tomorrow's fresh" not "you failed 6 goals").
- **Accessibility is a core constraint, not a checklist:** minimum 44px touch targets, WCAG AA contrast, base type ≥16px with comfortable scaling, shallow nav (everything ≤2 taps from Today), works one-handed.
- **Color is content:** the veggie-rainbow palette (red/orange/green/purple/etc.) is a natural signature for the brand and the check-in UI. Design system should treat goal-category colors as first-class tokens.
- **Celebration moments to design:** goal tap feedback, perfect-day moment, streak milestones, competition finale. These micro-moments carry the "fun" in a very simple app.
- **Mobile-first web:** design at 360–430px widths; desktop is a stretched afterthought. Assume installed-to-home-screen as the primary frame (no browser chrome).

## 10. Platform & architecture

**Decision: web-first, native-ready.** Responsive web app (PWA) shared by invite link. No app store fees or review; works day one on the parents' Androids and everyone's iPhones. Stack is chosen so the same codebase later wraps into store apps.

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React + TypeScript + Vite**, PWA (installable, offline-tolerant shell) | Ecosystem, and the Capacitor path requires a standard web SPA |
| Native path (v1.5) | **Capacitor** wrap → App Store + Play Store | Days of work, not a rewrite; unlocks reliable push + HealthKit/Google Fit plugins |
| Backend | **Supabase** (Postgres + Auth + Realtime) or Firebase — pick one, Supabase preferred for SQL and cheap tier | Budget: free tier covers a family beta; realtime makes the leaderboard feel alive; magic-link auth = no passwords for parents |
| Notifications | Web Push API + email fallback (e.g., Resend free tier) | See §8 |
| Hosting | Vercel/Netlify free tier | Budget |

Estimated v1 running cost: **$0–5/month** at family-beta scale.

### Data model sketch

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

**Scalability decisions baked in now (cheap) so later features don't require rewrites:**
- Goals live in a **table, not code** → v2 "group picks goals / custom goals" = rows + a picker UI.
- `daily_logs.goal_states` records *source* implicitly by being manual; add a `source: manual|healthkit|googlefit` field per goal state when wearables arrive → a goal is satisfiable by tap **or** connected data with no schema upheaval.
- Scores are **computed, not stored** (materialize a view/cache if needed) → scoring rules can be tuned during beta without data migrations. Competition scoring rules snapshot at start so tuning never changes a live game.
- Local-midnight day boundary is stored as `local_date` (player's date, not UTC timestamp) → time zones stay simple forever.

## 11. Roadmap

| Phase | Scope |
|---|---|
| **v1 — Family beta** (build with Claude Code) | Everything in §5–§8: groups, invite links, 7/14/30 competitions, Daily 9, tap logging, scoring + streaks + grace, leaderboard, progress, results, web push + email reminders. Beta = Amber's family. |
| **v1.5 — Make it stick** | Capacitor wrap → App Store/Play Store (reliable push). HealthKit/Google Fit read-only sync to auto-complete Move, Sweat/strength, Sleep (player can always tap manually — sync is a convenience, not a gate). Content-aware reminders. Superlatives expanded. |
| **v2 — Open it up** | Group-configurable goal subsets + simple custom goals (name + yes/no). Custom competition durations. Multiple concurrent competitions per person. Rematch stats & group history ("lifetime wins"). |
| **v3 — Explore (validate first)** | Real stakes: entry fees, 1st/2nd payouts, prize marketplace or cashout. ⚠️ Requires legal review (sweepstakes/gambling law varies by state), payment processing (Stripe), and anti-cheat thinking — money breaks the honor system. Only pursue if v1/v2 prove people *want* to pay to play. |

## 12. Explicitly out of scope for v1

Named so nobody designs for them by accident:

- Real money in any form (fees, prizes, marketplace, cashout)
- Wearable/health-app sync (architecture-ready, not built)
- Custom or configurable goals (fixed Daily 9 only)
- Custom competition durations (presets only)
- Raw-stat comparisons of any kind (permanent, not just v1)
- Chat/comments (family group texts already exist; deep-link out instead)
- Photo proof / verification (honor system is the feature)
- Android/iOS store presence (v1.5)

## 13. Risks & open questions

| Risk | Mitigation |
|---|---|
| **Logging fatigue** — the #1 killer. Fun for a week, chore by week three. | 20-second check-in budget; evening reminder; grace window; measure it in beta (see metrics). If day-15 logging drops off a cliff, shorten default competition to 14 days. |
| **Honor-system cheating** as groups grow beyond close family | Accept in v1 (social accountability); transparency screens make padding visible; revisit only if/when stakes or strangers enter. |
| **iOS web push friction** for the evening reminder | Guided add-to-home-screen in onboarding + email fallback; accelerate Capacitor wrap if reminders underperform. |
| **Streak/bonus balance** makes leaders uncatchable or feels stingy | Rules snapshot per competition; tune between betas, not mid-game. |
| **Open:** should the leaderboard show goal-level detail of *others* (what Mom checked) or just counts? | Recommend counts + breakdown on tap (transparency) but no push-style broadcasting of individual goals. Design to explore. |
| **Open:** name. "Fit Friends & Fam" is the working title. | Naming pass before store launch (v1.5); fine for beta. |

## 14. Success metrics (family beta)

- **Activation:** ≥80% of invited family completes onboarding and logs day 1.
- **The one that matters:** ≥60% of players still logging on the final day of a 14-day competition.
- **Habit signal:** median check-in ≤20 seconds; ≥50% of player-days are "active days" (6+/9).
- **The real goal:** the group starts a second competition ("run it back") without Amber begging. That's product-market fit at family scale.
- Qualitative: do the parents say it got them walking?

---

*Next steps: 1) Share this doc with design → design system + Today/Leaderboard screen concepts first. 2) Project kickoff in Claude Code using this doc + the design system as the founding context.*
