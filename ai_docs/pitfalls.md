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
