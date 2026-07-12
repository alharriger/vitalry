# GoalRow

One row of the Daily-9 check-in — the product's core interaction. A simple goal is a single large tappable check (whole row toggles, ≥60px tall). Counter goals (rainbow, water) nest their control as children and stop the row from toggling.

```jsx
{/* simple check goal */}
<GoalRow name="Fresh air" target="20 min outside" icon="ph-bold ph-sun"
         color="var(--goal-air)" done={air} onToggle={() => setAir(!air)} />

{/* counter goal — a Stepper renders full-width on a second row */}
<GoalRow name="Water" target="8 cups" icon="ph-bold ph-drop"
         color="var(--goal-water)" done={cups === 8} interactive={false}>
  <Stepper value={cups} max={8} color="var(--goal-water)" onChange={setCups} />
</GoalRow>
```

Done state tints the whole row and fills the disc + check in the category color. Counter goals nest a `Stepper` (−/+) on a full-width second row — never squeezed inline — so nothing overflows the phone width, and the description sits comfortably on its own line under the title. Color is always paired with the icon and name, never alone.
