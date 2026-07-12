---
name: vitalry-design
description: Use this skill to generate well-branded interfaces and assets for Vitalry (working name "Fit Friends & Fam"), a warm, playful group-wellness game, either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, iconography, and a UI kit of prototyping components.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things live
- `README.md` — the full design guide: content voice, visual foundations, iconography, and the component/UI-kit manifest. **Start here.**
- `styles.css` — the single global entry point (link this one file); it `@import`s everything in `tokens/`.
- `tokens/` — CSS custom properties: `colors.css`, `typography.css`, `spacing.css`, `effects.css`, plus `fonts.css` (Google Fonts) and `base.css`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `components/` — reusable React primitives: Button, Card, Badge, Avatar, ProgressRing, SegmentedControl, TextField, TabBar, and the signature goal pieces (GoalRow, Stepper, StreakFlame, DayScore) plus LeaderboardRow.
- `ui_kits/app/` — an interactive recreation of the Fit Friends & Fam mobile app (Today, Standings, Progress, Group, Results, Setup).

## Non-negotiables for on-brand Vitalry work
- Warm, playful, encouraging tone — a family game night. **Never** shame a miss; **never** show calories/miles/weights or any raw-stat comparison.
- Color is content: use the eat-the-rainbow and Daily-9 goal-category tokens as first-class.
- Accessibility floor: 44px touch targets, WCAG AA contrast, ≥16px body, visible focus rings.
- Fonts: Bricolage Grotesque (display/scores) + Hanken Grotesk (body) — currently applied; alternatives in `guidelines/font-options.html`. Icons: Phosphor (`ph-bold` default, `ph-fill` for active/celebration), always paired with a label. **Icons only — never emoji, anywhere.**
- Reference tokens (`var(--...)`), never hard-coded hexes, so the theme stays consistent.
