# TabBar

Bottom tab bar — the app's primary navigation. Shallow by design: everything is ≤2 taps from Today. The active icon fills (Phosphor `ph-fill`); a flame dot flags a pending daily check-in.

```jsx
<TabBar
  active={tab}
  onChange={setTab}
  items={[
    { key: 'today',       label: 'Today',   icon: 'ph-bold ph-house',        dot: !checkedIn },
    { key: 'leaderboard', label: 'Standings', icon: 'ph-bold ph-ranking' },
    { key: 'progress',    label: 'Progress', icon: 'ph-bold ph-chart-line-up' },
    { key: 'group',       label: 'Group',   icon: 'ph-bold ph-users-three' },
  ]}
/>
```
