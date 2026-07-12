/* Today — the daily check-in. The home screen and 80% of the product. */
function TodayScreen({ state, setState }) {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { GoalRow, Stepper, DayScore, StreakFlame, Badge } = DS;
  const data = window.VITAL_DATA;

  // derive completion
  const isDone = (g) => {
    if (g.type === 'dots') return state.rainbow >= 5;
    if (g.type === 'glasses') return state.water >= 8;
    return !!state[g.key];
  };
  const doneCount = data.goals.filter(isDone).length;
  const points = doneCount + (doneCount === 9 ? 3 : 0);
  const you = data.players.find((p) => p.you);

  const toggle = (key) => setState({ ...state, [key]: !state[key] });

  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: 'var(--ls-tight)' }}>Good evening, Dad</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-secondary)', marginTop: 2 }}>Wednesday, July 9 · Day {data.competition.day} of {data.competition.daysTotal}</div>
        </div>
        <StreakFlame count={you.streak} size="md" />
      </header>

      {/* Hero score */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 20px' }}>
        <DayScore done={doneCount} total={9} points={points} size={172} thickness={15} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: doneCount === 9 ? 'var(--flame-600)' : 'var(--text-secondary)' }}>
          {doneCount === 9
            ? <React.Fragment><i className="ph-fill ph-confetti" style={{ fontSize: 22 }} aria-hidden="true" />Perfect day — you did it!</React.Fragment>
            : `${9 - doneCount} to go for a perfect day`}
        </div>
      </div>

      {/* Grace-window hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-tint)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16, fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>
        <i className="ph-bold ph-clock-countdown" style={{ fontSize: 20, color: 'var(--goal-mind)' }} aria-hidden="true" />
        Yesterday is still editable until midnight
      </div>

      {/* Daily 9 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.goals.map((g) => {
          if (g.type === 'dots') {
            return (
              <GoalRow key={g.key} name={g.name} target={g.target} icon={g.icon} color={g.color} done={state.rainbow >= 5} interactive={false}>
                <Stepper value={state.rainbow} max={5} color={g.color} onChange={(v) => setState({ ...state, rainbow: v })} />
              </GoalRow>
            );
          }
          if (g.type === 'glasses') {
            return (
              <GoalRow key={g.key} name={g.name} target={g.target} icon={g.icon} color={g.color} done={state.water >= 8} interactive={false}>
                <Stepper value={state.water} max={8} color={g.color} onChange={(v) => setState({ ...state, water: v })} />
              </GoalRow>
            );
          }
          return (
            <GoalRow key={g.key} name={g.name} target={g.target} icon={g.icon} color={g.color} done={!!state[g.key]} onToggle={() => toggle(g.key)} />
          );
        })}
      </div>

      <div style={{ height: 12 }} />
    </div>
  );
}
window.TodayScreen = TodayScreen;
