# Fit Friends & Fam — App UI Kit

An interactive, high-fidelity recreation of the Vitalry mobile PWA (working title *Fit Friends & Fam*). Mobile-first, designed at **414px** inside a phone frame, installed-to-home-screen framing (no browser chrome).

## Run it
Open `index.html`. Everything is click-through:
- **Today** — tap the Daily-9 goals; produce colors and water cups use a big −/+ stepper; the score dial fills and turns gold at 9/9. The bottom-tab dot clears once you hit an active day (6+).
- **Standings** — tap any player to see their day-by-day breakdown (the transparency requirement).
- **Progress** — personal heatmap, streak/perfect-day stats, per-goal completion rates. No comparisons here.
- **Group** — active competition card, members, past results, and **Run it back** → opens Competition Setup.
- **Results** (via Group → past competition) — the finale celebration, podium, and superlatives.
- **Setup** (via Run it back) — organizer flow: name, 7/14/30 length, start, prize, invite link.

## Screens
| File | Screen | Notes |
|---|---|---|
| `TodayScreen.jsx` | Daily check-in | The home screen; 80% of the product. `DayScore` + the Daily-9 `GoalRow`s |
| `StandingsScreen.jsx` | Leaderboard + breakdown sheet | Ranking by goal completion only |
| `ProgressScreen.jsx` | My progress | Heatmap, streak, per-goal rates |
| `GroupScreen.jsx` | Group home | Active competition, members, run it back |
| `ResultsScreen.jsx` | Finale celebration | Winner, podium, superlatives, share |
| `SetupScreen.jsx` | Competition setup | Organizer flow → invite link |
| `data.js` | Shared sample data | The Daily 9, players, heatmap, rates |

## How it composes the system
Screens are thin — they import the design-system components from the bundle (`window.VitalryDesignSystem_cc3bad`): `DayScore`, `GoalRow`, `Stepper`, `StreakFlame`, `LeaderboardRow`, `Card`, `Button`, `Badge`, `Avatar`, `SegmentedControl`, `TextField`, `TabBar`, `ProgressRing`. No primitive is re-implemented here. Icons are Phosphor (loaded from CDN).

This is a recreation for design reference — not production code (no real backend, auth, or persistence).
