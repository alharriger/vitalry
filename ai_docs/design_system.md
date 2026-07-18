# Vitalry — Design System & Voice

**Source of truth for visuals:** `design_handoff_vitalry_v1/design-system/` — README (full
guide), `styles.css` (single entry point), `tokens/` (all custom properties), `components/`
(.jsx reference + .d.ts contracts + .prompt.md usage notes). Pixel-level fidelity: recreate
faithfully in TS, swap sample data for live data. This doc holds the rules we enforce in
review, not a copy of the guide.

## Non-negotiables (checked in every UI review)

- **Tokens only.** Reference `var(--…)` from `tokens/`; never hard-code a hex.
- **Phosphor icons only** (`ph-bold` default, `ph-fill` for active/celebration). No emoji in
  UI, no custom SVG icons. Icons always paired with a text label.
- **68-year-old test:** touch targets ≥44px (primary buttons 52px, goal rows 60px), WCAG AA
  contrast, body ≥16px (base 17px), everything ≤2 taps from Today, one-handed.
- **Warm, never cold:** cream `--cream-50` backgrounds, warm-ink text, no cool grays, no
  black/cold shadows. Flat backgrounds; the only gradients are the Group hero and Results wash.
- **Never shame a miss.** "3 of 9 — tomorrow's fresh," never "you failed." Danger red never
  marks a missed goal. No calories/miles/weights/body-comp framing anywhere, ever.
- **Motion:** springy but instant (tap scale 0.96 ~120ms, transitions 220ms ease-out); respect
  `prefers-reduced-motion`. Visible 3px warm-green focus ring everywhere.
- **Brand logo (provided 2026-07-18).** The **high-five mark** (two hands = a high-five, a V, a
  sprout; three-stroke spark on top) + the **"Vitalry." wordmark** (Bricolage 800, light-green
  `--green-500` period) + "Fit Friends & Fam" tagline. Source SVGs live in `src/assets/brand/`
  (`README.md` documents each). In-app, always use the components — `<Logo>` (lockup),
  `<Mark>` (mark, `full`/`reverse`/`mono`), `<Wordmark>` — never re-draw or recolor the mark
  outside the palette, rotate it, or drop the spark. Don't invent an alternate mark.

## Voice quick reference

Family game night, not fitness bootcamp. Second person, greet by first name. Sentence case.
Big numerals, gentle words. Emoji only at celebration moments — and in-product celebration
symbols are Phosphor glyphs, not emoji. Plain language, zero jargon.

## Key token groups (values live in `tokens/colors.css`)

- Brand: `--evergreen #0F4D2E` + living-green family; app bg `--cream-50 #FCF9F3`; ink `#2A2620`.
- Nine goal hues (`--goal-rainbow` … `--goal-mind`) — first-class content, one per Daily-9 goal.
- Rainbow produce dots (red/orange/green/purple/white-outlined).
- Avatar palette (clay, pine, plum, ochre, denim, mulberry, olive, lagoon) — deliberately
  distinct from goal hues.
- Energy: streak flame `#F1682E`, perfect-day gold `#F7B32B`.

## Production TODOs from the handoff

- [x] Self-host Bricolage Grotesque + Hanken Grotesk woff2 — done in Phase 0
      (`src/assets/fonts/`, latin + latin-ext, wired via `src/styles/fonts.css`). No CDN.
- [x] Vendor Phosphor icons locally — done in Phase 0 (`@phosphor-icons/web` via npm,
      bundled by Vite). No CDN.
- [x] Type pairing (Bricolage Grotesque + Hanken Grotesk) and evergreen palette confirmed by
      Amber 2026-07-12 — locked. Product name: **Vitalry**.
- [ ] Phosphor ships ttf/woff/svg fallbacks Vite still emits (~6MB, unused — browsers use
      woff2). They are excluded from the PWA precache. Trim the @font-face to woff2-only in
      Phase 6 so they aren't emitted at all.

## How the design system lives in the app (Phase 0)

- Tokens are copied verbatim to `src/styles/tokens/`; entry point `src/styles/styles.css`
  imports fonts + tokens. Import that one file (done in `src/main.tsx`).
- Components are ported to typed React under `src/components/` (`ui/` core + `goals/`
  signature), each with a co-located `.css` file (the design system's runtime
  style-injection pattern was converted to idiomatic Vite CSS imports). Barrel:
  `src/components/index.ts`.
