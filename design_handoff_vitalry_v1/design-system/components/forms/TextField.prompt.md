# TextField

Labeled text input — used for player names, group names, and the free-text prize. Per product principle #2 the app never uses number entry for logging; this is text only.

```jsx
<TextField
  label="Prize (optional)"
  icon="ph-bold ph-trophy"
  placeholder="Loser hosts Thanksgiving"
  value={prize}
  onChange={setPrize}
  helper="Shown to everyone on the competition screen"
/>
```

- **error** turns the field red and replaces the helper text.
- Green focus ring is built in.
