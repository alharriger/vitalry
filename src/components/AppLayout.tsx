import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar, type TabItem } from './ui/TabBar';
import { TodayLogProvider, useTodayLog } from '../lib/useTodayLog';
import './AppLayout.css';

const TABS: TabItem[] = [
  { key: 'today',     label: 'Today',     icon: 'ph-bold ph-house' },
  { key: 'standings', label: 'Standings', icon: 'ph-bold ph-ranking' },
  { key: 'progress',  label: 'Progress',  icon: 'ph-bold ph-chart-line-up' },
  { key: 'group',     label: 'Group',     icon: 'ph-bold ph-users-three' },
];

/**
 * The four-tab app shell: a scrollable screen area with a pinned bottom tab
 * bar. TodayLogProvider wraps the whole shell so Today and the tab bar's
 * pending-dot share one live fetch of the viewer's day. Tabs are the four
 * primary routes; Setup / Onboarding / Results / Settings render outside this
 * layout as full-screen flows.
 */
export function AppLayout() {
  return (
    <TodayLogProvider>
      <AppShell />
    </TodayLogProvider>
  );
}

/**
 * The shell chrome, rendered INSIDE the provider so it can read the live day
 * state. On a read-only past day of Today, the whole column tints to the
 * archived surface (`vt-app--readonly`) — one seamless fill from the top of the
 * scroll area through the last row (the tab bar keeps its own card surface).
 */
function AppShell() {
  const location = useLocation();
  const { isEditable, loading, noCompetition } = useTodayLog();
  const onToday = (location.pathname.split('/')[1] || 'today') === 'today';
  const readonly = onToday && !loading && !noCompetition && !isEditable;

  // Tint the document root + body on a locked day. With viewport-fit=cover the
  // strip behind the status bar is the viewport "canvas": in the installed PWA
  // it comes from <body>, but in a browser tab Safari paints it from the root
  // <html> background — so both must be tinted or the old color surfaces at the
  // top in the browser. .vt-app--readonly still tints the column itself.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('is-readonly-day', readonly);
    document.body.classList.toggle('is-readonly-day', readonly);
    return () => {
      root.classList.remove('is-readonly-day');
      document.body.classList.remove('is-readonly-day');
    };
  }, [readonly]);

  return (
    <div className={`vt-app${readonly ? ' vt-app--readonly' : ''}`}>
      <main className="vt-app__screen">
        <Outlet />
      </main>
      <ShellTabBar />
    </div>
  );
}

/** The bottom tab bar, with Today's dot driven by the live check-in state. */
function ShellTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split('/')[1] || 'today';

  // Flag Today until the viewer reaches an active day (6+/9). While loading /
  // with no competition, nothing is pending.
  const { checkinPending, loading, noCompetition } = useTodayLog();
  const dot = checkinPending && !loading && !noCompetition;
  const tabs = TABS.map((t) => (t.key === 'today' ? { ...t, dot } : t));

  return (
    <TabBar
      className="vt-app__tabbar"
      items={tabs}
      active={active}
      onChange={(key) => navigate(`/${key === 'today' ? '' : key}`)}
    />
  );
}
