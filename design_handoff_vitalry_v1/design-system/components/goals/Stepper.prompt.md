# Stepper

Big-target −/+ number stepper — the logging control for count goals (water cups, produce colors). Two 48px round buttons and a large central "value / max". Chosen over per-unit dot/glass grids because it never overflows and stays dead simple to tap on a phone (product principle: logging is a tap, never a chore).

```jsx
<Stepper value={cups} max={8} color="var(--goal-water)" onChange={setCups} />
<Stepper value={colors} max={5} color="var(--goal-rainbow)" onChange={setColors} />
```

Nest inside a `GoalRow` (with `interactive={false}`) so it sits on the row's full-width second line.
