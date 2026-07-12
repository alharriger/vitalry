/* Standings — the leaderboard. Ranking is by goal completion only. */
function StandingsScreen() {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { LeaderboardRow, Card, Badge, Button, StreakFlame } = DS;
  const data = window.VITAL_DATA;
  const [detail, setDetail] = React.useState(null);

  const ranked = [...data.players].sort((a, b) => b.points - a.points);

  return (
    <div>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: 'var(--ls-tight)' }}>Standings</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <Badge variant="tint" color="var(--goal-mind)" icon="ph-bold ph-calendar-blank">{data.competition.daysLeft} days left</Badge>
          <Badge variant="tint" color="var(--sun-400)" icon="ph-fill ph-trophy">{data.competition.prize}</Badge>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ranked.map((p, i) => (
          <LeaderboardRow key={p.id} rank={i + 1} name={p.name} points={p.points}
            doneToday={p.doneToday} streak={p.streak} isYou={p.you} avatarColor={p.color}
            onClick={() => setDetail(p)} />
        ))}
      </div>

      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', marginTop: 18 }}>
        Tap anyone to see how every point was earned
      </p>

      {detail && <BreakdownSheet player={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* Day-by-day breakdown sheet — the transparency requirement. */
function BreakdownSheet({ player, onClose }) {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { Button, StreakFlame } = DS;
  const days = [9, 7, 8, 6, 9, 5, 8, 7, 9, 6];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'flex-end', zIndex: 20, animation: 'vt-fade 0.2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface-card)', width: '100%', borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0', padding: '20px 20px 28px', boxShadow: 'var(--shadow-xl)', animation: 'vt-rise 0.34s var(--ease-spring)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--border-strong)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>{player.name}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>{player.points} points · {player.perfectDays} perfect days</div>
          </div>
          <StreakFlame count={player.streak} size="md" />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 96, padding: '8px 0 4px' }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: (d / 9) * 72, borderRadius: 6, background: d === 9 ? 'var(--sun-400)' : d >= 6 ? 'var(--green-500)' : 'var(--sand-400)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{i + 1}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', margin: '12px 0 18px' }}>
          <span><i className="ph-fill ph-square" style={{ color: 'var(--sun-400)' }} /> Perfect</span>
          <span><i className="ph-fill ph-square" style={{ color: 'var(--green-500)' }} /> Active (6+)</span>
          <span><i className="ph-fill ph-square" style={{ color: 'var(--sand-400)' }} /> Below</span>
        </div>
        <Button block variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
window.StandingsScreen = StandingsScreen;
