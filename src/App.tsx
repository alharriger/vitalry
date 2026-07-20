import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { TodayScreen } from './screens/TodayScreen';
import { StandingsScreen } from './screens/StandingsScreen';
import { Placeholder } from './screens/Placeholder';
import { SignInScreen } from './screens/SignInScreen';
import { AuthCallback } from './screens/AuthCallback';
import { AuthProvider, useAuth } from './lib/auth';
import { Logo } from './components';

/**
 * App shell. AuthProvider wraps everything; AuthGate renders the sign-in wall
 * until there's a session. The magic-link callback route resolves regardless
 * of auth state (it's how you get a session in the first place).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </BrowserRouter>
  );
}

/** Minimal splash while the persisted session is being restored. */
function Splash() {
  return (
    <main className="vt-signin">
      <div className="vt-signin__card">
        <Logo orientation="stacked" size="xl" />
      </div>
    </main>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  const location = useLocation();

  // The callback must run even when unauthenticated so the token can be
  // consumed and turned into a session.
  if (location.pathname === '/auth/callback') return <AuthCallback />;
  if (loading) return <Splash />;
  if (!session) return <SignInScreen />;

  return <AppRoutes />;
}

/**
 * App routing (authenticated). The four primary tabs render inside AppLayout
 * (with the pinned tab bar); Setup / Onboarding / Results / Settings are
 * full-screen flows outside the tab shell. Only Today is built; the rest are
 * branded placeholders that establish the routes.
 */
function AppRoutes() {
  return (
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<TodayScreen />} />
          <Route path="standings" element={<StandingsScreen />} />
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
  );
}
