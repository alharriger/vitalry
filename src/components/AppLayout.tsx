import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar, type TabItem } from './ui/TabBar';
import { SAMPLE_YOU } from '../lib/sampleData';
import { GOAL_COUNT } from '../lib/goals';
import './AppLayout.css';

const TABS: TabItem[] = [
  { key: 'today',     label: 'Today',     icon: 'ph-bold ph-house' },
  { key: 'standings', label: 'Standings', icon: 'ph-bold ph-ranking' },
  { key: 'progress',  label: 'Progress',  icon: 'ph-bold ph-chart-line-up' },
  { key: 'group',     label: 'Group',     icon: 'ph-bold ph-users-three' },
];

/**
 * The four-tab app shell: a scrollable screen area with a pinned bottom tab
 * bar. The Today tab shows a pending-action dot until the viewer hits an
 * active day (6+/9). Tabs are the four primary routes; Setup / Onboarding /
 * Results / Settings render outside this layout as full-screen flows.
 */
export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.split('/')[1] || 'today';

  // Scaffold: flag Today until the viewer reaches an active day (6+ of 9).
  const checkinPending = SAMPLE_YOU.doneToday < Math.ceil((GOAL_COUNT * 2) / 3);
  const tabs = TABS.map((t) => (t.key === 'today' ? { ...t, dot: checkinPending } : t));

  return (
    <div className="vt-app">
      <main className="vt-app__screen">
        <Outlet />
      </main>
      <TabBar
        className="vt-app__tabbar"
        items={tabs}
        active={active}
        onChange={(key) => navigate(`/${key === 'today' ? '' : key}`)}
      />
    </div>
  );
}
