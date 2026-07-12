# DayScore

The Today screen's hero dial — goals completed of 9, big central numeral, optional daily points below. The ring fills a **lighter green while in progress and deepens to the full brand green at a perfect 9/9**.

```jsx
<DayScore done={6} total={9} points={7} />
<DayScore done={9} total={9} points={17} />  {/* deep green, perfect day */}
```

A self-contained branded composition (does not require `ProgressRing`). Animates the ring on change with a gentle spring.
