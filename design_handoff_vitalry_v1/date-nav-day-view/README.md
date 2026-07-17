# Handoff: Date navigation & day view (Phase 2 / Phase 5)

> Finished design received from Amber's design session ("Planning session · v2"), 2026-07-17.
> This is the authoritative build spec for the date-navigation + day-view work. Values here win
> over any recollection; the interactive prototype `AppScreen.dc.html` (drop it alongside this
> file) is the visual reference. Encoding cleaned from the original hand-off.
>
> **Scope note (Vitalry team):** frames 2a–2d + the month sheet (2b) are **Phase 2**. The
> History tab (2e, "World A") is **Phase 5** — it reuses the Phase 2 day-browser. See
> `ai_docs/vitalry_product.md` roadmap.

## Overview
Specifies the **date navigation and single-day view**. It makes the grace window real: users can
move between days, edit today and yesterday, and read any earlier day of the competition as a
locked record. It also converts the third tab from **Progress** to **History** ("World A"), the
home for looking back across every past day and every past competition.

Feeds back into `src/screens/TodayScreen.tsx` and adds a new `HistoryScreen` (Phase 5). Builds on
the existing design system (`ai_docs/design_system.md`) and the Daily-9 check-in already in the app.

## About the design files
`AppScreen.dc.html` is a **design reference in HTML** — a prototype of intended look and behavior,
not production code to copy. Recreate these designs in the real environment (React + TypeScript,
the existing component set and token system). Do not ship the HTML. Every color, size, radius, and
behavior below is stated explicitly so the screens can be rebuilt faithfully from this document.

Frame ids referenced below:
- **2a** Today, with the date-navigation control
- **2b** The month-sheet date picker (heatmap)
- **2c** A past day, read-only
- **2d** A missed day (nothing logged)
- **2e** History tab ("World A")
- **2f** Editable-day treatment options (design exploration, resolved below)

## Fidelity
**High-fidelity.** Final colors, typography, spacing, icons, interactions. Recreate
pixel-faithfully using the codebase's existing components and tokens. Where a value names a CSS
variable (e.g. `--mint-200`), use the corresponding token; never hard-code hex.

---

## The functional contract (non-negotiable — from scoring rules, plan §6)
These are fixed. Design serves them.

- **Editable days = today + yesterday only.** Yesterday stays editable until the player's **local
  midnight**. At local midnight, yesterday becomes read-only and a new today opens.
- **Every other day is read-only.** View what was logged; no control does anything.
- **Selectable range = the competition's own days**, from `start_date` through today (or the final
  day if the competition has ended). Days before the start or after today are not selectable.
- **Day boundary is the player's local midnight**, never a UTC/server clock. Use stored
  `daily_logs.local_date`, not a timestamp.
- **Never shame a miss.** Danger red is never used to mark a missed goal or a missed day.

---

## Global: the date-navigation control ("step and open")
Appears at the top of **every day-based screen** (Today, read-only day, missed day). The single
source of day navigation. Replaces any older "back to today" pill in the header (a separate "Back
to today" button still exists lower on read-only/missed screens).

**Layout** — a horizontal row, full content width, 8px gap, three items:
1. **Previous-day button** — 44×44px circle. `border: 2px solid var(--border-strong)`,
   `background: var(--surface-card)`, icon `ph-bold ph-caret-left` 20px `var(--text-primary)`.
   Steps the viewed day back by one. Disabled when the viewed day == `start_date`.
2. **Date button (center)** — `flex: 1`, height 44px, `border-radius: 999px`,
   `border: 2px solid var(--border-subtle)`, `background: var(--surface-card)`. Contents centered,
   8px gap: icon `ph-bold ph-calendar-blank` 19px `var(--evergreen)`, then the full date label
   (e.g. "Wednesday, Jul 22") in `--font-body` 15px weight 800 `var(--text-primary)`. **Tapping it
   opens the month sheet (2b).**
3. **Next-day button** — 44×44px circle, same as previous but `ph-bold ph-caret-right`. Steps the
   viewed day forward by one. **Disabled when the viewed day == today** (never step into the
   future).
   - **Disabled style:** `border: 2px solid var(--border-subtle)`,
     `background: var(--surface-sunken)`, icon color `var(--text-muted)`, no press feedback,
     `aria-disabled`.

Directly below the row: a caption line in `--font-body` 13px weight 700 `var(--text-secondary)`,
`margin-top: 6px`. On today it reads `Day 22 of 30 · today`; on other days `Day 15 of 30`.

**Behavior**
- Prev/next change which `local_date` is displayed; the screen re-renders in the matching state
  (editable / read-only / missed). Prev disabled at `start_date`; next disabled at today.
- Center opens the month sheet. Selecting a day sets the viewed day and closes the sheet.
- Press feedback on all three: scale to 0.96, `--ease-spring`, ~120ms.
- Focus: visible `3px solid var(--focus-ring)` ring, `outline-offset: 2px`.

---

## Screen: Today (frame 2a)
The existing check-in, with the date-navigation control added below the header.

**Layout (top to bottom, inside the scroll area, 20px screen gutter — 18px in the prototype frame):**
1. Header row: greeting `Good evening, Dad` (`--font-display` 29px weight 800,
   `letter-spacing: var(--ls-tight)`) left; `StreakFlame` (size `md`) top-right.
2. The date-navigation control (see Global). On today: prev enabled, **next disabled**, caption
   `Day 22 of 30 · today`.
3. `DayScore` dial, centered, `size 164`, `thickness 15`, showing `done`/9 and points.
4. The Daily-9 as `GoalRow`s, 10px vertical gap. All interactive exactly as the existing screen.

No read-only affordances here. The only fully editable-by-tap surface besides yesterday.

**Yesterday, editable:** identical to Today except the viewed day is yesterday. Fully interactive
(taps write). Caption `Day 21 of 30` and, optionally, a one-line reminder that yesterday is
editable until midnight ("Yesterday is still editable until midnight"). Both arrows enabled (prev
to day 20, next back to today).

---

## Screen: Month-sheet date picker (frame 2b)
Opened from the center date button. A bottom sheet over the current screen.

**Scrim & sheet**
- Scrim: `background: var(--scrim)` (warm ink ~45%) over the whole screen; content behind dimmed.
  Tapping the scrim closes the sheet.
- Sheet: pinned bottom, `background: var(--surface-card)`, `border-radius: 28px 28px 0 0`,
  `padding: 12px 18px 22px`, `box-shadow: 0 -14px 44px rgba(42,38,32,0.22)`. Enters by rising ~340ms.
- Grabber: 40×4px pill, `var(--sand-300)`, centered, 14px below.

**Sheet header**
- Left: month + year, e.g. `July 2026`, `--font-display` 21px weight 800.
- Right: chip `Day 22 of 30`, icon `ph-bold ph-flag-checkered` 15px `var(--evergreen)`, text
  `--font-body` 12px weight 800 `var(--text-secondary)`.
- (If competitions can span two calendar months, add prev/next month chevrons. See "Open items".)

**Grid**
- Weekday header: 7 columns, single letters `S M T W T F S`, centered, `--font-body` 12px weight
  800 `var(--text-muted)`, 6px below.
- Day cells: `grid-template-columns: repeat(7, 1fr)`, 6px gap. Leading blank cells for day 1's
  weekday offset (hidden). Each real cell: `aspect-ratio: 1/1`, `border-radius: 13px`,
  `overflow: hidden`, centered column layout, `position: relative`. Day number `--font-display`
  15px weight 800.

### Calendar cell states (EXPLICIT — the heart of the picker)
Classification of a logged day by goals completed (`done`, 0–9), using the active-day threshold
(active = 6+):
- **Perfect** = 9
- **Active** = 6–8
- **Some goals** = 1–5
- **Nothing logged** = 0

**Fill color (cell background):**
| State | Background token |
|---|---|
| Perfect | `var(--mint-200)` (green) **plus** a gold star |
| Active | `var(--mint-200)` (green) |
| Some goals | `color-mix(in srgb, var(--mint-200) 45%, var(--surface-card))` (light green) |
| Nothing logged | `var(--cream-200)` (warm gray — NOT a cool gray) |
| Future comp day (after today, ≤ final day) | transparent, cell `opacity: 0.4` |
| Outside the competition (before start / after final day) | transparent, muted, not selectable |

- **Perfect star:** `ph-fill ph-star`, 11px, `color: var(--gold)`, centered below the number
  (inside the cell). Only perfect days show it — the ONLY thing distinguishing perfect from active
  (both green).
- **Faded vs. full:** read-only past days use the fill colors as-is. Editable days (today &
  yesterday) render the same class colors at full strength; the distinction is carried by the
  editable ring, not opacity. Only future/out-of-comp cells get `opacity: 0.4`.
- **Number color:** `var(--text-primary)`, except future/out-of-comp = `var(--text-muted)`.

### Cell markers (borders / bars / labels) — resolved decisions
Stack on top of the fill:
- **Editable ring (today & yesterday):** `border: 2.5px dashed var(--green-600)`. (Frame 2f
  explored options; the **dashed ring** is chosen.)
- **Today:** in addition, `border: 2.5px solid var(--evergreen)` (solid, not dashed) **plus** a
  `Today` text label: absolutely positioned, `bottom: 3px`, `--font-body` 7px weight 800,
  `letter-spacing: 0.04em`, uppercase, `color: var(--evergreen)`. So: today = solid evergreen ring
  + "Today" text; yesterday = dashed green ring, no label.
- **Viewing (the day currently open in the day view):** a **solid green base bar** — a span pinned
  `left:0; right:0; bottom:0; height: 7px; background: var(--evergreen)` (clipped by the cell's
  `overflow: hidden`). Deliberately different from today's ring. When the viewed day is today,
  today's ring + label win; the base bar is for viewing any non-today day.
- A cell can carry more than one marker (viewing yesterday = dashed ring + base bar).

**Legend** (under the grid, wrap, 9px×14px gap, each `--font-body` 12px weight 700
`var(--text-secondary)` with a swatch): Perfect (green + small gold star), Active (green), Some
goals (light green), Nothing logged (warm gray), Editable (dashed-green-ring), Today
(solid-evergreen-ring), Viewing (green + bottom green bar).

**Selection:** tapping a selectable day sets the viewed day and closes the sheet. Future and
out-of-competition cells are non-interactive.

---

## Screen: A past day, read-only (frame 2c)
Reached by stepping back or picking a locked day. Must be **unmistakably non-interactive** — a
glance tells you a tap does nothing.

**Layout (top to bottom):**
1. Date-navigation control. Both arrows enabled (unless at `start_date`); caption `Day 15 of 30`.
2. **Lock banner:** row, `background: var(--surface-tint)`, `border: 1px solid var(--border-subtle)`,
   `border-radius: 16px`, `padding: 12px 14px`, 10px gap. Icon `ph-bold ph-lock-simple` 22px
   `var(--goal-sleep)`. Text `--font-body` 14px weight 700 `var(--text-secondary)`: **"You are
   looking back at a past day. Nothing here can be tapped."**
3. **Score readout:** `DayScore` dial, centered, `size 132`, `thickness 13`, that day's `done`/9.
   No points line. Below: caption `--font-body` 13px weight 800, `letter-spacing: 0.06em`,
   uppercase, `var(--text-secondary)`: **"Logged that day"**.
4. Section label `--font-body` 12px weight 800, `letter-spacing: 0.1em`, uppercase,
   `var(--text-secondary)`: **"What was logged"**.
5. **Read-only goal rows** (NOT the interactive `GoalRow`; a record row), 8px gap. Each:
   - Container: `background: var(--surface-card)`, `border: 1px solid var(--border-subtle)`,
     `border-radius: 16px`, `padding: 11px 14px`, 12px gap, `align-items: center`. If **not** done,
     `opacity: 0.72`.
   - Icon disc: 44×44px, `border-radius: 12px`, icon 24px. If **done**: `background: <goal category
     color>`, icon `#fff`. If **not done**: `background: var(--surface-sunken)`, icon
     `var(--text-muted)`.
   - Body: name `--font-display` 17px weight 800 `var(--text-primary)`; target `--font-body` 12px
     weight 600 `var(--text-secondary)`.
   - Trailing status (icon + label, right, `--font-body` 13px weight 800): done →
     `ph-fill ph-check-circle` + **"Done"** `var(--green-600)`; not done → `ph-bold ph-minus` +
     **"Not logged"** `var(--text-muted)`.
   - **No empty checkbox circles anywhere.** Must not look tappable — no hover, no press scale, not
     a `<button>`.
6. **"Back to today"** primary button: full-width, `Button` variant `primary` size `lg` (52px),
   icon `ph-bold ph-arrow-u-up-left`, label **"Back to today"**. Jumps to today.

Persistent tab bar below, `Today` tab active.

---

## Screen: A missed day — nothing logged (frame 2d)
Same read-only layout as 2c. Differences:
- The **score-dial position** holds a "nothing logged" marker instead of a `DayScore`: a 132×132px
  circle, `border: 3px dashed var(--border-strong)`, `background: var(--surface-tint)`, centered
  icon `ph-bold ph-moon-stars` 54px `var(--goal-sleep)`. Below:
  - Title `--font-display` 20px weight 800 `var(--text-primary)`: **"Nothing logged this day"**.
  - Subcopy `--font-body` 14px weight 600 `var(--text-secondary)`, centered, max-width 250px:
    **"That happens. Rest counts too, and tomorrow is always fresh."**
- Lock banner shortened to **"You are looking back at a past day."**
- The "What was logged" list still renders, every goal in the "Not logged" state.
- "Back to today" button as in 2c.
- **Never** use red, "failed", counts of missed goals, or shaming language.

---

## Screen: History tab (frame 2e) — replaces "Progress" [PHASE 5]
The **third tab** becomes **History** ("World A"). Tab item: key `history`, label **"History"**,
icon `ph-bold ph-clock-counter-clockwise` (fill weight when active). Replaces the old Progress tab
(`chart-line-up`) in the same slot.

**Layout:**
1. Screen title `History`, `--font-display` 30px weight 800.
2. **Segmented control**, two segments, pill track `background: var(--surface-sunken)`,
   `border-radius: 999px`, `padding: 4px`; active `background: var(--surface-card)`,
   `color: var(--evergreen)`, subtle shadow; inactive `color: var(--text-secondary)`:
   - **"This competition"** — the current game's detail: running month heatmap + per-goal
     completion rates + streak history (absorbs the old Progress content, plan §8 #3). Reuse the 2b
     cell language.
   - **"All history"** — a list of every competition the player has been in (default in prototype).
3. **Competition cards** (in "All history"), `background: var(--surface-card)`,
   `border: 1px solid var(--border-subtle)`, `border-radius: 20px`, `padding: 16px`, 12px between.
   Each: title `--font-display` 18px weight 800; right meta (`Now` + green dot for the active one,
   or `Apr 2026`); result line `--font-body` 13px weight 700 `var(--text-secondary)` with optional
   rank icon (winner `ph-fill ph-trophy` `var(--gold)`, runner-up `ph-fill ph-medal`
   `var(--sand-400)`); **mini heatmap** — a wrapping row of 15×15px cells, 4px gap, one per
   competition day, same classification as 2b (perfect = green + 9px gold star; future =
   transparent, `opacity: 0.4`, `1px solid var(--border-subtle)`).
   **Tapping a card opens that competition's read-only day browser** (same day-view + month-sheet,
   scoped to that competition's dates).
4. Footer hint `--font-body` 13px weight 700 `var(--text-muted)`, icon `ph-bold ph-hand-tap`:
   **"Tap any competition to browse its days"**.

**Scope decision ("World A"):** deep history lives here, away from the leaderboard. The date picker
on **Today stays scoped to the current competition only** — you cannot step or pick past the
current game's `start_date` from Today. To reach an older competition's days, open it from History.
Build the day-view + month-sheet as a **single reusable component** parameterized by a competition +
date range, used by both Today and History.

---

## Interactions & behavior (summary)
- **Step:** prev/next change the viewed `local_date` by ±1 within `[start_date, today]`. Prev
  disabled at `start_date`; next disabled at today.
- **Pick:** center date button opens the month sheet; selecting sets the viewed day, closes sheet.
- **Editable rule:** viewed day ∈ {today, yesterday} → editable (taps write via existing check-in
  logic). Else read-only.
- **Read-only rule:** no control writes; record rows non-interactive; "Back to today" resets.
- **From History:** tapping a competition opens its scoped read-only browser.
- **Motion:** button press scale 0.96 `--ease-spring` ~120ms; sheet rises ~340ms; transitions 220ms
  `ease-out`. Respect `prefers-reduced-motion`.
- **Focus:** visible `3px solid var(--focus-ring)` on every interactive element.
- **Touch targets:** ≥44px everywhere (arrows 44×44, date button 44 tall, primary button 52,
  goal/record rows ≥60). Body text ≥16px in the real app (prototype frame is scaled down).

## State management
- `viewedDate: LocalDate` — the day shown (defaults to today; reset by "Back to today").
- Derived: `isToday`, `isYesterday`, `isEditable = isToday || isYesterday`,
  `isReadOnly = !isEditable`, `dayClass = perfect|active|some|nothing` from that day's `done`.
- `pickerOpen: boolean` — month-sheet visibility.
- `activeCompetition` and, in History, `selectedCompetition` — the competition whose date range
  scopes the browser.
- Day data from `daily_logs` keyed by `(competition_id, user_id, local_date)`; a missing row =
  "nothing logged" (missed-day view), not an error.
- Day boundary recomputed against the player's **local** clock; at local midnight, yesterday flips
  to read-only and a new today opens.

## Design tokens (all in `tokens/` — reference by variable, never hard-code)
- Surfaces: `--surface-app` (#FCF9F3), `--surface-card` (#FFFFFF), `--surface-tint` (#F6F0E4),
  `--surface-sunken` (#EDE4D3).
- Warm-gray neutrals: `--cream-200` (#EDE4D3) for missed cells; borders `--border-subtle`
  (#E2D7C1), `--border-strong` (#CBBB9E), `--sand-300/400`.
- Text: `--text-primary` (#2A2620), `--text-secondary` (#6B6353), `--text-muted` (#9A8F79).
- Greens: `--evergreen` (#0F4D2E), `--green-600` (#1E8049), `--green-500` (#2FA05C), `--mint-200`
  (#CDEBD6), `--green-100` (#DCF0E1).
- Energy: `--gold` (#F7B32B) for the perfect-day star.
- Goal hues (read-only done discs): `--goal-rainbow #E4462E`, `--goal-protein #E0554C`,
  `--goal-fiber #B9822B`, `--goal-move #EC8A2E`, `--goal-sweat #DA3F76`, `--goal-air #3FA8C4`,
  `--goal-water #2E8BD6`, `--goal-sleep #5E5AC8`, `--goal-mind #9B59B6`.
- Scrim `--scrim` (warm ink ~45%); focus `--focus-ring`.
- Radii: cell 13px, card/banner 16–20px, sheet top 28px, pills/buttons 999px.
- Spacing: 4px grid; 20px screen gutter; 24–32px between sections.
- Type: `--font-display` (Bricolage Grotesque) for numbers/headings; `--font-body` (Hanken
  Grotesk) for UI/body, base 17px. `--ls-tight` on large display; `0.04–0.16em` on uppercase labels.

## Assets & icons
- **Phosphor only**, always with a text label. `ph-bold` default, `ph-fill` for
  active/selected/celebratory. Used here: `caret-left`, `caret-right`, `calendar-blank`,
  `calendar-dots`, `flag-checkered`, `lock-simple`, `star` (fill), `check-circle` (fill), `minus`,
  `moon-stars`, `arrow-u-up-left`, `clock-counter-clockwise`, `hand-tap`, `trophy` (fill), `medal`
  (fill), `pencil-simple`. No emoji, no custom SVG.
- No images. All visuals are color + type + Phosphor glyphs.

## Files
- `AppScreen.dc.html` — the HTML design reference containing all frames (2a–2f). Add it beside this
  README. Open in a browser to inspect exact rendering; this README is the authority for values.

## Open items for the team (flagged, not assumed)
1. **Month boundary:** a 30-day competition can straddle two calendar months. Decide whether the
   month sheet shows one month with prev/next-month chevrons, or a single continuous
   `start_date → today` grid. The prototype shows one month (July).
2. **Some-goals color:** days with 1–5 goals are light green ("some goals"), deliberately NOT folded
   into gray "nothing logged," to honor "never shame a miss." Confirm it reads correctly in testing.
3. **Editable-until-midnight affordance on yesterday:** confirm the exact reminder copy/placement.
