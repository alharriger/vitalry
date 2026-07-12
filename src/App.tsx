import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { TodayScreen } from './screens/TodayScreen';
import { Placeholder } from './screens/Placeholder';

/**
 * App routing. The four primary tabs render inside AppLayout (with the pinned
 * tab bar); Setup / Onboarding / Results / Settings are full-screen flows
 * outside the tab shell. Only Today is built in Phase 0; the rest are branded
 * placeholders that establish the routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<TodayScreen />} />
          <Route
            path="standings"
            element={
              <Placeholder
                title="Standings"
                icon="ph-bold ph-ranking"
                color="var(--goal-sweat)"
                phase="Phase 3"
                blurb="The live leaderboard — ranked by goal completion only, never raw stats. Tap any player to audit exactly how every point was earned."
              />
            }
          />
          <Route
            path="progress"
            element={
              <Placeholder
                title="My progress"
                icon="ph-bold ph-chart-line-up"
                color="var(--goal-air)"
                phase="Phase 5"
                blurb="Your personal heatmap, streak history, and per-goal completion rates. No comparisons here — this is where self-improvement lives."
              />
            }
          />
          <Route
            path="group"
            element={
              <Placeholder
                title="Group"
                icon="ph-bold ph-users-three"
                color="var(--evergreen)"
                phase="Phase 5"
                blurb="Your group's members, the active competition, past results, and one-tap 'Run it back' to start the next round."
              />
            }
          />
        </Route>

        {/* Full-screen flows (outside the tab shell) */}
        <Route
          path="setup"
          element={
            <Placeholder
              title="New competition"
              icon="ph-bold ph-flag-banner"
              color="var(--goal-move)"
              phase="Phase 4"
              blurb="The organizer flow: name it, pick 7 / 14 / 30 days, set a start date and optional prize, then share an invite link."
              back
            />
          }
        />
        <Route
          path="join"
          element={
            <Placeholder
              title="Join the game"
              icon="ph-bold ph-hand-waving"
              color="var(--goal-mind)"
              phase="Phase 4"
              blurb="The under-two-minute onboarding from an invite link: name and avatar, how it works, add-to-home-screen, and reminders."
              back
            />
          }
        />
        <Route
          path="results"
          element={
            <Placeholder
              title="Results"
              icon="ph-bold ph-trophy"
              color="var(--sun-400)"
              phase="Phase 5"
              blurb="The finale celebration — winner, final standings, and superlatives. The screenshot-and-share moment."
              back
            />
          }
        />
        <Route
          path="settings"
          element={
            <Placeholder
              title="Settings"
              icon="ph-bold ph-gear"
              color="var(--text-secondary)"
              phase="Phase 6"
              blurb="Profile, reminder time, notification preferences, and leaving a group."
              back
            />
          }
        />

        <Route
          path="*"
          element={
            <Placeholder
              title="Not found"
              icon="ph-bold ph-compass"
              color="var(--danger)"
              phase="404"
              blurb="That page doesn't exist yet."
              back
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
