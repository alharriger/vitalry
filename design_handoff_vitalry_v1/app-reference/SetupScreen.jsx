/* Competition setup — the organizer flow. Generates an invite link. */
function SetupScreen({ onClose, onLaunch }) {
  const DS = window.VitalryDesignSystem_cc3bad;
  const { Button, TextField, SegmentedControl, Card } = DS;
  const [name, setName] = React.useState('Harriger Fall Streak');
  const [days, setDays] = React.useState('14');
  const [start, setStart] = React.useState('mon');
  const [prize, setPrize] = React.useState('Loser hosts Thanksgiving');
  const [copied, setCopied] = React.useState(false);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-app)', overflowY: 'auto', zIndex: 30 }}>
      <div style={{ padding: '18px 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} aria-label="Back" style={{ appearance: 'none', border: 'none', background: 'var(--surface-sunken)', width: 40, height: 40, borderRadius: 999, fontSize: 22, display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <i className="ph-bold ph-arrow-left" aria-hidden="true" />
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26 }}>New competition</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <TextField label="Name it" icon="ph-bold ph-flag-banner" value={name} onChange={setName} />

          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>How long?</div>
            <SegmentedControl value={days} onChange={setDays} options={[
              { value: '7', label: '7', sublabel: 'days' },
              { value: '14', label: '14', sublabel: 'days' },
              { value: '30', label: '30', sublabel: 'days' },
            ]} />
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>Start</div>
            <SegmentedControl value={start} onChange={setStart} options={[
              { value: 'today', label: 'Today' },
              { value: 'mon', label: 'Next Monday' },
            ]} />
          </div>

          <TextField label="Prize (optional)" icon="ph-bold ph-trophy" value={prize} onChange={setPrize}
            placeholder="Winner picks the restaurant" helper="Shown to everyone — keep it fun, keep it light" />

          <Card variant="tint" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="ph-bold ph-link-simple" style={{ fontSize: 22, color: 'var(--green-600)' }} aria-hidden="true" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Invite link</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>vitalry.app/join/hrgr-fall</div>
            </div>
            <Button size="sm" variant={copied ? 'primary' : 'secondary'} icon={copied ? 'ph-bold ph-check' : 'ph-bold ph-copy'} onClick={() => setCopied(true)}>{copied ? 'Copied' : 'Copy'}</Button>
          </Card>

          <Button block size="lg" variant="primary" icon="ph-fill ph-rocket-launch" onClick={onLaunch}>Start competition</Button>
          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>No app store, no accounts — just share the link</p>
        </div>
      </div>
    </div>
  );
}
window.SetupScreen = SetupScreen;
