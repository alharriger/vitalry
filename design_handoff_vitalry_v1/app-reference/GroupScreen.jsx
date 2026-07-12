/* Group home — the persistent people. Active competition + run it back. */
function GroupScreen({ onRunItBack, onViewResults }) {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { Card, Button, Avatar, Badge } = DS;
  const data = window.VITAL_DATA;

  return (
    <div>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>Group</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: 'var(--ls-tight)' }}>{data.competition.group}</div>
      </header>

      {/* Active competition card */}
      <Card variant="feature" style={{ marginBottom: 16, background: 'linear-gradient(140deg, var(--green-700), var(--evergreen))', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: 999 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--sun-400)' }} /> Live now
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, marginTop: 10 }}>{data.competition.name}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, lineHeight: 1 }}>{data.competition.daysLeft}</div>
            <div style={{ fontWeight: 800, fontSize: 11, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>days left</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontWeight: 700, fontSize: 14 }}>
          <i className="ph-fill ph-trophy" style={{ color: 'var(--sun-400)', fontSize: 20 }} aria-hidden="true" />
          {data.competition.prize}
        </div>
      </Card>

      {/* Members */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{data.players.length} players</div>
          <Button size="sm" variant="secondary" icon="ph-bold ph-link-simple">Invite</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {data.players.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
              <Avatar name={p.name} color={p.color} size="md" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, flex: 1 }}>{p.name}{p.you ? ' (You)' : ''}</span>
              {p.id === 'amber' && <Badge variant="tint" color="var(--green-500)" icon="ph-bold ph-crown-simple">Organizer</Badge>}
            </div>
          ))}
        </div>
      </Card>

      {/* Past competitions */}
      <Card variant="tint" interactive onClick={onViewResults} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sun-100)', color: 'var(--sun-400)', display: 'grid', placeItems: 'center', flex: 'none' }}>
          <i className="ph-fill ph-flag-checkered" style={{ fontSize: 24 }} aria-hidden="true" />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Spring Kickoff</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>Won by Sister Jo · 7 days</div>
        </div>
        <i className="ph-bold ph-caret-right" style={{ color: 'var(--text-muted)', fontSize: 20 }} aria-hidden="true" />
      </Card>

      <Button block variant="gold" size="lg" icon="ph-fill ph-arrow-clockwise" onClick={onRunItBack}>Run it back</Button>
      <div style={{ height: 12 }} />
    </div>
  );
}
window.GroupScreen = GroupScreen;
