import { useEffect, useState } from 'react';
import '../styles/experiments.css';

/** On-device A/B experiments for the top-strip flicker (see experiments.css).
 *  Each toggles one class on <html>; Amber flips them one at a time to find
 *  which stops the flicker on her phone. */
const EXPERIMENTS: { cls: string; label: string }[] = [
  { cls: 'exp-guard', label: 'A · opaque cream bar over the top' },
  { cls: 'exp-nofade', label: 'B · no scrim fade animation' },
  { cls: 'exp-solid', label: 'C · solid scrim (no color-mix)' },
  { cls: 'exp-below', label: 'D · scrim starts 100px down' },
];

/**
 * TEMPORARY on-device diagnostics (Phase 3 status-bar debugging).
 *
 * Renders a tiny build chip pinned above the tab bar; tapping it opens a panel
 * that reports exactly what THIS device sees — build id, whether it's the
 * standalone PWA, the real `env(safe-area-inset-*)` values, viewport size, and
 * whether a (possibly stale) service worker is in control. This turns "still
 * happening" into hard data we can act on. Remove once the top-strip issue is
 * closed.
 */
function readInsets(): { top: string; bottom: string } {
  const cs = getComputedStyle(document.documentElement);
  return {
    top: cs.getPropertyValue('--safe-top').trim() || '?',
    bottom: cs.getPropertyValue('--safe-bottom').trim() || '?',
  };
}

function displayMode(): string {
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari legacy flag for a home-screen web app.
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return standalone ? 'standalone (PWA)' : 'browser tab';
}

function swState(): string {
  const c = navigator.serviceWorker?.controller;
  if (!c) return 'none (not SW-controlled)';
  const file = c.scriptURL.split('/').pop() || c.scriptURL;
  return `controlling: ${file}`;
}

function themeColorMeta(): string {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content ?? '(none)'
  );
}

export function Diagnostics() {
  const [open, setOpen] = useState(false);
  const [insets, setInsets] = useState(readInsets());
  const [exp, setExp] = useState<string | null>(null);

  // Apply exactly one experiment class to <html> at a time (or none).
  function chooseExp(cls: string) {
    const root = document.documentElement;
    EXPERIMENTS.forEach((e) => root.classList.remove(e.cls));
    const next = exp === cls ? null : cls;
    if (next) root.classList.add(next);
    setExp(next);
  }

  // Re-read insets on resize/orientation (they can change with the URL bar).
  useEffect(() => {
    const update = () => setInsets(readInsets());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  const rows: [string, string][] = [
    ['build', `${__BUILD_SHA__} · ${__BUILD_TIME__}`],
    ['mode', displayMode()],
    ['safe-area top', insets.top],
    ['safe-area bottom', insets.bottom],
    ['viewport', `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`],
    ['service worker', swState()],
    ['theme-color', themeColorMeta()],
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setInsets(readInsets());
          setOpen((v) => !v);
        }}
        aria-label="Diagnostics"
        style={{
          position: 'fixed',
          left: 8,
          bottom: 'calc(var(--tabbar-h) + 8px)',
          zIndex: 300,
          font: '600 11px/1 var(--font-body)',
          color: 'var(--text-muted)',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-pill)',
          padding: '5px 9px',
          opacity: 0.85,
        }}
      >
        ⓘ {__BUILD_SHA__}
      </button>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 301,
            background: 'var(--scrim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              background: 'var(--surface-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              boxShadow: 'var(--shadow-xl)',
              font: '500 14px/1.5 var(--font-body)',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-display)' }}>
              Device diagnostics
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: 'var(--text-muted)', padding: '3px 8px 3px 0', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {k}
                    </td>
                    <td style={{ padding: '3px 0', wordBreak: 'break-word', fontWeight: 700 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 14, fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 15 }}>
              Flicker experiments
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 8px' }}>
              Turn ON one at a time, close this, then open/close a breakdown. Tell me
              which letter (if any) stops the flicker.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXPERIMENTS.map((e) => {
                const on = exp === e.cls;
                return (
                  <button
                    key={e.cls}
                    type="button"
                    onClick={() => chooseExp(e.cls)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${on ? 'var(--evergreen)' : 'var(--border-subtle)'}`,
                      background: on ? 'var(--mint-200)' : 'var(--surface-card)',
                      font: '700 13px/1.2 var(--font-body)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                    }}
                  >
                    <span>{e.label}</span>
                    <span style={{ color: on ? 'var(--evergreen)' : 'var(--text-muted)', fontWeight: 800 }}>
                      {on ? 'ON' : 'off'}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              Screenshot the top rows and send them over. Tap outside to close.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
