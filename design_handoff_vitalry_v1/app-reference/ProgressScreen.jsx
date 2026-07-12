/* My Progress — personal, non-comparative. Where self-improvement lives. */
function ProgressScreen() {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { Card, ProgressRing, StreakFlame, Badge } = DS;
  const data = window.VITAL_DATA;
  const you = data.players.find((p) => p.you);

  const dayColor = { p: 'var(--sun-400)', a: 'var(--green-500)', m: 'var(--sand-300)', f: 'var(--cream-200)' };

  return (
    <div>
      <header style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: 'var(--ls-tight)' }}>Your progress</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-secondary)', marginTop: 2 }}>Just for you — no comparisons here</div>
      </header>

      {/* streak + perfect summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <Card variant="tint" pad="sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <StreakFlame count={you.streak} size="lg" />
          <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>Day streak</span>
        </Card>
        <Card variant="tint" pad="sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, color: 'var(--sun-400)', lineHeight: 1 }}>{you.perfectDays}</span>
          <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-caps)' }}>Perfect days</span>
        </Card>
      </div>

      {/* heatmap */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>This competition</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {data.heatmap.map((d, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 10, background: dayColor[d], display: 'grid', placeItems: 'center', color: '#fff' }}>
              {d === 'p' && <i className="ph-fill ph-star" style={{ fontSize: 16 }} aria-hidden="true" />}
              {d === 'a' && <i className="ph-bold ph-check" style={{ fontSize: 15 }} aria-hidden="true" />}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
          <span><i className="ph-fill ph-star" style={{ color: 'var(--sun-400)' }} /> Perfect</span>
          <span><i className="ph-fill ph-check-square" style={{ color: 'var(--green-500)' }} /> Active</span>
          <span><i className="ph-fill ph-square" style={{ color: 'var(--sand-300)' }} /> Missed</span>
        </div>
      </Card>

      {/* per-goal rates */}
      <Card>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 14 }}>How you're doing by goal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.rates.map((r) => (
            <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'color-mix(in srgb, ' + r.color + ' 15%, transparent)', color: r.color, display: 'grid', placeItems: 'center', flex: 'none' }}>
                <i className={r.icon} style={{ fontSize: 19 }} aria-hidden="true" />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, marginBottom: 5 }}>
                  <span>{r.label}</span><span style={{ color: r.color }}>{r.pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                  <div style={{ width: r.pct + '%', height: '100%', borderRadius: 999, background: r.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ height: 12 }} />
    </div>
  );
}
window.ProgressScreen = ProgressScreen;
