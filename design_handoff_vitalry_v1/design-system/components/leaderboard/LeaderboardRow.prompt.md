# LeaderboardRow

One row of the leaderboard. Rather than a generic XP list, each player shows a **9-pip "today" tracker** in the Daily-9 category colors — reinforcing that the score is goal completion, never raw calories/miles/weights (product principle #1). Rank sits in a tinted tile (gold/silver/bronze for the top three). Tapping opens the player's day-by-day breakdown (transparency requirement).

```jsx
<LeaderboardRow rank={1} name="Amber" points={182} doneToday={8} streak={11} avatarColor="var(--avatar-clay)" />
<LeaderboardRow rank={4} name="Dad" points={140} doneToday={6} streak={3} isYou avatarColor="var(--avatar-denim)" />
```

Keep `avatarColor` consistent with the player's `Avatar` elsewhere.
