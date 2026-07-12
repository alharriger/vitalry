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
