# ProgressRing

Circular progress dial (SVG). The generic ring behind the daily score, per-goal completion rates, and any "N of M" progress. Put a numeral, label, or icon in the center via children. Animates on change.

```jsx
<ProgressRing value={6} max={9} size={120} thickness={12} color="var(--green-500)">
  <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800 }}>6</span>
  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>of 9</span>
</ProgressRing>
```

- **color**: use a `--goal-*` token to color a per-goal ring
- Wrapped by the branded `DayScore` component for the Today screen.
