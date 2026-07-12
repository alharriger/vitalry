# Button

Pill-shaped primary action button — chunky and springy, tuned for one-handed phone use (min 52px tall). Use exactly one dominant action (`primary` or `gold`) per screen.

```jsx
<Button variant="primary" size="lg" block icon="ph-bold ph-check">
  Log today
</Button>
<Button variant="secondary">Skip</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

- **variant**: `primary` (green, default) · `secondary` (green outline) · `ghost` (quiet text) · `gold` (celebration / perfect-day moments only)
- **size**: `sm` 36px · `md` 52px · `lg` 60px (dominant screen action)
- **block**: full width — the norm for the primary mobile action
- **icon / iconTrailing**: Phosphor classes (`ph-bold ph-plus`). Load Phosphor web font in the host page.
