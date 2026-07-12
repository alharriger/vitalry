import { Link } from 'react-router-dom';
import { Badge, Card } from '../components';

interface PlaceholderProps {
  /** Screen title. */
  title: string;
  /** Phosphor icon class for the header disc. */
  icon: string;
  /** Category/accent color token. */
  color?: string;
  /** Which build phase delivers this screen. */
  phase: string;
  /** One-line description of what will live here. */
  blurb: string;
  /** Optional back-link (for flow routes shown outside the tab shell). */
  back?: boolean;
}

/**
 * Phase 0 stand-in for a screen not yet built. Establishes the route and a
 * branded empty state so navigation is real and Amber can click the whole app.
 */
export function Placeholder({ title, icon, color = 'var(--evergreen)', phase, blurb, back }: PlaceholderProps) {
  return (
    <div>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <span
          aria-hidden="true"
          style={{
            width: 46, height: 46, borderRadius: 'var(--radius-md)', display: 'grid', placeItems: 'center',
            background: `color-mix(in srgb, ${color} 15%, transparent)`, color,
          }}
        >
          <i className={icon} style={{ fontSize: 26 }} />
        </span>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>{title}</h1>
      </header>

      <Card variant="tint" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
        <Badge color={color} icon="ph-bold ph-hammer">{phase}</Badge>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--lh-normal)' }}>
          {blurb}
        </p>
        {back ? (
          <Link to="/" style={{ marginTop: 'var(--space-2)' }}>← Back to Today</Link>
        ) : null}
      </Card>
    </div>
  );
}
