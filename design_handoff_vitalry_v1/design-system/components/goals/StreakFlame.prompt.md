# StreakFlame

Streak indicator — a flame and the active-day count. Pulses gently while the streak is alive (respects reduced-motion); goes gray and static at zero. A streak grows one per consecutive "active day" (6+ of 9 goals).

```jsx
<StreakFlame count={12} size="lg" showLabel />
<StreakFlame count={0} size="sm" />   {/* muted */}
```
