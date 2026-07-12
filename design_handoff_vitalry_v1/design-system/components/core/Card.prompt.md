# Card

Rounded surface container — content sits in cards on the warm app background. White with a hairline border by default; lift it for emphasis.

```jsx
<Card>Standard content</Card>
<Card variant="feature">Hero / celebration content</Card>
<Card variant="tint">Quiet grouped info</Card>
<Card accentColor="var(--goal-water)">Contextual, color-coded</Card>
```

- **variant**: `default` · `flat` (no shadow) · `raised` · `feature` (biggest radius + shadow) · `tint` (cream fill)
- **accentColor**: left bar — use a `--goal-*` token to color-code by category
- **interactive**: adds hover/press feedback for tappable cards
