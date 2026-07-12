/* Results / celebration — the end-of-competition screenshot-and-share moment. */
function ResultsScreen({ onClose, onRunItBack }) {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { Button, Avatar, Card, Badge } = DS;
  const data = window.VITAL_DATA;
  const ranked = [...data.players].sort((a, b) => b.points - a.points);
  const [winner, second, third] = ranked;

  const superlatives = [
    { icon: 'ph-fill ph-star', color: 'var(--sun-400)', label: 'Most perfect days', who: 'Amber', val: '6 days' },
    { icon: 'ph-fill ph-fire', color: 'var(--flame-500)', label: 'Longest streak', who: 'Sister Jo', val: '11 days' },
    { icon: 'ph-fill ph-drop', color: 'var(--goal-water)', label: 'Hydration champion', who: 'Dad', val: '96% cups' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--evergreen), var(--green-700) 42%, var(--surface-app) 42%)', overflowY: 'auto', zIndex: 30 }}>
      <div style={{ padding: '18px 20px 28px' }}>
        <button onClick={onClose} aria-label="Close" style={{ appearance: 'none', border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', width: 40, height: 40, borderRadius: 999, fontSize: 22, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <i className="ph-bold ph-x" aria-hidden="true" />
        </button>

        <div style={{ textAlign: 'center', color: '#fff', marginTop: 6 }}>
          <div style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)', opacity: 0.9 }}>{data.competition.name} · Final</div>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 18 }}>
            <Avatar name={winner.name} color={winner.color} size="xl" ring />
            <span style={{ position: 'absolute', bottom: -6, right: -6, width: 34, height: 34, borderRadius: 999, background: 'var(--sun-400)', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-md)' }}>
              <i className="ph-fill ph-crown-simple" style={{ color: 'var(--ink-900)', fontSize: 20 }} aria-hidden="true" />
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, marginTop: 12 }}>{winner.name} wins!</div>
          <div style={{ fontWeight: 700, fontSize: 16, opacity: 0.92 }}>{winner.points} points over {data.competition.daysTotal} days</div>
        </div>

        {/* podium standings */}
        <Card style={{ marginTop: 24 }}>
          {ranked.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < ranked.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <span style={{ width: 26, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: i === 0 ? 'var(--sun-400)' : i === 1 ? '#B9BCC2' : i === 2 ? '#CD8B57' : 'var(--text-muted)' }}>{i + 1}</span>
              <Avatar name={p.name} color={p.color} size="sm" />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, flex: 1 }}>{p.name}{p.you ? ' (You)' : ''}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>{p.points}</span>
            </div>
          ))}
        </Card>

        {/* superlatives */}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, margin: '22px 0 12px' }}>Superlatives</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {superlatives.map((s) => (
            <Card key={s.label} pad="sm" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, background: 'color-mix(in srgb, ' + s.color + ' 16%, transparent)', color: s.color, display: 'grid', placeItems: 'center', flex: 'none' }}>
                <i className={s.icon} style={{ fontSize: 22 }} aria-hidden="true" />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{s.label}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)' }}>{s.who} · {s.val}</div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <Button block variant="secondary" icon="ph-bold ph-share-network">Share</Button>
          <Button block variant="gold" icon="ph-fill ph-arrow-clockwise" onClick={onRunItBack}>Run it back</Button>
        </div>
      </div>
    </div>
  );
}
window.ResultsScreen = ResultsScreen;
