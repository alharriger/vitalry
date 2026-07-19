# Testing Runbook — how to actually test a change

> The single "do this to test it" page. Most testing pain on this project has come from the gap
> between where new code lives and where Amber tests it (her phone). This runbook closes that gap.
> The `pitfalls.md` entries are the *why*; this is the *how*. **Read before any manual-test pause.**

## The one rule

**Code is not testable until it is live where the tester will open it.** Amber tests on her phone.
Her phone **cannot** reach `localhost` (the `dev` script is plain `vite`) and vitalry.xyz only ever
runs `main`. So the only phone-reachable env for branch code is a **Cloudflare branch preview**,
which requires a push. Never hand off a phone test while a change is only local.

## Phone test (the default) — Cloudflare branch preview

1. **Commit + push the branch.** Cloudflare Pages auto-builds a preview on every push to any branch.
2. **Get the exact URL:** `npm run preview:url` — prints `https://<slug>.vitalry.pages.dev` for the
   current branch (Cloudflare sanitizes the branch name: lowercase, non-alphanumerics → `-`,
   truncated to 28 chars). If it 404s, the build isn't done yet, or grab the URL from the Pages
   **Deployments** list for this branch.
3. **Sign in with the dev password** (not a magic link): on any `*.vitalry.pages.dev` / `localhost`
   origin the SignInScreen shows "Developer sign-in (preview only)". Amber's account password is
   `vitalry-dev`; the session persists for weeks. Magic links get consumed by link previews — see
   pitfalls. It never renders on vitalry.xyz.
4. **Seed data if the test needs history:** `npm run seed:dev` (idempotent, service_role, writes the
   live DB the preview reads). Past-day/heatmap tests need this.
5. **If the app looks stale** (old bundle): the PWA is `registerType: 'autoUpdate'`, so **one reload**
   (or reopening the installed PWA) picks up the new build. Not a rebuild — just reload.

## Desktop / LAN fallbacks

- **On the dev machine:** `npm run dev` → `localhost:5173`. Full HMR; dev-password sign-in works.
- **Phone on the same Wi-Fi as the Mac:** `npm run dev:host` (`vite --host`) exposes the dev server
  on the Mac's LAN IP. ⚠️ The LAN origin must be on the Supabase redirect allow-list for magic-link
  sign-in — use the dev password instead to avoid that. The preview path (above) is more reliable.

## Automated gates — run these, and trust them, before the manual pause

- **Unit:** `npm test`. For anything touching the clock/timezone, run **`TZ=UTC npm test`** — CI is
  UTC and a machine-local zone hides tz bugs (pitfalls). A `vi.mock` must return *every* export the
  code imports.
- **E2E:** `npm run test:e2e` — Playwright drives the real screens. **This is the proxy for "does the
  feature actually work."** If e2e passes but the phone doesn't, suspect the *environment* (wrong
  URL, unpushed branch, stale cache), not the code.
- **RLS (live DB, not in CI):** `npm run test:rls`. **Typecheck/lint:** `npm run typecheck` / `npm run lint`.

## Handoff template — every manual-test pause message must include

1. **Where:** the exact preview URL (from `npm run preview:url`), confirmed built.
2. **Sign in:** dev password (`vitalry-dev`) at the preview origin.
3. **Steps:** numbered actions + the expected result of each.
4. **If stale:** "reload once — the PWA auto-updates."

## Auth allow-list facts (stable)

- Supabase Auth **Site URL = `https://vitalry.xyz`**; redirect allow-list includes
  `https://*.vitalry.pages.dev/**` (note: a bare `*.pages.dev` does **not** match the two-label
  preview host — pitfalls).
- `npm run devlink` mints a mailer-free `admin.generateLink` sign-in link (no email, no rate limit),
  pointing at the branch preview by default. Single-use: paste **straight into Safari**, never via
  Messages.
