# Vitalry Design System

**Vitalry** turns staying well into a friendly game. Friends, families, and coworkers join a fixed-length competition and each day try to complete the same list of healthy habits — eating colorful vegetables, moving, sleeping, getting outside. You earn points for *completing goals*, not for how fit you are, so a 68-year-old and a marathoner compete on equal footing. Working product name: **Fit Friends & Fam**.

This design system is the founding visual + interaction language for that product: a warm, playful, encouraging *family-game* tone with an accessibility floor high enough for a parent on an Android phone.

> **The thesis — fairness by design.** The only score is "how many of your daily goals did you hit?" Consistency beats intensity. Color is content: the veggie-rainbow palette is the brand's signature.

---

## Sources this system was built from

Nothing here is guessed — it is grounded in the materials below. Reference them to build better Vitalry work; not everyone reading this will have access, so key facts are captured inline.

- **Product plan** — `uploads/fit-friends-and-fam-plan.md` (v1.0, Jul 2026, owner Amber Harriger). The definitive brief: concept, product principles, the Daily 9, scoring spec, screen inventory (§8), and the design direction (§9). Everything in this system traces back to it.
- **Primary repo** — https://github.com/alharriger/vitalry — *README only* at build time (no code yet). This system is the design kickoff that precedes the build.
- **Author's sibling wellness app** — https://github.com/alharriger/OneDayStronger — a React Native rehab app by the same author, with a full `ai_docs/design_system.md`. Vitalry is a **different product with a deliberately different tone** (that app is calm/clinical; Vitalry is playful/celebratory), so its *teal palette was not reused*. What was adopted are the author's proven **conventions**: a 4px spacing base, a semantic-token architecture, WCAG AA targets, 44px touch minimums, and **Phosphor Icons** as the icon set.
- Other repos on the account (KickIt, cocoon-kitchen, OneDayStronger, oddjobs) are separate products and were not used as visual sources.

---

## Content fundamentals — how Vitalry writes

The voice is a **family game night, not a fitness bootcamp**. It celebrates effort and never shames a miss.

- **Warm, playful, encouraging.** "Tomorrow's fresh." "Nice work." "🎉 Perfect day — you did it!"
- **Second person, personal.** Talk to *you* about *your* goals and *your* streak. Greet by first name: "Good evening, Dad."
- **Never shaming, never diet-culture.** Say "3 of 9 — tomorrow's fresh," never "you failed 6 goals." **Never** surface calories, miles, weights, or body-composition framing anywhere — permanently out of scope, not just v1.
- **Plain language, zero jargon.** Goals read as plain targets: "20 min outside," "7+ hours," "5 produce colors." If a parent needs their kid to explain a screen, the screen failed.
- **Sentence case** for almost everything; Title Case only for proper names ("Harriger Family," "Run it back"). Tiny ALL-CAPS eyebrows/labels use wide letter-spacing.
- **Casing of numbers is loud, words are gentle.** Big scores and streaks are hero numerals; supporting copy stays soft and regular-weight.
- **Emoji: sparingly, only at celebration moments** (🎉 on a perfect day, 🏆 finales). Never decorative in dense UI. The brand's "color" comes from the palette and icons, not emoji.
- **Transparency is a value.** Copy always lets a player see exactly how points were earned ("Tap anyone to see how every point was earned").

---

## Visual foundations

### Color
- **Warm, never cold.** Neutrals run from a cream app background (`#FCF9F3`) to a warm near-black ink (`#2A2620`) — there is no cool gray anywhere. Surfaces are cream/white; text is warm ink.
- **Evergreen is the brand primary** (`#0F4D2E`) — a deep, confident green used for primary actions and emphasis. It deliberately avoids the bright "go-green" that reads as Duolingo. It anchors a full **living-green family** used across branding: `--green-700/600/500/400`, a muted `--sage-500`, and soft `--mint-200`/`--green-100` tints.
- **Color is content.** The five **eat-the-rainbow** produce colors (red / orange-yellow / green / blue-purple / white-other) and the **nine Daily-9 goal-category hues** are first-class tokens, not decoration. Each goal owns a distinct, harmonious hue used on its icon disc and its done-state — and, on the leaderboard, as the 9-pip "today" tracker.
- **Player avatars use a separate, refined palette** (clay, pine, plum, ochre, denim, mulberry, olive, lagoon) — muted and original, intentionally distinct from the saturated goal hues so a person's color never collides with a goal's.
- **Energy palette** — a streak **flame** (`#F1682E`) and a perfect-day **gold** (`#F7B32B`) carry the celebratory moments.
- **Danger is used gently** and never to shame; red is reserved for genuine destructive confirmation, never for a missed goal.
- Every text/surface pairing targets **WCAG AA** (body ink on cream is ~AAA).

### Type
> Three candidate directions are laid out side-by-side in `guidelines/font-options.html` (*Type* group) — pick one and I'll lock it in.
- **Bricolage Grotesque** (display / scores / headings) — characterful and modern; original and premium, deliberately *not* the rounded Nunito/Baloo pairing that reads as Duolingo. **Applied now.**
- **Hanken Grotesk** (body & UI) — warm, highly legible; base body is **17px** for comfortable one-handed reading at any age.
- Alternatives on offer: **Fredoka + Figtree** (playful/rounded, game energy) and **Outfit + Mulish** (clean/geometric).
- Display sizes use slight negative tracking; small uppercase labels use wide tracking. Scale runs 13 → 72px (72 for finale numerals).

### Space, shape, elevation
- **4px spacing grid.** Screen gutter 20px. Sections separated by 24–32px.
- **Generously rounded** — cards 20px, feature/celebration cards up to 32px, all buttons and chips are full pills. Radii are large on purpose: it reads as a game, not a form.
- **Touch targets never below 44px**; primary buttons 52px, Daily-9 goal rows 60px.
- **Soft, warm, low-spread shadows** on a warm-ink base (never black, never cold). Cards use a hairline warm border + a whisper shadow; raised/feature surfaces drop the border and lift with a bigger soft shadow. A playful `--shadow-pop` sticker shadow exists for celebratory chips.

### Backgrounds, motion, states
- **Backgrounds are flat warm cream** — no gradients in ordinary UI. The one sanctioned gradient is the green hero on the Group card and the green→cream celebration wash on the Results finale. No photographic backgrounds, no textures, no full-bleed imagery in v1.
- **Motion is springy and celebratory but instant.** Taps shrink to 0.96 with a gentle overshoot (`--ease-spring`, 120ms); transitions are 220ms `ease-out`; sheets and celebration entrances rise 340ms. The streak flame gently pulses (1.6s loop) while alive, and stops (respecting `prefers-reduced-motion`).
- **Hover** (desktop stretch): slight brightness/tint shift, never a big color change. **Press**: scale-down is the primary affordance across buttons, steppers, goal rows, and tabs.
- **Focus**: a visible 3px warm-green ring everywhere (keyboard accessibility).
- **Transparency & blur**: used only for the modal scrim (warm ink at ~45%); the app itself is opaque and solid.
- **Fixed elements**: the bottom tab bar is pinned; the primary action on a flow is a full-width button near the bottom.

---

## Iconography

- **Phosphor Icons** are the icon system (`@phosphor-icons/web`, loaded from CDN). This is the author's documented choice in the sibling app and it fits Vitalry: one consistent family, friendly rounded forms, MIT-licensed, with matched weights.
- **Weight convention:** `ph-bold` is the default (chunky, matches the rounded type); `ph-fill` marks **active / selected / celebratory** states (active tab, filled water drop, live streak flame, medals, stars).
- Icons are **always paired with a text label** in tab bars, buttons, and category rows — color and icon never carry meaning alone (accessibility).
- **Icons only — never emoji.** All UI symbols, including celebration moments (confetti, crown, trophy, stars), are Phosphor glyphs. No emoji appear anywhere in the product. No custom SVG icon drawing either — use Phosphor glyphs.
- Representative glyphs: `house` (Today), `ranking` (Standings), `chart-line-up` (Progress), `users-three` (Group), `fire` (streak), `drop` (water), `rainbow` (eat the rainbow), `sun` (fresh air), `moon` (sleep), `brain` (mind), `barbell` (sweat), `person-simple-walk` (move), `trophy`/`crown-simple`/`medal` (winners), `check`/`check-circle` (completion).

---

## Assets & logo

**No logo mark was provided.** Per brand-safety policy this system does **not** invent one. Wherever a mark would go, the brand renders as a **type wordmark** in the display face — "Vitalry." with a tonal light-green period (kept entirely within the green family — no contrasting accent color), or the "Fit Friends & Fam" lockup (see the *Wordmark* card under Brand). If you have a real logo, drop it in `assets/` and update the wordmark card. No brand illustrations or photography were provided either — the system is icon- and color-driven by design.

---

## Substitutions & things to confirm (please review)

- **Fonts are loaded from Google Fonts CDN**, not self-hosted binaries — so the compiler reports 0 shipped font files. Bricolage Grotesque + Hanken Grotesk are the current pick for this from-scratch brand (see `font-options.html` for two alternatives). If you want them self-hosted (offline/PWA), send the woff2 files and I'll wire `@font-face`.
- **Phosphor Icons load from CDN** (`unpkg`). Fine for prototypes; vendor them locally for production/offline.
- **Palette, type, and tone are proposed**, derived from the product plan's direction (§9). If Amber has brand preferences (a specific green, a different playful typeface, an existing wordmark), tell me and I'll re-tune the tokens — everything flows from `tokens/`.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link (`@import` manifest only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand) shown on the Design System tab.
- `components/` — reusable primitives (below).
- `ui_kits/app/` — the interactive Fit Friends & Fam mobile app recreation.
- `SKILL.md` — Agent-Skill front matter so this system can be used in Claude Code.

**Components** (namespace `window.VitalryDesignSystem_cc3bad`)
- Core — **Button**, **Card**, **Badge**, **Avatar**, **ProgressRing**
- Forms — **SegmentedControl**, **TextField**
- Navigation — **TabBar**
- Goals (signature) — **GoalRow**, **Stepper**, **StreakFlame**, **DayScore**
- Leaderboard — **LeaderboardRow**

Each component directory has a `.jsx` implementation, a `.d.ts` props contract, a `.prompt.md` usage note, and a `@dsCard` HTML demo.

**Intentional additions.** With no source component library to enumerate, the inventory was authored to exactly what the product's screens (plan §8) need. Beyond a standard core set (Button, Card, Badge, Avatar, TextField, SegmentedControl, TabBar, ProgressRing), the *signature* primitives — `GoalRow`, `Stepper`, `StreakFlame`, `DayScore`, `LeaderboardRow` — are the brand's genuine reusable pieces (the Daily-9 check-in and the leaderboard). Nothing speculative was added.

**UI kit** — `ui_kits/app/`: Today (check-in), Standings, Progress, Group, Results/finale, and Competition Setup, all click-through. See its own `README.md`.
