# Badge

Compact pill for counts, statuses, and category labels. Always pair color with an icon or text — color is never the sole signal (accessibility).

```jsx
<Badge variant="tint" color="var(--goal-water)" icon="ph-fill ph-drop">6 / 8</Badge>
<Badge variant="solid" color="var(--flame-500)" icon="ph-fill ph-fire">12</Badge>
<Badge variant="outline" dot>Active day</Badge>
```

- **variant**: `solid` · `tint` (default-ish, soft) · `outline` · `neutral` (quiet cream)
- **color**: any `--goal-*`, `--flame-500`, etc.
- **icon**: Phosphor class · **dot**: leading status dot
