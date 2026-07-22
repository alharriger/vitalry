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

## Integration test leaked fixtures into the live DB on a mid-setup failure
- **What happened:** The RLS test's `beforeAll` created two auth users, then failed on the next
  step (missing table). Teardown was guarded by `if (!fx) return` — but `fx` was never built, so
  cleanup bailed and left two orphaned users in the real project.
- **Root cause:** Teardown keyed off a single fixture object assembled at the END of setup, so any
  failure before that point skipped cleanup entirely.
- **Prevention rule:** In tests that seed a shared/live DB, push each created resource's id into a
  tracking list the moment it's created, and delete from that list in `afterAll`/`finally` so
  teardown runs even when setup throws. Verify the project is clean after the run.
- **Status:** Active

## Assumed a dashboard-pasted migration had applied when it hadn't
- **What happened:** The Phase 1 schema was believed to be applied to the Supabase project, but
  every table 404'd. A partial error in the pasted SQL had rolled the whole batch back silently,
  leaving zero tables — while the `.env` and RLS test were built against a schema that wasn't there.
- **Root cause:** Trusted a manual dashboard paste as "done" without verifying, and the SQL editor
  runs the batch as one transaction so any single error discards everything with no lasting trace.
- **Prevention rule:** Apply migrations with `supabase db push` (CLI), never a dashboard paste —
  it's explicit, fails loudly, and records migration history. After any migration, verify the
  tables/seed actually exist (a quick REST or `select` probe) before building on them.
- **Status:** Active

## Magic-link redirect dead-ended on a not-yet-live Site URL
- **What happened:** Clicking a magic link bounced to `https://vitalry.xyz`, which doesn't resolve
  yet (domain not pointed at Pages), so sign-in failed with ERR_NAME_NOT_RESOLVED. Separately, the
  built-in Supabase mailer hit "email rate limit exceeded" (2/hr, owner-only) after a few tries.
- **Root cause:** Supabase honors `emailRedirectTo` only if the origin is allow-listed; otherwise
  it falls back to the Auth **Site URL**. The requesting origin (a phone on the Mac's LAN IP)
  wasn't allow-listed, so it fell back to a domain that isn't live. And the default mailer is
  unusable for real testing.
- **Prevention rule:** The magic-link redirect origin must be BOTH allow-listed AND reachable on
  the device where the link is opened. For dev, test on the machine running `npm run dev`
  (localhost:5173) or a `*.pages.dev` preview. To verify sign-in without email, generate a link
  with `admin.generateLink(...)` (service_role) — no mailer, no rate limit. Resend SMTP is
  required before any real user (family) can receive links.
- **Status:** Active

## Timezone-dependent code passed locally (America/New_York) but failed CI (UTC)
- **What happened:** 2.3 added a tz-sync path that calls `updateProfileTimezone` only when
  the device zone differs from the stored profile zone. The `TodayScreen.test.tsx` `vi.mock`
  of `dailyLogs` didn't export that new function. Locally (machine tz = `America/New_York`,
  matching the mock's profile tz) the branch never fired, so the suite passed; CI runs in UTC,
  the branch fired, and the mock threw "No `updateProfileTimezone` export is defined".
- **Root cause:** A test module-mock that omitted an export the code under test now imports,
  combined with a branch that only executes when the runtime tz differs from a fixture tz —
  invisible on a machine whose tz happens to match the fixture.
- **Prevention rule:** When a `vi.mock('…')` factory replaces a module, it must return **every**
  export the code under test imports — add the new one the moment you add the import. For any
  code whose behavior depends on the local clock/zone, run the suite under a non-local zone
  (`TZ=UTC npm test`) before pushing; CI is UTC.
- **Status:** Active

## Single-use magic links consumed by link previews before they could be opened
- **What happened:** Testing 2.3 on a phone, mailer-free `admin.generateLink` sign-in links
  failed repeatedly with "Email link is invalid or has expired" — even freshly minted ones. A
  headless fetch of a fresh link proved the flow worked (303 → `/auth/callback#access_token=…`),
  so the token was valid at mint but **already consumed** by the time the phone opened it.
- **Root cause:** Magic-link tokens are single-use. Delivering one through a channel that
  generates URL previews (iMessage, most chat apps) makes the previewer **fetch the URL to build
  the card**, which burns the token before any human taps it.
- **Prevention rule:** Never deliver a single-use magic link through a link-previewing channel.
  For phone/preview testing use the **preview-gated dev password sign-in** (persisted session, no
  link) — or if a link is unavoidable, paste it **directly into Safari's address bar** (or scan a
  QR), never via Messages. The redirect origin must also be on the Supabase allow-list, and note
  `*.pages.dev` does NOT match a two-label host like `<branch>.vitalry.pages.dev` — allow-list
  `*.vitalry.pages.dev` explicitly.
- **Status:** Active

## Full-viewport background left a seam behind the status bar (canvas painting)
- **What happened:** The read-only day tints the whole screen. Putting the tint on the app column
  (`.vt-app`) left the strip behind the iOS status bar the old color. Moving it to `<body>` fixed the
  **installed PWA** but the **Safari browser tab** still showed the old color at the very top. Only
  tinting the root `<html>` element fixed both.
- **Root cause:** With `viewport-fit=cover`, the area behind the status bar (the safe-area inset) is
  the viewport **canvas**, whose color comes from CSS background propagation — and the source differs
  by display mode: the installed PWA propagates from `<body>`, but a browser tab paints it from the
  **root `<html>`** background. A nested element (`.vt-app`) never covers the canvas, and `<body>`
  only covers it in standalone.
- **Prevention rule:** A background meant to fill the **entire viewport** (edge-to-edge, incl. the
  status-bar / safe-area strip) must be set on the **root `<html>` element** — set it on `<body>` and
  `<html>` both to be safe, never only on a nested app container. Test any full-bleed background in
  **both** the installed PWA and a browser tab; they paint the canvas from different elements.
- **Status:** Active

## Handed Amber a phone manual-test before the branch was pushed to a preview
- **What happened:** 2.4 uncapped day-stepping and all automated gates were green, but when Amber
  tested on her phone she still couldn't step past yesterday. The fix existed only in the local
  working tree — unpushed and uncommitted. Her phone was hitting a deployed env (vitalry.xyz =
  `main` = the 2.3 grace-cap, or an old `*.pages.dev` preview), none of which carried the new code.
- **Root cause:** A structural gap between where new code lives and where Amber tests. The phone
  cannot reach `localhost` (the `dev` script is plain `vite`, no `--host`), and vitalry.xyz only
  ever runs `main`. So the ONLY phone-reachable env for branch code is a Cloudflare branch preview —
  which requires a push. Our working loop pushed "when the feature is complete," i.e. *after* the
  manual-test pause, guaranteeing the pause happened against stale code.
- **Prevention rule:** The manual-test pause is not ready until the code is live where Amber will
  test it. Before handing off a phone test, **push the branch, confirm the Cloudflare preview
  built, and give her the exact preview URL** (see `ai_docs/testing_runbook.md`). Never say "test
  it" while the change is only local. E2E green is the proxy that the feature *works*; the preview
  is what makes it *reachable*. (PWA is `autoUpdate`, so a stale shell self-heals on one reload.)
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

## Playwright `page.mouse` at coords read from `boundingBox()` mid-animation misses the target
- **What happened:** The 2.5 month-sheet swipe-to-dismiss e2e test kept failing — the sheet stayed
  open. The drag code was fine on a real phone; the *test* was pressing empty space. The sheet rises
  with a 340ms CSS animation, and `locator.boundingBox()` read during it returned the still-moving
  (lower) position (y≈805 in a 839px viewport), so `page.mouse.down()` at that y landed below the
  settled sheet (y≈531) and never hit the drag handle.
- **Root cause:** `locator.click()` auto-waits for the element to be stable (stops animating) as part
  of actionability, but low-level `page.mouse.move/down/up` at **manually computed coordinates** does
  NOT — it clicks wherever you tell it, using a box that may be stale. Any coordinate-based Playwright
  interaction on an animated/transitioning element is subject to this.
- **Prevention rule:** Before driving `page.mouse` (or `dispatchEvent`) at coordinates from
  `boundingBox()`, wait for the element to settle — poll `boundingBox()` until two consecutive reads
  match, or wait out the known animation duration. Prefer `locator.click()`/`dragTo()` (which
  auto-wait) whenever the interaction allows it; only drop to raw `page.mouse` for gestures they can't
  express (e.g. a partial swipe), and settle first.
- **Status:** Active

## iOS status-bar flickers when a sheet scrim animates over the top (and env(safe-area-inset-top) is 0)
- **What happened:** Opening/closing any bottom sheet (month picker, breakdown) flickered the
  colouring at the very top of the screen on Amber's iPhone — "the colour isn't loading at the same
  time" — in **both** Safari and the installed PWA. **Five** fixes missed in a row:
  `color-scheme: light`, painting the `<html>` canvas, `theme-color` cream, portaling the sheet to
  `<body>`, and padding/insetting by `env(safe-area-inset-top)`.
- **Why the guesses failed — the rigor lesson:** all the env-based fixes were **silent no-ops**,
  because on that iPhone **`env(safe-area-inset-top)` reports `0px`** in both Safari and the PWA (the
  iOS status bar overlaps the top of the web view but is not exposed as an inset). We only learned
  this after adding an **on-device diagnostics panel** (build stamp + `display-mode` + live
  `env(safe-area-inset-*)` + service-worker state) and **on-device A/B experiment toggles**. The
  experiments gave the definitive answer no headless engine could: the flicker is iOS **re-tinting
  the status bar as the scrim animates over the top strip** — a stable opaque bar over that strip, OR
  keeping the scrim off it, both stop it; the fade only drives the *open* flicker, the unmount drives
  *close*, and `color-mix` is irrelevant.
- **The fix:** reserve a fixed status-bar zone on iOS (`--vt-top-safe: max(env(safe-area-inset-top),
  56px)` gated by a JS-set `html.is-ios`, since env is 0), pad content below it, and pin an **opaque
  app-coloured guard** over that strip at `z-index` above the sheet scrim (portaled to `<body>` so its
  z-index actually wins over the portaled scrim). The strip is then a stable colour in every state, so
  iOS never re-tints it.
- **Prevention rule:** (1) Never trust `env(safe-area-inset-top)` to be non-zero on iOS — Safari/PWA
  can report 0; gate a fixed fallback on detected iOS. (2) You cannot reproduce iOS status-bar /
  status-chrome effects in Chromium OR headless WebKit — when a device-only bug resists fixes, **stop
  shipping guesses**: build an on-device diagnostics readout (so you know the exact build + device
  state, e.g. whether a stale service worker is serving old code) and **on-device A/B toggles** so the
  user isolates the cause in one pass. Confirm which build the device runs *before* concluding a fix
  failed.
- **Status:** Resolved (fix shipped Phase 3); keep the diagnostics/experiments technique for future
  device-only bugs.
