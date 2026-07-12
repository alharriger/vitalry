# SegmentedControl

Equal-width pill selector for small, mutually-exclusive choices — most notably the 7 / 14 / 30-day competition length. Segments are ≥44px tall.

```jsx
<SegmentedControl
  value={days}
  onChange={setDays}
  options={[
    { value: '7',  label: '7',  sublabel: 'days' },
    { value: '14', label: '14', sublabel: 'days' },
    { value: '30', label: '30', sublabel: 'days' },
  ]}
/>
```

Options accept plain strings or `{ value, label, sublabel?, icon? }`.
